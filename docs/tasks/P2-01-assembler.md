---
id: P2-01
title: 图纸装配器 assembler
status: 待认领
owner: ''
---

> 本任务属于 P2 阶段，P1 全部完成前不得开工。

## 目标

新增 `packages/assembler`：读入 PageBlueprint JSON，自动完成"动态加载插件 → ctx.plugin 挂载 → 按 wiring 接事件线"，让页面完全由图纸驱动。

## 范围

- 新建 `packages/assembler/`（package.json、tsconfig、src/index.ts）
- 允许修改 `apps/playground` 增加一个"从图纸启动"的入口
- 禁止改动 packages/core 的公开 API（如发现 core 能力不足，先在完工总结中记录，由人决策）

## 验收标准

- [ ] `assemble(ctx, blueprint, loader)` 三参 API：上下文、图纸、插件加载函数
- [ ] 图纸校验失败（zod）时给出可读的中文错误信息
- [ ] wiring 中 from 插件发出的事件自动转发到 to 插件声明的处理
- [ ] playground 新增 `blueprint.json`，页面内容由图纸驱动渲染

## 验收命令

```powershell
pnpm typecheck
pnpm build
```
