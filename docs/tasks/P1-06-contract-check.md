---
id: P1-06
title: 契约检查脚本 / Contract check script
status: 待认领
owner: ''
---

**English** | [简体中文](P1-06-contract-check.zh-CN.md)

## Goal

Prevent contract rot — code referencing event/slot names absent from contracts.md — by auto-comparing with a script that acts as a CI gate.

## Scope

- Create `scripts/check-contracts.mjs`
- May add `"check:contracts": "node scripts/check-contracts.mjs"` to the root `package.json`
- May append a machine-readable block to `docs/contracts.md` + `contracts.zh-CN.md` (e.g. a ```contracts code block), but **must not change existing contract entries**

## Acceptance Criteria

- [ ] Scans all `.ts/.tsx` files under `packages/*/src`, `plugins/*/src`, `apps/*/src`
- [ ] Extracts string-literal arguments of `ctx.emit/on/bail/waterfall/parallel/serial/contribute`
- [ ] Compares against the registry in contracts.md; unlisted names exit with code 1; all-listed prints a success message
- [ ] The `slot/changed:` prefix is core-internal — whitelist it

## Acceptance Commands

```powershell
pnpm check:contracts
```
