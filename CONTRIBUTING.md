# Contributing & Git Workflow Guide for SERPENTIS

This guide explains the safe day-to-day Git and testing workflow for SERPENTIS.

---

## 1. Branch Strategy

- `main`: Stable project baseline and release-ready snapshots. Do **not** force-push or commit untested work directly to `main`.
- `serpentis-autonomous-development`: Primary integration branch containing the Smart City + Climate Intelligence implementation, Phase 2 release hardening, and RC1 preparation.
- `feature/<short-name>`: New capabilities branched from `serpentis-autonomous-development`.
- `fix/<short-name>`: Focused bug or security fixes.

### Creating a New Branch
```bash
git checkout serpentis-autonomous-development
git pull origin serpentis-autonomous-development
git checkout -b fix/my-bugfix
```

---

## 2. Inspecting Changes & Staging Safely

Never run `git add .` blindly without checking what is untracked or modified.

1. Check current repository state:
   ```bash
   git status --short --branch
   ```
2. Review unstaged edits line-by-line:
   ```bash
   git diff
   ```
3. Stage only intended source, test, or documentation files:
   ```bash
   git add path/to/file.ts docs/my-doc.md
   ```
4. Verify staged files (confirm zero `.env`, keystores, `.apk`, or debug dumps are staged):
   ```bash
   git diff --cached --stat
   ```

---

## 3. Never Commit Secrets or Local Signing Files

Protected files (excluded in `.gitignore`) must remain **untracked**:
- `server/.env` and `.env.*` (only commit `server/.env.example` with empty/placeholder values)
- `mobile/android/keystore.properties`, `*.keystore`, `*.jks`, `*.p12` (except the standard RN `debug.keystore` and `keystore.properties.example`)
- `mobile/android/local.properties` (contains your local Android SDK path)
- `google-services.json`, `service-account*.json`, `credentials.json`

Verify an ignore rule anytime using:
```bash
git check-ignore -v server/.env mobile/android/local.properties
```

---

## 4. Commit Messages & Syncing with Remote

Write concise, descriptive commit messages:
```bash
git commit -m "fix(server): validate environmental alert bounding box"
```

### Fetching, Pulling & Pushing Without History Loss
1. Fetch remote updates without altering local work:
   ```bash
   git fetch origin
   ```
2. Update your branch safely via fast-forward or merge (avoid force-pushing shared branches):
   ```bash
   git pull origin serpentis-autonomous-development
   ```
3. Push your branch cleanly:
   ```bash
   git push -u origin serpentis-autonomous-development
   ```

### Resolving Merge Conflicts Safely
1. If `git pull` reports conflicts, run `git status` to list conflicted files.
2. Open each conflicted file, resolve `<<<<<<<`, `=======`, and `>>>>>>>` markers carefully, and remove the conflict markers.
3. Re-run mobile/server checks below, then `git add <resolved-file>` and `git commit`.

---

## 5. Required Verification Before Opening a PR / Pushing

### Backend (`server/`)
```bash
cd server
npm run build
npm test
```

### Mobile (`mobile/`)
```bash
cd mobile
npx tsc --noEmit
npx eslint src
npm test -- --watchAll=false
```
