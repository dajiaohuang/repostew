import test from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { attachJsonlLineReader } from '../src/pi/jsonl.js';
test('JSONL handles split UTF8, CRLF and embedded Unicode line separators',()=>{
  const records=[];const stream=new PassThrough();const detach=attachJsonlLineReader(stream,x=>records.push(JSON.parse(x)));const bytes=Buffer.from(JSON.stringify({text:'中文\u2028text\u2029end'})+'\r\n'+JSON.stringify({ok:true})+'\n');
  for(const byte of bytes)stream.write(Buffer.from([byte]));assert.deepEqual(records,[{text:'中文\u2028text\u2029end'},{ok:true}]);detach();stream.end();
});
