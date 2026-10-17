# EDTech

A student learning workspace for PDF notes, source-based quizzes, mistake review, flashcards, analytics and exam planning.

## Put it live from GitHub

The included GitHub Action tests and deploys the app to Cloudflare Workers whenever you push to `main`. GitHub Pages cannot run this app's server APIs or database.

1. Extract this ZIP. Create a GitHub repository named `edtech`, then push the extracted project folder to its `main` branch.
2. In Cloudflare, create a **D1 database named `edtech`** and copy its database ID. Create an API token with **Workers Scripts: Edit** and **D1: Edit** access for the same account.
3. In GitHub, open **Settings → Secrets and variables → Actions → New repository secret**. Add:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_D1_DATABASE_ID`
   - `DEMO_SIGNING_SECRET` — generate a private value in PowerShell with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `OPENAI_API_KEY` — optional; add your own API key to enable live AI
4. Push a commit to `main`, or open **Actions → Test and deploy EDTech → Run workflow**. On success, open the `edtech` Worker URL in the Cloudflare dashboard.

The project already includes the deployment workflow, database migration step, server-side secret setup and build/test checks. Keep all keys in GitHub Secrets; never add them to source files. If `OPENAI_API_KEY` is missing, the source-based practice still works and AI is clearly shown as unavailable. ChatGPT Plus does not include OpenAI API usage or quota.

Cloudflare provides the public Worker hosting and D1 database. Each browser gets a separate signed guest workspace; clearing its browser cookie loses access to that guest workspace. The signing secret must stay the same between deployments to keep sessions valid.

## Run locally in VS Code

Requires Node.js 22.13+ and pnpm 11.25.0. In PowerShell, from this folder:

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:5173>. To configure local D1 and optionally enter your own OpenAI key, run `pnpm setup:local`, then `pnpm dev`. The key is checked before being stored in the ignored `.dev.vars` file. Never upload that file.

## Verify

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The tests use mock provider responses and do not verify a real OpenAI account, quota, or a Cloudflare deployment. Scanned-PDF OCR and handwriting grading are not included.

Original application code is MIT-licensed. Vendored PDF.js, fonts and the local sign-in plugin include their own license notices.
