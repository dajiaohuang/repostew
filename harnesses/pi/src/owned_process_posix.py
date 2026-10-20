"""POSIX owned process group. Escaping/daemonized descendants are NOT contained.

Never translate groupStopped into treeStopped: native full-tree containment is
still required before the engine may release a project's writer reservation.
"""
import argparse
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import time


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--receipt', required=True)
    ap.add_argument('--parent', type=int, required=True)
    ap.add_argument('--seconds', type=float, required=True)
    ap.add_argument('command', nargs=argparse.REMAINDER)
    a = ap.parse_args()
    command = a.command[1:] if a.command[:1] == ['--'] else a.command
    if os.name != 'posix' or not command or a.seconds <= 0:
        ap.error('POSIX, command and positive timeout required')
    result = dict(targetReleased=False, treeStopped=False, groupStopped=False,
                  containment='posix-process-group', exitCode=None, reason='setup-failed')
    proc = None
    stopping = False

    def stop(_sig, _frame):
        nonlocal stopping
        stopping = True

    for sig in (signal.SIGINT, signal.SIGTERM, signal.SIGHUP):
        signal.signal(sig, stop)
    started = time.monotonic()
    try:
        if os.getppid() != a.parent:
            raise RuntimeError('parent identity changed')
        proc = subprocess.Popen(command, start_new_session=True)
        result['targetReleased'] = True
        while proc.poll() is None:
            if stopping:
                result['reason'] = 'stop'; break
            if os.getppid() != a.parent:
                result['reason'] = 'parent-stopped'; break
            if time.monotonic() - started >= a.seconds:
                result['reason'] = 'deadline'; break
            time.sleep(.05)
        else:
            result['reason'] = 'exited'; result['exitCode'] = proc.returncode
    except BaseException as e:
        result['errorClass'] = type(e).__name__
    finally:
        if proc:
            try:
                # The group ID comes only from the child we created with setsid.
                try: os.killpg(proc.pid, signal.SIGKILL)
                except ProcessLookupError: pass
                proc.wait(timeout=5)
                end = time.monotonic() + 5
                while time.monotonic() < end:
                    try: os.killpg(proc.pid, 0)
                    except ProcessLookupError:
                        result['groupStopped'] = True; break
                    time.sleep(.05)
            except BaseException as e:
                result['cleanupErrorClass'] = type(e).__name__
        else:
            result['treeStopped'] = True
        result['elapsedSeconds'] = round(time.monotonic() - started, 3)
        path = Path(a.receipt); temp = path.with_suffix('.tmp')
        with temp.open('w', encoding='utf-8') as f:
            json.dump(result, f); f.flush(); os.fsync(f.fileno())
        os.replace(temp, path)
    return 0 if result['groupStopped'] and result['exitCode'] == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
