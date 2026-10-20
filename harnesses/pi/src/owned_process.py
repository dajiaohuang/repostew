"""Windows Pi process-tree owner. Protocol stdout remains untouched.

The target is never released before Job assignment. The Job handle is private,
kill-on-close, and covers descendants. Parent death also closes the Job. A final
receipt separately records whether the entire owned tree stopped. No PID scan.
"""
import argparse
import ctypes
from ctypes import wintypes as w
import json
import os
from pathlib import Path
import subprocess
import sys
import threading
import time

BOOT = r'''
import json,os,subprocess,sys
b=bytearray()
while True:
    c=os.read(0,1)
    if not c: sys.exit(120)
    if c==b'\n': break
    b.extend(c)
sys.exit(subprocess.run(json.loads(b),stdin=sys.stdin.buffer).returncode)
'''

class WindowsJob:
    def __init__(self, process):
        class BASIC(ctypes.Structure):
            _fields_ = [('ProcessTime',ctypes.c_int64),('JobTime',ctypes.c_int64),('Flags',w.DWORD),('MinWS',ctypes.c_size_t),('MaxWS',ctypes.c_size_t),('ActiveLimit',w.DWORD),('Affinity',ctypes.c_size_t),('Priority',w.DWORD),('Scheduling',w.DWORD)]
        class IO(ctypes.Structure):
            _fields_ = [(n,ctypes.c_uint64) for n in ('ReadOps','WriteOps','OtherOps','ReadBytes','WriteBytes','OtherBytes')]
        class EXT(ctypes.Structure):
            _fields_ = [('Basic',BASIC),('Io',IO),('ProcessMemory',ctypes.c_size_t),('JobMemory',ctypes.c_size_t),('PeakProcessMemory',ctypes.c_size_t),('PeakJobMemory',ctypes.c_size_t)]
        class ACCOUNT(ctypes.Structure):
            _fields_ = [('UserTime',ctypes.c_int64),('KernelTime',ctypes.c_int64),('PeriodUser',ctypes.c_int64),('PeriodKernel',ctypes.c_int64),('Faults',w.DWORD),('Total',w.DWORD),('Active',w.DWORD),('Terminated',w.DWORD)]
        self.k = ctypes.WinDLL('kernel32', use_last_error=True)
        signatures = {
            'CreateJobObjectW':([ctypes.c_void_p,w.LPCWSTR],w.HANDLE),
            'SetInformationJobObject':([w.HANDLE,ctypes.c_int,ctypes.c_void_p,w.DWORD],w.BOOL),
            'AssignProcessToJobObject':([w.HANDLE,w.HANDLE],w.BOOL),
            'TerminateJobObject':([w.HANDLE,w.UINT],w.BOOL),
            'QueryInformationJobObject':([w.HANDLE,ctypes.c_int,ctypes.c_void_p,w.DWORD,ctypes.c_void_p],w.BOOL),
            'CloseHandle':([w.HANDLE],w.BOOL),
            'OpenProcess':([w.DWORD,w.BOOL,w.DWORD],w.HANDLE),
            'WaitForSingleObject':([w.HANDLE,w.DWORD],w.DWORD),
        }
        for name,(args,result) in signatures.items():
            fn=getattr(self.k,name); fn.argtypes=args; fn.restype=result
        self.h=self.k.CreateJobObjectW(None,None); self.account=ACCOUNT
        if not self.h: raise ctypes.WinError(ctypes.get_last_error())
        try:
            limits=EXT(); limits.Basic.Flags=0x2000
            if not self.k.SetInformationJobObject(self.h,9,ctypes.byref(limits),ctypes.sizeof(limits)): raise ctypes.WinError(ctypes.get_last_error())
            if not self.k.AssignProcessToJobObject(self.h,w.HANDLE(int(process._handle))): raise ctypes.WinError(ctypes.get_last_error())
        except BaseException:
            self.close(); raise
    def stop(self):
        if not self.k.TerminateJobObject(self.h,125): raise ctypes.WinError(ctypes.get_last_error())
        end=time.monotonic()+5
        while True:
            a=self.account()
            if not self.k.QueryInformationJobObject(self.h,1,ctypes.byref(a),ctypes.sizeof(a),None): raise ctypes.WinError(ctypes.get_last_error())
            if a.Active==0: return True
            if time.monotonic()>=end: return False
            time.sleep(.02)
    def close(self):
        if self.h: self.k.CloseHandle(self.h); self.h=None

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--receipt',required=True); ap.add_argument('--parent',type=int,required=True)
    ap.add_argument('--seconds',type=float,required=True); ap.add_argument('command',nargs=argparse.REMAINDER)
    a=ap.parse_args(); command=a.command[1:] if a.command[:1]==['--'] else a.command
    if os.name!='nt': ap.error('This release requires native Windows Job Objects')
    if not command or a.seconds<=0: ap.error('command and positive timeout required')
    result={'targetReleased':False,'treeStopped':False,'exitCode':None,'reason':'setup-failed'}
    proc=None; job=None; parent=None; started=time.monotonic()
    try:
        proc=subprocess.Popen([sys.executable,'-B','-c',BOOT],stdin=subprocess.PIPE,creationflags=subprocess.CREATE_NO_WINDOW)
        job=WindowsJob(proc)
        parent=job.k.OpenProcess(0x00100000,False,a.parent)
        if not parent: raise ctypes.WinError(ctypes.get_last_error())
        if job.k.WaitForSingleObject(parent,0)!=258: raise RuntimeError('parent already stopped')
        proc.stdin.write(json.dumps(command).encode('utf-8')+b'\n'); proc.stdin.flush()
        result['targetReleased']=True
        def relay():
            try:
                while True:
                    data=os.read(sys.stdin.fileno(),65536)
                    if not data: break
                    proc.stdin.write(data); proc.stdin.flush()
            except (BrokenPipeError,OSError): pass
            finally:
                try: proc.stdin.close()
                except (BrokenPipeError,OSError): pass
        threading.Thread(target=relay,daemon=True).start()
        while proc.poll() is None:
            if job.k.WaitForSingleObject(parent,0)!=258:
                result['reason']='parent-stopped'; break
            if time.monotonic()-started>a.seconds:
                result['reason']='deadline'; break
            time.sleep(.05)
        else:
            result['reason']='exited'; result['exitCode']=proc.returncode
    except BaseException as e:
        result['errorClass']=type(e).__name__
    finally:
        try:
            if job: result['treeStopped']=job.stop()
            elif proc:
                proc.kill(); proc.wait(timeout=5); result['treeStopped']=not result['targetReleased']
            if proc: proc.wait(timeout=5)
        except BaseException as e: result['cleanupErrorClass']=type(e).__name__
        if parent: job.k.CloseHandle(parent)
        if job: job.close()
        result['elapsedSeconds']=round(time.monotonic()-started,3)
        path=Path(a.receipt); temp=path.with_suffix('.tmp')
        with temp.open('w',encoding='utf-8') as f:
            json.dump(result,f); f.flush(); os.fsync(f.fileno())
        os.replace(temp,path)
    return 0 if result['treeStopped'] and result['reason']=='exited' and result['exitCode']==0 else 1

if __name__=='__main__': sys.exit(main())
