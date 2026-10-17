import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {setupAI} from './setup-ai.mjs';
function run(file,args){
  const result=spawnSync(process.execPath,[fileURLToPath(new URL(file,import.meta.url)),...args],{stdio:'inherit',env:{...process.env,CLOUDFLARE_CF_FETCH_ENABLED:'false',WRANGLER_SEND_METRICS:'false'}});
  if(result.error)throw result.error;
  if(result.status!==0)throw new Error('Setup stopped because the command above failed.');
}
try{
  await setupAI();
  run('../node_modules/vinext/dist/cli.js',['build']);
  run('../node_modules/wrangler/bin/wrangler.js',['d1','migrations','apply','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state']);
  console.log('Ready. Run pnpm dev, open http://localhost:5173/learn and use the local sign-in link.');
}catch(error){console.error(error.message);process.exitCode=1}
