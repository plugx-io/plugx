**English** | [简体中文](conventions.zh-CN.md)

# Coding & Collaboration Conventions

## Language & Comments

- Documentation: **always in pairs** — `X.md` (English, default) + `X.zh-CN.md` (中文), each with a language-switch link on the first line; creating or renaming a doc means updating both
- Code comments, commit messages, AI completion summaries: **中文**
- Diagrams: **Mermaid only** (GitHub renders it natively; AI can read and edit the source)
- Comments explain "why", not "what" (self-evident code needs none)

## Technical Baselines

- Package manager: **pnpm only** (no npm/yarn); installs and CI use `pnpm install --frozen-lockfile`
- TypeScript strict mode with `noUncheckedIndexedAccess`; no bare `any` — if unavoidable, add an eslint-disable comment explaining why
- Internal packages are consumed **as TS source** (`exports` points at `src`); no build step needed — only apps run `vite build`

## Naming

| Object | Rule | Example |
|---|---|---|
| Files / directories | kebab-case | `hello-panel/` |
| Components | PascalCase | `<HelloPanel />` |
| Package names | `@plugx/*` kernel, `@plugx-plugin/*` plugins | `@plugx/core` |
| Events / slots / services | see contracts.md naming rules | `app/toast` |

## Commit Messages

Conventional Commits: `feat(core): xxx` / `fix(adapter-react): xxx` / `docs: xxx`; scope = package name without prefix.

## Plugin Template

```ts
import type { Plugin } from '@plugx/core'

export const myPlugin: Plugin = {
  name: 'my-plugin',        // matches the directory name
  inject: ['theme'],        // declared services; mounts after they are ready
  apply(ctx) {
    // all registrations go through ctx.on / ctx.contribute / ctx.effect — auto-reversible
    ctx.contribute('dashboard', { framework: 'react', component: MyCard, order: 10 })
    ctx.on('app/toast', (msg) => { /* ... */ })
  },
}
```

## AI Collaboration

See the root [AGENTS.md](../AGENTS.md) — it is the supreme constraint.
