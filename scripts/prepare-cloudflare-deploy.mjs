import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const configPath = resolve('dist/server/wrangler.json');
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
if (!databaseId || !/^[0-9a-f-]{36}$/i.test(databaseId)) {
  throw new Error('Set the GitHub Actions secret CLOUDFLARE_D1_DATABASE_ID to your Cloudflare D1 database ID.');
}

const route = (process.env.CLOUDFLARE_ROUTE || '').trim();
const config = JSON.parse(await readFile(configPath, 'utf8'));
const binding = config.d1_databases?.find((item) => item.binding === 'DB');
if (!binding) throw new Error('The built Worker does not contain the required D1 binding named DB.');

binding.database_name = 'edtech';
binding.database_id = databaseId;
binding.migrations_dir = resolve('drizzle');
config.name = 'edtech';

if (route) {
  config.route = route;
  config.routes = Array.from(new Set([...(config.routes || []), route]));
  config.workers_dev = false;
} else if (config.route || config.routes?.length) {
  config.workers_dev = false;
} else {
  // No explicit route configured. Fall back to workers_dev to allow deployments against a
  // registered workers.dev subdomain (or local testing) rather than failing the job here.
  // To deploy to a custom domain route, set the GitHub Actions secret CLOUDFLARE_ROUTE (e.g. "example.com/*").
  console.warn('No deployment route is configured. Defaulting to workers_dev = true. To use a custom route, set the CLOUDFLARE_ROUTE secret.');
  config.workers_dev = true;
}

config.vars = {
  ...(config.vars || {}),
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  EDTECH_TRUST_PLATFORM_AUTH: 'false',
};

await writeFile(configPath, `${JSON.stringify(config)}\n`);
console.log('Cloudflare Worker configuration is ready.');
