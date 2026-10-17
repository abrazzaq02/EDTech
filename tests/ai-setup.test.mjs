import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mergeValues,readValues,validateApiKey} from '../scripts/ai-config.mjs';
test('saving an API key preserves unrelated local settings',()=>{
 const output=mergeValues('DEMO_SIGNING_SECRET="existing-local-secret"\nOPENAI_API_KEY="old"\n',{OPENAI_API_KEY:'test-placeholder',OPENAI_MODEL:'gpt-4.1-mini'});
 const values=readValues(output);assert.equal(values.DEMO_SIGNING_SECRET,'existing-local-secret');assert.equal(values.OPENAI_API_KEY,'test-placeholder');assert.equal(output.match(/OPENAI_API_KEY=/g).length,1);
});
test('configuration rejects newline injection',()=>assert.throws(()=>mergeValues('',{OPENAI_API_KEY:'invalid\nOTHER=value'})));
test('provider access is checked before reporting success',async()=>{let called=false;await validateApiKey('test-placeholder','test-model',async(_url,options)=>{called=true;assert.equal(JSON.parse(options.body).model,'test-model');return Response.json({choices:[{message:{content:'OK'}}]})});assert.ok(called)});
test('invalid provider keys get an actionable error',async()=>assert.rejects(validateApiKey('invalid','model',async()=>new Response('',{status:401})),/rejected/));
test('missing quota is not disguised as a working connection',async()=>assert.rejects(validateApiKey('test','model',async()=>new Response('',{status:429})),/quota/));
