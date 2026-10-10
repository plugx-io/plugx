import { Slot } from '@plugx/adapter-react'

export function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f1420',
        color: '#dde3ee',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <header style={{ padding: '16px 24px', borderBottom: '1px solid #26304a' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>PlugX Playground —— 插线板验证场</h1>
        <p style={{ margin: '4px 0 0', color: '#8a93ad', fontSize: 13 }}>
          下方两张卡片：一张 React 插件贡献，一张 Vue 插件贡献。它们互不相识，只通过事件总线对话。
        </p>
      </header>
      <main style={{ padding: 24 }}>
        <Slot name="dashboard" className="dashboard-grid" />
      </main>
    </div>
  )
}
