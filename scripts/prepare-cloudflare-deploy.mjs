import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const configPath = resolve('dist/server/wrangler.json');
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
if (!databaseId || !/^[0-9a-f-]{36}$/i.test(databaseId)) {
  throw new Error('Set the GitHub Actions secret CLOUDFLARE_D1_DATABASE_ID to your Cloudflare D1 database ID.');
}

const config = JSON.parse(await readFile(configPath, 'utf8'));
const binding = config.d1_databases?.find((item) => item.binding === 'DB');
if (!binding) throw new Error('The built Worker does not contain the required D1 binding named DB.');
binding.database_name = 'edtech';
binding.database_id = databaseId;
binding.migrations_dir = resolve('drizzle');
config.name = 'edtech';
config.workers_dev = true;
config.vars = {
  ...(config.vars || {}),
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  EDTECH_TRUST_PLATFORM_AUTH: 'false',
};
await writeFile(configPath, `${JSON.stringify(config)}\n`);
console.log('Cloudflare Worker configuration is ready.');
