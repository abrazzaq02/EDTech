import {createInterface} from 'node:readline/promises';
import {Writable} from 'node:stream';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {ensureLocalConfig,readValues,validateApiKey} from './ai-config.mjs';

async function privateInput(prompt){
  if(!process.stdin.isTTY)throw new Error('Run this command in your VS Code terminal. Do not pass your key as a command argument.');
  const silentOutput=new Writable({write(_chunk,_encoding,done){done()}});
  const terminal=createInterface({input:process.stdin,output:silentOutput,terminal:true});
  process.stdout.write(prompt);
  try{return (await terminal.question('')).trim()}
  finally{terminal.close();process.stdout.write('\n')}
}
export async function setupAI(){
  await ensureLocalConfig();
  const current=readValues(await readFile('.dev.vars','utf8'));
  console.log('Enter your own OpenAI API key below. Input is hidden and never printed.');
  console.log('A small real API request will check the key, model access and available quota.');
  console.log('Press Enter without a key to keep source-based practice only.');
  const key=await privateInput('OpenAI key (hidden): ');
  if(!key){console.log(current.OPENAI_API_KEY?'Existing key preserved.':'No key added. Generative AI remains off; practice still works.');return}
  const prompt=createInterface({input:process.stdin,output:process.stdout});
  let model;
  try{model=(await prompt.question('Model [gpt-4.1-mini]: ')).trim()||'gpt-4.1-mini'}finally{prompt.close()}
  console.log('Checking provider access…');
  await validateApiKey(key,model);
  await ensureLocalConfig({OPENAI_API_KEY:key,OPENAI_MODEL:model});
  console.log('API test passed. Key saved privately in .dev.vars. Restart pnpm dev to apply it.');
  console.log('For AI features, open /learn after pnpm setup:local completes.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  setupAI().catch(error=>{console.error(error.message);process.exitCode=1});
}
