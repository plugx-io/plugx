---
id: P2-01
title: 图纸装配器 assembler / Blueprint assembler
status: 待认领
owner: ''
---

**English** | [简体中文](P2-01-assembler.zh-CN.md)

> This task belongs to phase P2 — do not start before P1 is fully complete.

## Goal

Create `packages/assembler`: read a PageBlueprint JSON and automatically "dynamic-load plugins → ctx.plugin mount → wire events per wiring", making pages fully blueprint-driven.

## Scope

- Create `packages/assembler/` (package.json, tsconfig, src/index.ts)
- May add a "boot from blueprint" entry in `apps/playground`
- Must NOT change the public API of packages/core (if core falls short, record it in the completion summary for a human decision)

## Acceptance Criteria

- [ ] Three-argument API: `assemble(ctx, blueprint, loader)` — context, blueprint, plugin loader function
- [ ] Blueprint validation failures (zod) produce readable Chinese error messages
- [ ] Events emitted by the `from` plugin in wiring are forwarded to the `to` plugins' declared handlers
- [ ] playground gains a `blueprint.json`; page content renders from the blueprint

## Acceptance Commands

```powershell
pnpm typecheck
pnpm build
```
