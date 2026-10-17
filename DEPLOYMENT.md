# GitHub deployment checklist

This repository deploys to **Cloudflare Workers**, with Cloudflare D1 for saved workspaces. GitHub Pages cannot run the app's server routes. The workflow is `.github/workflows/deploy.yml`.

## One-time setup

1. Push this folder to a GitHub repository. Keep the default production branch named `main`.
2. In Cloudflare, create a D1 database with the exact name `edtech`. Copy its database ID.
3. Create a Cloudflare API token for that account with Workers Scripts Edit and D1 Edit permissions.
4. Add these repository secrets in **GitHub → Settings → Secrets and variables → Actions**:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_D1_DATABASE_ID`
   - `DEMO_SIGNING_SECRET` (random value, at least 32 bytes)
   - `OPENAI_API_KEY` (optional)
5. Push to `main`, or manually run the workflow under **Actions**. It checks types, lint, tests, builds, applies D1 migrations and deploys the Worker.
6. Find the public `workers.dev` address in **Cloudflare → Workers & Pages → edtech**.

Generate a signing value in PowerShell (keep the output private):

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set `OPENAI_MODEL` as an optional repository variable, such as `gpt-4.1-mini`. The selected model must be enabled for the API account. If no API key is set, upload extraction, source-recall practice, saved workspace, analytics and exam planning remain available; generative summaries, AI-created quizzes, tutor answers and AI mistake analysis require the key and provider quota.

Do not change `DEMO_SIGNING_SECRET` after deployment unless you intend to sign out existing guest sessions. Each browser gets a separate signed guest account; there is no email-based account recovery. Uploaded PDF contents and workspace records are stored only when a student uses the signed-in workspace. Public demo mode keeps its history in that browser.
