import vinext from 'vinext';
import {defineConfig} from 'vite';
import {cloudflare} from '@cloudflare/vite-plugin';
import {resolve} from 'node:path';
import {sites} from './build/sites-vite-plugin';

export default defineConfig({
  plugins: [
    vinext(),
    // Local sign-in middleware runs only in development, never in production.
    sites({mockAuth:true}),
    cloudflare({
      viteEnvironment:{name:'rsc',childEnvironments:['ssr']},
      inspectorPort:false,
      config:{
        name:'edtech',
        main:'./build/worker.ts',
        compatibility_date:'2026-05-15',
        compatibility_flags:['nodejs_compat'],
        d1_databases:[{
          binding:'DB',
          database_name:'edtech-local',
          database_id:'00000000-0000-4000-8000-000000000000',
          migrations_dir:resolve('drizzle'),
        }],
      },
    }),
  ],
});
