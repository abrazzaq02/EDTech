
Live https://edtech.f23ari02.workers.dev/
EDTech — Mistake to Mastery
Turn your mistakes into mastery.
A focused learning workspace that helps students connect study materials, practice, revision, and exam preparation.

<p align="center">
  <a href="https://edtech.f23ari02.workers.dev/"><strong>Live Demo</strong></a>
  &nbsp;•&nbsp;
  <a href="https://github.com/abrazzaq02/EDTech"><strong>GitHub Repository</strong></a>
</p>

Table of Contents
- Problem Statement
- Proposed Solution
- Key Features
- What Makes EDTech Different
- Technology Stack
- AI Methodology and Implementation
- AI Model and API Usage
- Product Screenshots
- Setup and Installation
- Available Scripts
- Architecture and Data Storage
- Current Development Status
- Team Member Contributions
- Security and Privacy Notes
- Contributing
- License
Problem Statement
Students often manage study notes, question practice, revision, and exam planning across separate tools. When students answer a question incorrectly, the mistake may not be recorded or revisited systematically. This makes it harder to identify knowledge gaps, prioritise revision, and see how learning changes over time.
EDTech is designed to address this fragmented workflow by bringing study materials, practice, mistake review, revision, learning insights, and exam planning into one student workspace.
Proposed Solution
EDTech is an educational technology web application built around a mistake-to-mastery learning loop:
1. Study: use PDF-based learning material as a source for study activities.
2. Practise: test recall with source-based questions and optional AI-generated quizzes.
3. Review: revisit incorrect answers and focus on concepts that need more work.
4. Reinforce: use flashcards and repeat practice to strengthen recall.
5. Reflect and plan: review learning analytics and organise preparation around upcoming exams.
The main study workflow does not depend on generative AI. AI-powered summaries, quiz generation, tutor-style answers, and AI-assisted mistake analysis are optional and require a configured OpenAI API key and available API quota.
Key Features
- PDF-based study workflow — upload study material and extract content for learning activities.
- Source-based practice — practise recalling information from study sources.
- Mistake review — revisit incorrect answers and use errors to guide revision.
- Flashcards — reinforce key information through active recall.
- Learning analytics — review study activity and progress.
- Exam planning — organise revision around upcoming exams.
- Optional AI study tools — generate summaries and quizzes, ask tutor-style questions, and request AI-assisted mistake analysis.
- Flexible workspace storage — use browser-local demo history or a signed workspace backed by Cloudflare D1, depending on the mode.
What Makes EDTech Different
EDTech brings several stages of studying into one connected workflow instead of treating each quiz, flashcard, or study session as an isolated activity. Its central idea is to make mistakes useful: students can revisit incorrect answers, focus on weaker topics, reinforce concepts, and use study insights to plan their next revision session.
The application also separates its core study workflows from optional generative AI. Students can use the core practice and planning experience without configuring an AI provider, while AI features can be enabled when credentials and quota are available.
Technology Stack
Area	Technology
UI framework	React 19, Next.js 16 / Vinext
Language	TypeScript
Build and development	Vite, Vinext
Styling	Tailwind CSS 4
Database	Cloudflare D1
ORM and migrations	Drizzle ORM, Drizzle Kit
Hosting	Cloudflare Workers
Deployment	Wrangler, Cloudflare Vite plugin, GitHub Actions
Forms and validation	React Hook Form, Zod
Charts	Recharts
Code quality and tests	ESLint, TypeScript, Node.js test runner
Package manager	pnpm 11


For exact dependency versions, see [`package.json`](./package.json) and [`pnpm-lock.yaml`](./pnpm-lock.yaml).
AI Methodology and Implementation
EDTech uses a hosted, API-based generative AI workflow for selected study tasks. The application does not require a custom-trained model to support its core learning features.
Workflow
1. Source preparation: study material is uploaded and its content is extracted for use in learning activities.
2. Task selection: the learner requests an AI-supported action, such as a summary, generated quiz, tutor-style answer, or AI-assisted analysis of a mistake.
3. Prompt-based generation: the application sends the relevant task instructions and context to the configured OpenAI model through the OpenAI API.
4. Learning and review: the resulting output supports the learner's study session; students should verify generated explanations against their course materials.
AI is optional
The following AI-supported features require a working API key, model access, and provider quota:
- Generative summaries
- AI-created quizzes
- Tutor-style answers
- AI-assisted mistake analysis
PDF content extraction, source-recall practice, saved workspace functionality, analytics, and exam planning are documented as available without an OpenAI API key.
Implementation note: The repository documents prompt-based use of the OpenAI API and configurable model selection. It does not document custom model training or fine-tuning as part of this project.

AI Model and API Usage
Model
- Default model: gpt-4.1-mini
- Configuration variable: OPENAI_MODEL
- Provider: OpenAI API
- API credential: OPENAI_API_KEY
The model can be changed through OPENAI_MODEL to another model enabled for the configured OpenAI API account. The selected model must be available to that account and compatible with the application's API requests.
Configure AI locally
Run the local setup first, then use the interactive AI setup script:
pnpm run setup:local
pnpm run setup:ai
The AI setup prompts for the API key with hidden terminal input, asks for a model name (defaulting to gpt-4.1-mini), and makes a small API request to check key validity, model access, and quota. The local key is saved privately in .dev.vars by the setup script.
Configure AI for deployment
For a Cloudflare deployment through GitHub Actions:
- Add OPENAI_API_KEY as a GitHub Actions secret.
- Set OPENAI_MODEL as an optional repository variable when a non-default model is required.
- Confirm the selected model is enabled for that API account and has available quota.
AI features remain unavailable when the API key is omitted, invalid, or out of quota. Never commit API keys or populated local environment files.
Product Screenshots
Live application: edtech.f23ari02.workers.dev
I could not verify any checked-in screenshot assets from the repository materials available during this update, so no mock screenshots are included. Before submitting the project for a showcase or evaluation, capture screenshots of the actual running application and add them to docs/screenshots/. Recommended captures:
- dashboard.png — main workspace or home screen
- study-workflow.png — PDF/source study workflow
- quiz-and-mistakes.png — practice questions and mistake review
- analytics-and-planning.png — progress analytics and exam planning
Once those image files are added, embed them here using relative paths, for example:
![EDTech dashboard](docs/screenshots/dashboard.png)
![Study and practice workflow](docs/screenshots/study-workflow.png)
![Quiz and mistake review](docs/screenshots/quiz-and-mistakes.png)
![Learning analytics and exam planning](docs/screenshots/analytics-and-planning.png)
Setup and Installation
Prerequisites
- Node.js 22.13.0 or newer
- pnpm 11
- Git
- An OpenAI API key only if you want to enable generative AI features
1. Clone the repository
git clone https://github.com/abrazzaq02/EDTech.git
cd EDTech
2. Install dependencies
pnpm install
3. Set up the local environment
pnpm run setup:local
The repository includes .env.example as a reference for configuration names. Follow the prompts and instructions from the setup script. Do not commit real credentials or populated environment files.
4. (Optional) Configure AI
pnpm run setup:ai
This step is optional. Skip it to use the core study workflows without generative AI.
5. Start the development server
pnpm run dev
Open the local URL printed in the terminal.
Available Scripts
Command	Description
pnpm run dev	Start the development environment
pnpm run build	Build the application
pnpm run lint	Run ESLint on configured source paths
pnpm run typecheck	Run TypeScript checks without emitting files
pnpm test	Run integration and AI-setup tests
pnpm run setup:local	Set up the local environment
pnpm run setup:ai	Configure and test optional AI access
pnpm run db:generate	Generate database migrations with Drizzle Kit
pnpm run prepare:cloudflare	Prepare the project for Cloudflare deployment


Before submitting changes, run the relevant checks:
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
Architecture and Data Storage
- Frontend and application routes: React / Next.js-compatible application built and served through the repository's Vinext toolchain.
- Deployment runtime: Cloudflare Workers.
- Persistent workspace storage: Cloudflare D1, with Drizzle ORM and migrations.
- Public demo mode: study history stays in the browser.
- Signed workspace mode: workspace data is persisted using the configured signed workspace. The current documented design uses a separate signed guest account per browser and does not provide email-based account recovery.
- AI provider: OpenAI API, enabled only when the API key and model configuration are available.
For production deployment, follow [`DEPLOYMENT.md`](./DEPLOYMENT.md). GitHub Pages is not suitable for this application because it uses server routes.
Current Development Status
Status: Working MVP with a live deployment. EDTech is publicly available on Cloudflare Workers and has a public source repository with application code, database components, setup scripts, tests, and a deployment workflow. It is an actively improvable MVP rather than a claim of a fully mature, production-scale platform. AI features depend on valid provider configuration and quota.
- Live demo: https://edtech.f23ari02.workers.dev/
- Source code: https://github.com/abrazzaq02/EDTech
Team Member Contributions
Contributor	Role / contribution
@abrazzaq02	Repository owner and primary maintainer; responsible for the project's implementation and maintenance as reflected in the public repository.


If additional people contributed to the project, add their GitHub profiles and specific contributions here before submitting the README. Keep this section aligned with the actual division of work.
Security and Privacy Notes
- Never commit OPENAI_API_KEY, DEMO_SIGNING_SECRET, access tokens, or populated local environment files.
- Store production credentials in GitHub Actions secrets or the relevant hosting provider's secret manager.
- Do not publish private workspace records or uploaded study documents in issues or pull requests.
- Public demo mode keeps its history in the browser; persistent saved workspace data is used in the signed workspace mode.
- Treat generated explanations as study assistance and verify important facts against trusted course material.
Contributing
Contributions that improve learning workflows, accessibility, reliability, performance, testing, or documentation are welcome.
1. Fork the repository.
2. Create a focused branch, for example feat/improve-mistake-review.
3. Implement the change and add or update tests where appropriate.
4. Run linting, type checking, tests, and the production build.
5. Open a pull request explaining the motivation, implementation, and validation steps.
For larger changes, open an issue first to discuss the proposed approach.
License
EDTech is distributed under the MIT License. See LICENSE for the full license text.
<p align="center">
  <strong>Learn from the mistake. Return with a better question. Build mastery one session at a time.</strong>
</p>
