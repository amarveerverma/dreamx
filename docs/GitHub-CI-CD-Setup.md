# GitHub & CI/CD Infrastructure: Setup & Operational Runbook

**Project:** DreamX — Global AI Career Success Marketplace  
**Specification Reference:** [docs/Deployment.md](file:///c:/dremex/docs/Deployment.md) (Parts 5, 6, 18, 19), [docs/Security.md](file:///c:/dremex/docs/Security.md) (Parts 19, 21)

---

## 1. Architecture Overview

DreamX employs a high-velocity, production-safe **Hybrid Trunk-Based / Git Flow** branching model with automated DevSecOps release gates.

```
[Feature Branch: feat/*] ──► [PR targeting staging] ──► [CI Gate Pass] ──► [Merge to staging]
                                                                                   │
                                                                                   ▼
                                                                       [Automated Staging Deploy]
                                                                                   │
[PR targeting main] ◄──────────────────────────────────────────────────────────────┘
       │
       ▼ (2 Approvals + Strict CI Checks)
[Merge to main] ──► [Automated Production CI/CD] ──► [Canary Rollout & Health Assertion]
```

### 1.1 Branch Protection Invariants
* **`main` Branch (Production):**
  - Direct git push is permanently blocked.
  - Merging requires passing 100% of CI checks (`1. TruffleHog Secret & PII Leak Scan `2. Linters & Strict Type Checking`).
  - Requires **2 approving reviews** from senior engineers.
  - Stale approvals are dismissed automatically upon pushing new commits.
  - Administrator enforcement is enabled (`enforce_admins: true`).
  - Force pushes and branch deletions are disabled.
* **`staging` Branch (Pre-Production Mirror):**
  - Direct git push is blocked.
  - Merging requires passing CI status checks.
  - Requires **1 approving review**.
  - Force pushes and branch deletions are disabled.

---

## 2. Automated GitHub Actions Workflows

| Workflow File | Trigger Events | Primary Security & Deployment Gates | Environment |
|---|---|---|---|
| [`.github/workflows/ci.yaml`](file:///c:/dremex/.github/workflows/ci.yaml) | PRs targeting `main` or `staging `workflow_dispatch` | • TruffleHog secret scan<br/>• Ruff & MyPy strict type checks<br/>• Pytest test suite & RLS assertions<br/>• Semgrep SAST scan (`p/owasp-top-ten `p/security-audit`) | Ephemeral CI |
| [`.github/workflows/deploy-staging.yaml`](file:///c:/dremex/.github/workflows/deploy-staging.yaml) | Push to `staging` branch, `workflow_dispatch` | • Pre-flight secret & regression checks<br/>• Vercel Preview Edge deployment<br/>• Staging dependency smoke tests | `staging` (`https://staging.dreamx.com`) |
| [`.github/workflows/deploy-production.yaml`](file:///c:/dremex/.github/workflows/deploy-production.yaml) | Push to `main` branch, `workflow_dispatch` | • Quality & DevSecOps security pass<br/>• Multi-stage Docker build & Trivy vulnerability scan<br/>• Syft SBOM generation<br/>• Production Vercel deploy & `/health/live` / `/health/ready` check assertions | `production` (`https://dreamx.com`) |
| [`.github/workflows/security-audit.yaml`](file:///c:/dremex/.github/workflows/security-audit.yaml) | Scheduled nightly (`0 2 * * *`), `workflow_dispatch` | • TruffleHog full repository history scan<br/>• pip-audit dependency CVE check<br/>• Deep Semgrep SAST security rule audit | Audit Sink |

---

## 3. Automated Setup Script (`scripts/setup_github.py`)

The turnkey automation orchestrator handles:
1. Remote repository creation (if not already existing).
2. Remote git linking (`origin`) and pushing `main` and `staging` branches.
3. Branch protection configuration via GitHub REST API (with automatic GitHub Rulesets fallback).
4. Libsodium SealedBox public-key encryption and automated upload of all non-empty secrets from `.env.local` to GitHub Actions Repository Secrets.
5. Provisioning of `staging` and `production` GitHub environments.

### 3.1 Required GitHub Token Permissions
Generate a **Personal Access Token (Classic)** on GitHub ([github.com/settings/tokens](https://github.com/settings/tokens)) with:
* `repo` (Full control of private repositories)
* `workflow` (Update GitHub Action workflows)

*(Or a Fine-Grained Token with Read/Write permissions for Administration, Secrets, Contents, and Workflows).*

### 3.2 Running the Automation

Run directly via `uv` (installs `pynacl` and `requests` on the fly in milliseconds):

```bash
uv run --with pynacl,requests python scripts/setup_github.py --token <YOUR_GITHUB_PAT>
```

#### CLI Options:
* `--token <PAT>`: GitHub token (can also be set via `GITHUB_TOKEN` environment variable).
* `--owner <OWNER>`: GitHub username or organization (defaults to authenticated token user).
* `--repo <NAME>`: Repository name (defaults to `dremex`).
* `--dry-run`: Test parsing, branch configuration, and secret encryption without modifying remote resources.
* `--public`: Create public repository instead of default private repository.

---

## 4. Verification & Diagnostics

Run the automated verification suite anytime:

```bash
# Check local git state and workflow validity
python scripts/verify_github_cicd.py

# Check with remote GitHub API verification
python scripts/verify_github_cicd.py --token <YOUR_GITHUB_PAT> --owner <OWNER>

# Run full cloud connectivity & CI/CD pre-flight check
python scripts/preflight_check.py
```
