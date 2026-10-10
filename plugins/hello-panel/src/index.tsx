/**
 * 示例插件（React 写法）：向 dashboard 插槽贡献一张卡片。
 * 要点：组件在 apply 内定义并闭包捕获 ctx —— 插件组件天然持有上下文，无需 import 任何适配器。
 */
import { useState, type CSSProperties } from 'react'
import type { Plugin } from '@plugx/core'

const cardStyle: CSSProperties = {
  background: '#1a2236',
  border: '1px solid #2c3a5e',
  borderRadius: 12,
  padding: '20px 24px',
}

const btnStyle: CSSProperties = {
  background: '#4a90d9',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '8px 16px',
  cursor: 'pointer',
  fontSize: 14,
}

export const helloPanelPlugin: Plugin = {
  name: 'hello-panel',
  inject: ['theme'],
  apply(ctx) {
    const theme = ctx.get<{ primary: string }>('theme')

    function HelloPanel() {
      const [count, setCount] = useState(0)
      return (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 8px', color: theme.primary }}>React 插件 · HelloPanel</h3>
          <p style={{ margin: '0 0 16px', color: '#8a93ad', fontSize: 14 }}>
            我通过插槽挂载，点按钮向事件总线广播（旁边那张 Vue 卡片也在同一个总线上）：
          </p>
          <button
            style={btnStyle}
            onClick={() => {
              const n = count + 1
              setCount(n)
              ctx.emit('app/toast', `React 插件第 ${n} 次问好`)
            }}
          >
            发送事件
          </button>
        </div>
      )
    }

    ctx.contribute('dashboard', { framework: 'react', component: HelloPanel, order: 10 })
  },
}
