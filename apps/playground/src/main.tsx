/**
 * playground 装配入口：壳工程的全部职责都在这一个文件里——
 * 建插线板 → 注册渲染器 → 注册服务 → 监听全局事件 → 挂载插件。
 * 红线：壳不写业务逻辑（见 AGENTS.md 第三条红线第 5 款）。
 */
import { createRoot } from 'react-dom/client'
import { Context } from '@plugx/core'
import { CordisProvider, reactRenderer } from '@plugx/adapter-react'
import { vueRenderer } from '@plugx/adapter-vue'
import { helloPanelPlugin } from '@plugx-plugin/hello-panel'
import { vueGaugePlugin } from '@plugx-plugin/vue-gauge'
import { App } from './App'

// 1. 建插线板
const ctx = new Context()

// 2. 注册框架渲染器（转换头）
ctx.setRenderer('react', reactRenderer)
ctx.setRenderer('vue', vueRenderer)

// 3. 注册基础服务（契约见 docs/contracts.md）
ctx.set('theme', { primary: '#4a90d9' })

// 4. 全局事件：toast 由壳负责展示（插件只负责发，不关心谁展示）
ctx.on('app/toast', (msg) => showToast(String(msg)))

// 5. 挂载插件——顺序无关：inject 声明的依赖未就绪时会自动等待
ctx.plugin(vueGaugePlugin)
ctx.plugin(helloPanelPlugin)

function showToast(msg: string) {
  const el = document.createElement('div')
  el.className = 'plugx-toast'
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2500)
}

createRoot(document.getElementById('root')!).render(
  <CordisProvider ctx={ctx}>
    <App />
  </CordisProvider>,
)
