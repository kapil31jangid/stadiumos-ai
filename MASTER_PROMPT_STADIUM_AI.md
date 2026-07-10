# MASTER PROMPT — StadiumSense AI
### Paste this entire file into Antigravity as your first message. Then follow the phased prompts at the bottom, one at a time, committing after each phase.

---

## 0. How To Use This Document

1. Clone your empty public GitHub repo inside Antigravity first.
2. Paste **Section 1–8** as your opening prompt (project brief + constraints). Antigravity will scaffold the repo.
3. Then paste each block in **Section 9 (Phased Build Prompts)** one at a time, in order, letting Antigravity finish and commit before moving to the next.
4. Do not paste all phases at once — GenAI code assistants produce cleaner, more testable code when scoped narrowly per turn. This also gives you natural commit checkpoints.

---

## 1. Project Identity

**Name:** StadiumSense AI
**Event:** FIFA World Cup 2026
**Chosen Vertical:** Fan Navigation & Crowd Management (single vertical, per challenge rules)
**Persona:** "The Fan" — a ticket-holder inside or approaching the stadium on match day.

**Design principle (read this before writing any code):**
This is **one persona with one decision engine**, not four separate features bolted together. Accessibility needs and language are *context parameters* the engine reasons over — they are not separate verticals. Every GenAI call takes a single `FanContext` object (location, mobility constraints, preferred language, ticket zone, time-to-kickoff) and returns one decision: **where this fan should go right now, and why.** Multilingual delivery and accessibility-aware routing are properties of that one decision, not separate subsystems. This framing must be explicit in the README so evaluators see one coherent vertical, not scope creep.

---

## 2. The Core Problem

On match day, fans face:
- Not knowing the fastest **safe** route to their seat/gate given real-time crowd density
- Accessibility routes (ramps, elevators, low-sensory zones) buried in generic maps
- Safety/wayfinding instructions only available in English or Spanish, not the fan's language
- Volunteers/stewards unable to answer "where do I go" at scale during peak ingress

**StadiumSense AI** solves this with a single GenAI-powered decision engine (Gemini via Vertex AI) that ingests real-time simulated crowd-density data + the fan's context, and returns a natural-language, multilingual, accessibility-aware navigation decision — instantly.

---

## 3. Core Logic (the "brain")

```
FanContext {
  fan_id, current_zone, destination_gate, ticket_category,
  mobility_needs: enum[none, wheelchair, limited_mobility, sensory_sensitive],
  preferred_language: ISO code,
  time_to_kickoff_minutes
}
        │
        ▼
CrowdSnapshot (simulated real-time feed)
{ zone_id, density_pct, incident_flags[], gate_wait_minutes }
        │
        ▼
   [Decision Engine — Gemini via Vertex AI, function-calling]
        │
        ├─ Reads FanContext + live CrowdSnapshot for relevant zones
        ├─ Applies deterministic guardrails FIRST (hard rules, not LLM):
        │     - never route through a zone flagged "incident"
        │     - if mobility_needs != none → only accessible-tagged routes eligible
        │     - if density_pct > 85 on primary route → force reroute
        ├─ Gemini then reasons over the *filtered* candidate routes to produce:
        │     - a ranked recommendation with plain-language reasoning
        │     - translated instructions (Cloud Translation) in preferred_language
        │     - an optional spoken version (Text-to-Speech) for accessibility
        ▼
NavigationResponse { route_steps[], eta, reasoning, audio_url, alerts[] }
```

**Why guardrails run before the LLM, not inside it:** safety-critical routing decisions (never route through an incident zone) must be deterministic and testable — not dependent on prompt phrasing. Gemini is used for reasoning/explanation/translation quality, not for the safety-critical filtering itself. Call this out explicitly in your README under "Security" — evaluators specifically score responsible GenAI use.

---

## 4. GCP Services Used (map each to a real function, don't add services for padding)

| Service | Purpose |
|---|---|
| **Vertex AI (Gemini 2.5 Flash)** | Core reasoning engine — route explanation, function calling over guardrail-filtered candidates |
| **Cloud Run** | Hosts the single FastAPI container (API + serves built frontend) |
| **Firestore** | Stores FanContext sessions, CrowdSnapshot documents, gate/zone metadata |
| **Cloud Translation API** | Multilingual instruction output |
| **Text-to-Speech API** | Spoken navigation for accessibility (visually impaired / low-literacy fans) |
| **Cloud Pub/Sub** | Simulated real-time crowd-density event stream feeding Firestore |
| **BigQuery** | Analytics sink for operator dashboard (crowd trends, reroute frequency) |
| **Secret Manager** | API keys / service account credentials — never hardcoded |
| **Cloud Storage** | Static stadium map assets, generated TTS audio files |
| **Cloud Logging + Cloud Monitoring** | Request tracing, latency SLOs, error alerting |

This list should appear near the top of your README as a table — it's a direct "Problem Statement Alignment" and "Efficiency" signal for evaluators.

---

## 5. Tech Stack

- **Backend:** FastAPI (Python 3.12), Pydantic v2 for strict schema validation, `google-cloud-aiplatform`, `google-cloud-firestore`, `google-cloud-translate`, `google-cloud-texttospeech`, `google-cloud-pubsub`, `google-cloud-bigquery`
- **Frontend:** React + Vite + JavaScript + Tailwind (built as static assets, served by FastAPI via `StaticFiles` — one container, one Cloud Run service, keeps repo/deploy simple and cheap)
- **Testing:** `pytest` + `pytest-asyncio` + `httpx` for API tests; Vitest for frontend unit tests
- **CI:** GitHub Actions → lint + test on push (keeps repo evaluator-friendly, shows "Testing" rigor)

---

## 6. Repository Structure

```
stadiumsense-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, mounts static frontend
│   │   ├── routers/
│   │   │   ├── navigation.py       # POST /api/navigate
│   │   │   └── operator.py         # GET /api/operator/crowd-summary
│   │   ├── core/
│   │   │   ├── guardrails.py       # deterministic safety filtering (unit-tested)
│   │   │   ├── gemini_client.py    # Vertex AI wrapper, function-calling schema
│   │   │   ├── translation.py
│   │   │   └── tts.py
│   │   ├── models/
│   │   │   └── schemas.py          # Pydantic: FanContext, CrowdSnapshot, NavigationResponse
│   │   ├── services/
│   │   │   ├── firestore_service.py
│   │   │   ├── pubsub_simulator.py # generates fake live crowd events for demo
│   │   │   └── bigquery_service.py
│   │   └── config.py               # env-based settings, no hardcoded secrets
│   ├── tests/
│   │   ├── test_guardrails.py
│   │   ├── test_navigation_api.py
│   │   └── test_translation.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/ (MapView, RouteCard, LanguageSelector, AccessibilityToggle)
│   │   ├── pages/ (FanApp.jsx, OperatorDashboard.jsx)
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── .github/workflows/ci.yml
├── .gitignore
├── .dockerignore
├── cloudbuild.yaml
├── README.md
└── LICENSE
```

---

## 7. Hard Constraints (do not violate)

- Repository **must stay under 10 MB** → `.gitignore` node_modules, venv, `dist/`, `*.pyc`, audio sample files; never commit `frontend/node_modules` or built `dist/` (Cloud Run build step regenerates it)
- **Single branch only** (`main`) — do not create feature branches, just commit directly with clear messages
- **Public repo**
- **No API keys or service account JSON committed** — use `.env.example` only, real values via Secret Manager / Cloud Run env vars at deploy time
- Max 3 submission attempts — get the repo right before final push

---

## 8. Security & Testing Requirements (explicit, for evaluator visibility)

- All Pydantic models use strict typing — reject malformed input at the boundary
- Guardrail logic (`guardrails.py`) is 100% deterministic and has dedicated unit tests with no LLM call involved — this is your strongest "Security" evidence
- Gemini function-calling schema constrains output to a fixed JSON shape — no freeform unvalidated LLM output reaches the frontend
- Rate limiting on `/api/navigate` (simple in-memory or Firestore-backed token bucket) to prevent abuse
- No PII stored beyond a session-scoped `fan_id` (no names, no ticket numbers)
- `pytest` coverage on guardrails, API contract, and translation fallback (what happens if Translation API fails — must degrade to English, not crash)

---

## 9. Phased Build Prompts (paste into Antigravity one at a time)

**Phase 1 — Scaffold**
> Scaffold the repo structure exactly as defined in Section 6. Create backend FastAPI skeleton with health check endpoint, Pydantic schemas for FanContext/CrowdSnapshot/NavigationResponse, and empty frontend Vite+React+JS+Tailwind project. Add .gitignore, .dockerignore, requirements.txt, .env.example. Do not implement business logic yet.

**Phase 2 — Guardrails + Firestore**
> Implement `guardrails.py` with the deterministic rules from Section 3 (incident-zone exclusion, mobility-based filtering, density-based forced reroute). Implement `firestore_service.py` with seed data for 8 stadium zones and gates. Write full pytest coverage for guardrails before moving on.

**Phase 3 — Gemini Decision Engine**
> Implement `gemini_client.py` using Vertex AI Python SDK with function-calling, so Gemini only reasons over guardrail-filtered candidate routes and returns structured JSON matching NavigationResponse. Include a graceful fallback (return best guardrail-filtered route with a generic message) if the Gemini call fails or times out.

**Phase 4 — Multilingual + Accessibility Output**
> Implement `translation.py` (Cloud Translation) and `tts.py` (Text-to-Speech), wired into the `/api/navigate` response so `reasoning` and `route_steps` are translated to `preferred_language`, and an optional `audio_url` is generated when `mobility_needs` indicates a visual/literacy accessibility need. Add fallback to English text if translation fails.

**Phase 5 — Simulated Real-Time Crowd Feed**
> Implement `pubsub_simulator.py` that publishes fake CrowdSnapshot events every few seconds for demo purposes, consumed and written to Firestore. Add BigQuery sink for a simple operator analytics table (reroute count, average density per zone).

**Phase 6 — Frontend**
> Build the Fan-facing app (MapView, RouteCard, LanguageSelector, AccessibilityToggle) calling `/api/navigate`, and a minimal OperatorDashboard reading `/api/operator/crowd-summary`. Follow the frontend-design skill for visual polish — no generic/templated look. Ensure keyboard navigation and ARIA labels throughout (Accessibility scoring).

**Phase 7 — Tests + CI**
> Add remaining pytest coverage (API contract tests, translation fallback test) and Vitest tests for key frontend components. Add `.github/workflows/ci.yml` running lint + test on every push to main.

**Phase 8 — README**
> Write the final README using the structure in Section 10 below.

---

## 10. README Structure (required)

```
# StadiumSense AI
## Chosen Vertical
(explain the single-persona framing from Section 1)
## Problem
## Architecture (diagram + GCP services table)
## Core Decision Logic (guardrails vs Gemini reasoning — why this split matters for safety)
## How It Works (end-to-end walkthrough of one request)
## Assumptions
(e.g. crowd data is simulated via Pub/Sub for demo purposes; real deployment would ingest from stadium IoT/camera feeds)
## Setup & Local Run
## Deployment (Cloud Run — reference the Dockerfile)
## Testing
## Security Notes
## Accessibility Notes
```

---

## 11. Submission Checklist

- [ ] Repo public, single `main` branch, under 10 MB (`git count-objects -vH` to check)
- [ ] No secrets committed — grep for API keys before final push
- [ ] README complete per Section 10
- [ ] Dockerfile builds and runs locally (`docker build` + `docker run` health check passes)
- [ ] All tests pass in CI
- [ ] Final commit message is descriptive, e.g. "StadiumSense AI — final submission"
