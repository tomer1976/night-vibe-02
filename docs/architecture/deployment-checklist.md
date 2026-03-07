# Night Vibe — Firestore Deployment Checklist

Use this checklist for deploying Firestore indexes and security rules safely across environments.

---

## 1) Pre-Deployment

- [ ] Confirm target environment: `dev` / `staging` / `prod`
- [ ] Confirm correct Firebase project ID
- [ ] Confirm `firestore.indexes.json` is present and reviewed
- [ ] Confirm `firestore.rules` is present and reviewed
- [ ] Confirm PR approval completed for security-sensitive rule changes
- [ ] Confirm no unresolved blockers in release notes

---

## 2) Local Validation

- [ ] Validate index JSON syntax
  - Command: `Get-Content -Raw firestore.indexes.json | ConvertFrom-Json | Out-Null`
- [ ] Validate rules syntax (recommended in emulator/CI)
- [ ] Confirm no accidental environment-specific values in committed files

---

## 3) Select Target Project

- [ ] Set project alias or pass explicit project ID
  - Alias command: `firebase use <alias>`
  - Recommended for CI/CD: always pass `--project <project_id>`

---

## 4) Deploy

- [ ] Deploy indexes only (if index change only)
  - `firebase deploy --only firestore:indexes --project <project_id>`
- [ ] Deploy rules only (if rules change only)
  - `firebase deploy --only firestore:rules --project <project_id>`
- [ ] Deploy both (if both changed)
  - `firebase deploy --only firestore --project <project_id>`

---

## 5) Post-Deployment Verification

- [ ] Confirm deploy command succeeded (exit code 0)
- [ ] Confirm index build state is healthy in Firebase Console
- [ ] Run smoke checks:
  - [ ] Profile self read/write works
  - [ ] Venue discovery read path works
  - [ ] Notification read + mark-as-read works
  - [ ] Unauthorized writes to server-owned collections are denied
- [ ] Check logs/metrics for abnormal `PERMISSION_DENIED` spikes

---

## 6) Rollback (If Needed)

- [ ] Rules rollback: redeploy previous known-good `firestore.rules`
- [ ] Index rollback: redeploy previous known-good `firestore.indexes.json`
- [ ] Monitor until index transitions complete and traffic stabilizes

---

## 7) Promotion Flow (Recommended)

- [ ] Deploy to `staging`
- [ ] Run staging smoke tests
- [ ] Obtain release approval
- [ ] Deploy to `prod`
- [ ] Run production smoke tests
- [ ] Capture deployment summary in release log
