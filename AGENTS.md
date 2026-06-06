# apis Instructions

This project is the public/static documentation site for PayPRO SDK and Push ECR/Signal integration.

Before editing, read:

- `../AGENTS.md`
- `../_ai/LAMBDA_ENGINEERING.md`
- `../_ai/PAYPRO_RULES.md`
- `../_ai/AI_WORKFLOW.md`

For SDK documentation changes, also read:

- `../paypro-sdk/AGENTS.md`
- `../_demos/paypro-demo/`
- `../_demos/payprodemojava/`

For Push ECR/Signal documentation changes, also read:

- `../paypro-signal/AGENTS.md`
- `../_tools/paypro-simulator/`
- `../_tools/paypro-push-test/`

## Local Rules

- `README.md` documents PayPRO Android SDK integration.
- `README_push.md` documents Push ECR/Signal integration.
- `demo/ecr/` is the canonical public Push ECR demo console unless another deployment is explicitly confirmed.
- Keep SDK documentation aligned with `../paypro-sdk/` public API behavior.
- Keep SDK examples aligned with `../_demos/paypro-demo/` and `../_demos/payprodemojava/`.
- Keep Push ECR endpoint, payload, and response documentation aligned with `../paypro-signal/` and backend/API behavior.
- Do not include real `x-client-id`, `x-api-key`, terminal IDs, merchant secrets, production URLs, or credentials in examples.
- Mask sensitive payment data in screenshots, examples, and demo defaults.

## Verification

For documentation changes:

- Preview the affected Markdown or static page when possible.
- Check links to `README.md`, `README_push.md`, and `demo/ecr/`.
- Confirm examples match the current SDK/API names and payloads.
