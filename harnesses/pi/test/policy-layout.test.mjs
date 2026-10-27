import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/config.mjs';
import { instructions } from '../src/prompts.mjs';

test('example configuration loads both role contracts from the sibling Skill', () => {
  const config = loadConfig(fileURLToPath(new URL('../config.example.json', import.meta.url)));
  for (const role of ['coordinator', 'worker']) {
    const prompt = instructions(config, role, { systemPrompt: 'Layout integration check' });
    assert.match(prompt, /1\. Object and outcome/);
    assert.match(prompt, role === 'coordinator' ? /Record outcomes/ : /Six steps/);
  }
});
