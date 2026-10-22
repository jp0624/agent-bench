# Agent Bench · Evaluation Studio

A Next.js, TypeScript and Tailwind CSS workspace for inspecting coding-task evaluation evidence. Dark graphite and violet by default, with a persistent light theme and responsive layouts.

## What works

- Three suites, 12 tasks and 48 inspectable assertions.
- Three deterministic reference agents: Atlas, Swift and Baseline. Their fixed implementations intentionally differ in edge-case coverage.
- A Next.js POST endpoint executes selected reference implementations and measures the actual assertion outcomes and elapsed execution time.
- Task-level inspector with inputs, expected output, actual output, exception details and a failures-only filter.
- Run history (last 30 records in browser storage), same-suite comparisons and assertion deltas.
- JSON export/import with structural validation and CSV summaries.
- Searchable task library, keyboard-accessible native dialogs, responsive views and reduced-motion support.

## Run locally

Requires Node.js 24.

```sh
npm ci
npm run dev
npm test
npm run build
npm start
```

Deploy using Vercel's Next.js preset. No credentials, database or paid model calls are needed.

## Architecture

`src/lib/catalog.ts` defines suites, tasks, reference agents and expected values. `src/lib/engine.ts` holds bounded reference candidates, exact output comparison and run validation. `src/app/api/evaluations/route.ts` validates requests before invoking the engine. The initial server render performs a measured core-suite comparison; subsequent evaluations use the API. React components own navigation, inspection, exports and local history.

The API accepts `{ "name": "Core check", "suite": "core", "agents": ["atlas", "swift"] }`. Suites are `core`, `data`, `reliability`. Only registered candidates can execute; submitted source code is never evaluated.

## Interpreting the evidence

These are reference implementations, not live AI providers. No LLM is called, and inference cost is therefore marked not applicable. The project demonstrates evaluation infrastructure and failure analysis. It does not claim to measure a commercial model's capabilities.

Each result contains the actual checks and measured timing for that request. Timings cover candidate execution, input cloning and assertion comparison. A single request is not a controlled performance benchmark. Tests are a visible fixed suite, not hidden holdout coverage.

Imported records are marked imported; their supplied outcomes are not independently verified. The v1 format supports the registered task and agent IDs. Export a measured run for a valid template; external producers can supply results for the same contracts. Each agent must include all four tasks and four checks per task. Task and agent totals must match the checks. Imports are limited to 1 MB.

Run history is local to the browser, without account sync or shared persistence. Export JSON to keep durable copies. Stored records are validated again when restored.

## Next extensions

Provider adapters with server-managed credentials, isolated execution for generated candidates, private holdout suites, repeated timing samples, token/cost telemetry, authenticated shared storage and CI regression gates would extend the reference implementation into a full agent evaluation service.

## Visual asset

`public/images/evaluation-lab.webp` is original AI-generated conceptual artwork, created with the built-in image-generation tool and optimized to WebP. Prompt: a premium precision test laboratory with three parallel titanium compute modules, smoked-glass inspection gates and violet/ice-blue optical beams; wide composition with quiet dark space for the headline; no text or logos. It is decorative, not a technical diagram.
