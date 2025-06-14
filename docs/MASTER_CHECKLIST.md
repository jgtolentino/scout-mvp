# Master 🚀 Launch Checklist

*(Everything that must be DONE before we stamp **"Live Production"** on Scout Analytics)*

| # | Area | Task | Owner | Status |
|---|------|------|-------|--------|
| **CONFIG & INFRA** | | | | |
| 1 | Vercel | **Enable Preview Deployments** for all PR branches | DevOps | ☐ |
| 2 | Supabase | Confirm **row-level security (RLS)** rules in `transactions_fmcg`, `transaction_items_fmcg`, `payments_fmcg` | DBA | ☐ |
| 3 | Secrets | Rotate & store `AZURE_OPENAI_KEY` + `SUPABASE_SERVICE_ROLE_KEY` in **GitHub Secrets ≠ Vercel Env** | DevOps | ☐ |
| 4 | DNS | Point `analytics.your-domain.com` → Vercel prod URL; add AAAA for IPv6 | IT | ☐ |
| 5 | CDN | Ensure Vercel "**Edge Network Caching**" turned **ON** for static assets & favicons | DevOps | ☐ |
| **CI / CD** | | | | |
| 6 | Audit bot | Merge **deploy_verify.yml** into `main` and verify a green run (no console errors) | QA | ☐ |
| 7 | Fail-on-purpose test | Push branch with `console.error('audit-smoke')` → confirm auto-issue filed → close it | QA | ☐ |
| 8 | Branch protections | Require **audit job = ✅** & **unit tests = ✅** before merge to `main` | Lead Dev | ☐ |
| **MONITORING & ALERTING** | | | | |
| 9 | GitHub → Slack | Add webhook: on *"🚨 Deployment audit failed"* issue created → ping #alert-scout | DevOps | ☐ |
| 10 | Vercel analytics | Set 5 % threshold rule: if **Error Rate > 5 %** → send OpsGenie alert | DevOps | ☐ |
| 11 | Supabase logs | Enable **Log Drains** to Datadog (function errors & Postgres errors) | DevOps | ☐ |
| **DATA & QUALITY** | | | | |
| 12 | Snapshot script | Nightly CI job updates `snapshot:` block; diff check raises low-prio issue on >5 % drift | Data Eng | ☐ |
| 13 | Seed verification | Run `select count(*) from transactions_fmcg ≈ 5 000` in prod → document in runbook | Data Eng | ☐ |
| 14 | Data catalog | Publish schema (the .sql you posted) to Confluence; tag PII columns | Data Eng | ☐ |
| **APP FUNCTIONALITY** | | | | |
| 15 | Demo toggle | Confirm `VITE_SCOUT_DEMO=on` truly isolates all network calls (grep test) | QA | ☐ |
| 16 | Payment charts | Validate payment-method breakdown >0 for all five methods in prod | Product | ☐ |
| 17 | AI panel | Live Azure OpenAI streaming works (open `/chat`, expect typing dots) | QA | ☐ |
| 18 | Accessibility | Lighthouse score ≥ 90; colour-contrast for KPI cards passes WCAG AA | FE Dev | ☐ |
| **DOCUMENTATION & RUNBOOKS** | | | | |
| 19 | README | Final section: **"How to fail-over demo → prod"** including env-flag table | Tech Writer | ☐ |
| 20 | On-call runbook | Step-by-step: *"Audit bot fails"* → how to pull artefact screenshot, repro locally | SRE | ☐ |
| **GO/NO-GO MEETING** | | | | |
| 21 | Dry-run | Schedule stakeholder walkthrough using **demo mode** + live prod toggle | PM | ☐ |
| 22 | Sign-off | Product, Engineering, Ops all tick ☑ on this sheet → tag release `v1.0.0` | PM | ☐ |

---

## How to track

* This checklist is stored in `docs/MASTER_CHECKLIST.md`
* Each row maps to a **single GitHub issue** in milestone **"Prod Launch v1.0"**
* Run the following command to create all issues:

```bash
npx create-issue-cli \
  --from docs/MASTER_CHECKLIST.md \
  --repo jgtolentino/scout-mvp \
  --milestone "Prod Launch v1.0"
```

Once every box is ✅, we're production-ready. 