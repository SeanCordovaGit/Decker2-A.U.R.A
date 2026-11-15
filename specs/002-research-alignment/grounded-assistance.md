# Grounded research assistance

The user authorized optional Gemini integration for Hand injury and Cabin cold. This supersedes the project's no-external-AI rule for this explicitly requested feature; journal sentiment remains local.

## Authority and traceability

- The existing deterministic threshold evaluator and explicit, structured crew answers control severity, body highlighting and escalation. Gemini has no store actions or tools.
- A positive urgent-symptom answer creates a separately labeled crew-report alert. It never fabricates a thermometer measurement or diagnosis. Reset/switching demo scenarios clears the report flag.
- Next steps and clarification questions are fixed configuration entries with source links. Public first-aid references support the escalation prompts; adapting them to a space mission still requires medical review. No mission-approved treatment protocol was supplied. The UI must say review pending and withhold treatment instructions.
- Gemini is restricted to selecting known finding/question/guidance IDs and quoting exact excerpts from the report. Unknown IDs, invented quotes, additional fields, safety-blocked responses and malformed output are rejected. No generated diagnosis, severity, prescription or novel treatment is displayed.
- Only a deliberate “Explain with Gemini” action sends the report, structured answers and relevant simulated readings to Google through a server route. No API key, private journal or hidden profile history is sent to the browser/model.
- Server key: `GEMINI_API_KEY` in root `.env.local`; optional `GEMINI_MODEL`. Never commit keys. A timeout, missing key, offline connection, invalid model output or quota limit leaves deterministic next steps usable and clearly identifies the fallback.
- Response traces include request ID, timestamp, model/provider or fallback, selected source IDs and validation outcome. No report text or API key is logged. This is an in-session research trace, not a persisted clinical audit system.

## Sources

- [NASA medical-care scope](https://www.nasa.gov/reference/appendix-e-health-and-medical-care-technical-requirements/): identifies hand/cold injuries as relevant concerns; not an executable treatment protocol.
- [NHS broken finger](https://www.nhs.uk/conditions/broken-finger/) and [healthdirect hand/finger fractures](https://www.healthdirect.gov.au/accidents-and-injuries/hand-and-finger-fractures): public urgent-assessment signs.
- [NHS hypothermia](https://www.nhs.uk/conditions/hypothermia/): public emergency recognition; cold cabin readings alone are not a hypothermia diagnosis.
- [Gemini structured output](https://aistudio.google.com/docs/structured-output) and [generateContent reference](https://aistudio.google.com/api-reference/generate-content).

## Delivery

- [X] Configure bounded questions, referral steps and source status.
- [X] Add deterministic crew-report escalation and traceable workflow planning; test thresholds and explicit red flags independently of Gemini.
- [X] Add server-only Gemini calls with schema validation, restricted extractive output and fallback; test adversarial output and network failure.
- [X] Open Next steps from supported scenario buttons and show questions, findings, provenance and explicit cloud submission.
- [X] Verify API/UI, onboarding compatibility, lint, tests and production build.

## Live verification — 2026-11-15

The user configured the server key locally; it remains ignored by Git. Model discovery succeeded. The initial Flash model exceeded the timeout; Google's recommended `gemini-3.5-flash-lite` passed live structured-output requests and is the default. Temperature 0, 1200 output tokens, a 12-second timeout and a strict JSON schema bound the explanation request.

Live tests covered the supplied hand/grip report, Cabin cold, an urgent hand report and an adversarial report attempting to override safety rules. Normal/urgent reports returned accepted Gemini evidence; critical hand escalation remained deterministic. Invalid model output was observed being rejected into the rule-based fallback, while a later valid extractive response to the adversarial report preserved critical escalation and canonical guidance. No model-authored prescription or new guidance was accepted.

The browser verified actual Gemini output, explicit urgent-answer escalation, cloud failure, reset, journal-draft preservation and mobile layout. The full unit suite has 125 passing tests. Medical protocol review remains pending: no mission-approved treatment procedure has been supplied or released.
