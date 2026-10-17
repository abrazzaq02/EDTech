import {randomBytes} from 'node:crypto';
import {readFile,writeFile,chmod} from 'node:fs/promises';

export function readValues(text){
  const values={};
  for(const line of text.split(/\r?\n/)){
    const match=line.match(/^([A-Z_]+)=(.*)$/);
    if(!match)continue;
    try{values[match[1]]=JSON.parse(match[2])}catch{values[match[1]]=match[2].trim()}
  }
  return values;
}
export function mergeValues(text,updates){
  const keys=new Set(Object.keys(updates));
  const kept=text.split(/\r?\n/).filter(line=>!keys.has(line.split('=')[0])).filter(Boolean);
  for(const [key,value] of Object.entries(updates)){
    if(!/^[A-Z_]+$/.test(key)||/[\r\n]/.test(value))throw new Error('Invalid configuration value.');
    kept.push(`${key}=${JSON.stringify(value)}`);
  }
  return kept.join('\n')+'\n';
}
export async function ensureLocalConfig(updates={}){
  let text='';
  try{text=await readFile('.dev.vars','utf8')}catch(error){if(error.code!=='ENOENT')throw error}
  const current=readValues(text);
  if(!current.DEMO_SIGNING_SECRET&&!updates.DEMO_SIGNING_SECRET)updates.DEMO_SIGNING_SECRET=randomBytes(32).toString('hex');
  await writeFile('.dev.vars',mergeValues(text,updates),{mode:0o600});
  try{await chmod('.dev.vars',0o600)}catch{/* Windows controls access through its own file permissions. */}
}
export async function validateApiKey(key,model,fetcher=fetch){
  if(!key||/[\r\n]/.test(key))throw new Error('Enter a valid key without line breaks.');
  const response=await fetcher('https://api.openai.com/v1/chat/completions',{
    method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
    signal:AbortSignal.timeout(30000),
    body:JSON.stringify({model,messages:[{role:'user',content:'Reply OK.'}],max_tokens:8}),
  });
  if(response.status===401)throw new Error('The API key was rejected. Check that you copied the correct key.');
  if(response.status===429)throw new Error('The API quota or rate limit was reached. Check API billing and quota.');
  if(response.status===403)throw new Error('The provider denied access. Check your account and network restrictions.');
  if(response.status===404)throw new Error('This model is not available to your account. Choose an available chat model.');
  if(!response.ok)throw new Error(`The provider returned HTTP ${response.status}. No key was saved.`);
  const json=await response.json();
  if(!json.choices?.[0]?.message?.content)throw new Error('The provider returned an unexpected response.');
}
