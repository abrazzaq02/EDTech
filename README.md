
Live https://edtech.f23ari02.workers.dev/
EDTech — Mistake to Mastery
<p align="center">
  <strong>A focused learning workspace for turning practice into progress.</strong>
  <br />
  <a href="https://edtech.f23ari02.workers.dev/">Live Demo</a> ·
  <a href="https://github.com/abrazzaq02/EDTech">GitHub Repository</a>
</p>

Overview
EDTech is a student learning workspace built around a simple idea: mistakes are part of learning. It brings study materials, source-based practice, revision, and exam preparation together so learners can identify what they need to review and return to it with purpose.
The application supports PDF-based study workflows, source-recall practice, flashcards, mistake review, analytics, and exam planning. It can also use AI-powered features when an OpenAI API key and available provider quota are configured.
Key Features
- PDF study workflow — work with uploaded study material and extract content for learning activities.
- Source-based practice — practise recalling information from study sources.
- Mistake review — revisit incorrect answers and use them to guide revision.
- Flashcards — reinforce concepts through active recall.
- Learning analytics — review study activity and progress.
- Exam planning — organise revision around upcoming exams.
- Workspace storage — use browser-local demo history or a signed workspace backed by Cloudflare D1, depending on the mode.
- Optional AI tools — generate summaries and quizzes, ask tutor-style questions, and use AI-assisted mistake analysis when AI configuration is available.
AI availability: Core study workflows—including source-recall practice, saved workspace, analytics, and exam planning—remain available without an OpenAI API key. Generative summaries, AI-created quizzes, tutor answers, and AI mistake analysis require an API key and available provider quota.

Live Demo
Launch EDTech
The public application is deployed on Cloudflare Workers. In public demo mode, history remains in the browser. Saved workspace data is stored when a learner uses the signed workspace. Each browser receives a separate signed guest account; there is no email-based account recovery.
Technology Stack
Area	Technologies
UI framework	React 19, Next.js 16 / Vinext
Language	TypeScript
Build and development	Vite, Vinext
Styling	Tailwind CSS 4
Database	Cloudflare D1
ORM and migrations	Drizzle ORM, Drizzle Kit
Hosting	Cloudflare Workers
Deployment	Wrangler, Cloudflare Vite plugin, GitHub Actions
Validation and forms	Zod, React Hook Form
Visualisation	Recharts
Quality checks	ESLint, TypeScript, Node.js test runner


For exact dependency versions, refer to [`package.json`](./package.json) and [`pnpm-lock.yaml`](./pnpm-lock.yaml).
Getting Started
Prerequisites
- Node.js 22.13.0 or newer
- pnpm 11 (the package manager declared by this repository)
- Git
1. Clone the repository
git clone https://github.com/abrazzaq02/EDTech.git
cd EDTech
2. Install dependencies
pnpm install
3. Configure the local environment
Create your local environment file from the provided example:
cp .env.example .env
On Windows PowerShell:
Copy-Item .env.example .env
Review .env.example and the setup scripts to determine which values are needed for your chosen environment. Never commit real API keys, tokens, or populated environment files.
4. Run local setup
pnpm run setup:local
To configure optional AI functionality, run:
pnpm run setup:ai
Follow the prompts produced by the setup scripts. AI features require a valid OpenAI API key and may also depend on the account's model access and quota.
5. Start the development server
pnpm run dev
Open the local address printed in your terminal.
Available Commands
Command	Description
pnpm run dev	Start the development environment
pnpm run build	Build the application
pnpm run lint	Run ESLint on configured source paths
pnpm run typecheck	Run TypeScript checks without emitting files
pnpm test	Run integration and AI-setup tests
pnpm run db:generate	Generate database migrations with Drizzle Kit
pnpm run setup:local	Configure the local environment
pnpm run setup:ai	Configure optional AI functionality
pnpm run prepare:cloudflare	Prepare the project for Cloudflare deployment


Before submitting changes, run the checks relevant to your contribution:
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
Deployment
EDTech is designed to deploy to Cloudflare Workers, with Cloudflare D1 for saved workspaces. GitHub Pages is not suitable because the application uses server routes.
The repository includes a [GitHub Actions deployment workflow](./.github/workflows/deploy.yml) and a dedicated [`DEPLOYMENT.md`](./DEPLOYMENT.md) checklist.
Required Cloudflare setup
1. Create a Cloudflare D1 database named edtech and note its database ID.
2. Create a Cloudflare API token with Workers Scripts Edit and D1 Edit permissions.
3. Add the following repository secrets in GitHub → Settings → Secrets and variables → Actions:
   - CLOUDFLARE_ACCOUNT_ID
   - CLOUDFLARE_API_TOKEN
   - CLOUDFLARE_D1_DATABASE_ID
   - DEMO_SIGNING_SECRET — use a random value of at least 32 bytes
   - OPENAI_API_KEY — optional, for AI features
4. Push to main or manually run the deployment workflow from GitHub Actions.
5. Check Cloudflare Workers & Pages for the deployed workers.dev URL.
A signing secret can be generated locally with Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Keep the generated value private. Do not change DEMO_SIGNING_SECRET after deployment unless you intend to invalidate existing guest sessions. For additional details, read [`DEPLOYMENT.md`](./DEPLOYMENT.md).
Project Structure
EDTech/
├── .github/workflows/  # CI/CD and deployment workflows
├── app/                # Application routes and pages
├── components/         # Reusable UI components
├── db/                 # Database schema and related logic
├── drizzle/            # Database migration files
├── lib/                # Shared application logic
├── public/             # Static assets
├── scripts/            # Local setup and deployment helpers
├── tests/              # Integration and setup tests
├── vendor/             # Vendored dependencies or supporting code
├── .env.example        # Example environment configuration
├── DEPLOYMENT.md       # Cloudflare deployment guide
├── package.json        # Scripts and dependencies
└── README.md
Contributing
Contributions that improve the learning experience, accessibility, reliability, performance, or documentation are welcome.
1. Fork the repository.
2. Create a focused branch: git checkout -b feat/your-change.
3. Make your changes and add or update tests where appropriate.
4. Run linting, type checking, tests, and the production build as applicable.
5. Commit with a clear, descriptive message.
6. Open a pull request describing the motivation, implementation, and validation steps.
For significant changes, open an issue first to discuss the proposed approach.
Security
- Keep API keys and deployment secrets out of source control.
- Store production credentials in GitHub Actions secrets or the relevant provider's secret manager.
- Do not publish real user data, uploaded study documents, or private workspace information in issues or pull requests.
- Report security concerns privately to the repository maintainer rather than posting exploitable details publicly.
License
This project is licensed under the MIT License. See LICENSE for details.
<p align="center">
  <em>Learn from the mistake. Return with a better question. Build mastery one session at a time.</em>
</p>
