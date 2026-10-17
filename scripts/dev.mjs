import {fileURLToPath} from 'node:url';
import {ensureLocalConfig} from './ai-config.mjs';
await ensureLocalConfig();
process.env.CLOUDFLARE_CF_FETCH_ENABLED='false';
process.env.WRANGLER_SEND_METRICS='false';
process.argv=[process.execPath,fileURLToPath(new URL('../node_modules/vinext/dist/cli.js',import.meta.url)),'dev','--port','5173'];
await import(new URL('../node_modules/vinext/dist/cli.js',import.meta.url).href);
