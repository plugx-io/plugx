**English** | [简体中文](README.zh-CN.md)

# Task Card Guide

Each task card is a `.md` file with fixed frontmatter:

```yaml
---
id: P1-06
title: Contract check script
status: 待认领        # 待认领 (unclaimed) / 进行中 (in progress) / 已完成 (done)
owner: ''             # claimant (human or AI)
---
```

## Four Fixed Sections

1. **Goal** — why we do it
2. **Scope** — files allowed to create/modify; anything outside must be added to the card first
3. **Acceptance criteria** — a checklist that can be verified item by item
4. **Acceptance commands** — commands that must actually pass

## Completing a Task

- Set status to 「已完成」 and fill in `owner`
- Append a "Completion record": date, acceptance-command output summary, open issues

## Current Board

| ID | Title | Status |
|---|---|---|
| P1-01 | core plugin runtime | ✅ done |
| P1-02 | React adapter | ✅ done |
| P1-03 | Vue adapter | ✅ done |
| P1-04 | playground demo app | ✅ done |
| P1-05 | schema package (manifest + blueprint types) | ✅ done |
| P1-06 | contract check script | ⬜ unclaimed |
| P2-01 | blueprint assembler | ⬜ unclaimed (opens in P2) |
