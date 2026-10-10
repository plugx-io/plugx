[English](conventions.md) | **简体中文**

# 编码与协作约定

## 语言与注释

- 说明文档：**一式两份**——`X.md`（英文，默认）+ `X.zh-CN.md`（中文），首行互放语言切换链接；新建/改名单文档 = 两份同步
- 代码注释、提交信息、AI 完工总结：**中文**
- 流程图一律用 **Mermaid**（GitHub 原生渲染，AI 可读可改源码）
- 注释写"为什么"，不写"是什么"（代码能自明的不写）

## 技术栈底线

- 包管理：**只用 pnpm**（禁 npm/yarn），CI 与安装一律 `pnpm install --frozen-lockfile`
- TypeScript strict 全开，`noUncheckedIndexedAccess` 开启；禁止裸 `any`，确需使用时写 `// eslint-disable-next-line` 并在注释说明原因
- 内部包一律以 **TS 源码方式**被消费（`exports` 指向 `src`），不需要构建步骤；只有 apps 需要 `vite build`

## 命名

| 对象 | 规范 | 示例 |
|---|---|---|
| 文件/目录 | kebab-case | `hello-panel/` |
| 组件 | PascalCase | `<HelloPanel />` |
| 包名 | `@plugx/*` 内核、`@plugx-plugin/*` 插件 | `@plugx/core` |
| 事件/插槽/服务 | 见 contracts.md 命名规范 | `app/toast` |

## 提交信息

Conventional Commits：`feat(core): xxx` / `fix(adapter-react): xxx` / `docs: xxx`，scope 取包名去掉前缀。

## 插件写作模板

```ts
import type { Plugin } from '@plugx/core'

export const myPlugin: Plugin = {
  name: 'my-plugin',        // 与目录名一致
  inject: ['theme'],        // 声明依赖的服务，就绪后才挂载
  apply(ctx) {
    // 一切注册走 ctx.on / ctx.contribute / ctx.effect —— 自动可逆
    ctx.contribute('dashboard', { framework: 'react', component: MyCard, order: 10 })
    ctx.on('app/toast', (msg) => { /* ... */ })
  },
}
```

## AI 协作

见根目录 [AGENTS.md](../AGENTS.md)，那是最高约束。
