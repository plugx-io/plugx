---
id: P1-06
title: 契约检查脚本
status: 待认领
owner: ''
---

[English](P1-06-contract-check.md) | **简体中文**

## 目标

防止"代码里出现 contracts.md 之外的事件名/插槽名"这类契约腐化，用脚本自动比对，作为 CI 卡口。

## 范围

- 新建 `scripts/check-contracts.mjs`
- 允许修改根 `package.json` 增加脚本 `"check:contracts": "node scripts/check-contracts.mjs"`
- 允许在 `docs/contracts.md` 附录补充机器可读区块（如 ```contracts 代码块），但**不许改动已有契约条目**

## 验收标准

- [ ] 扫描 `packages/*/src`、`plugins/*/src`、`apps/*/src` 下所有 `.ts/.tsx` 文件
- [ ] 提取 `ctx.emit/on/bail/waterfall/parallel/serial/contribute` 的字符串字面量参数
- [ ] 与 contracts.md 的契约清单比对，清单之外的名称报错退出（exit code 1），全部合法输出通过信息
- [ ] `slot/changed:` 前缀属 core 内部事件，白名单放行

## 验收命令

```powershell
pnpm check:contracts
```
