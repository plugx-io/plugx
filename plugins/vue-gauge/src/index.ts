/**
 * 示例插件（Vue 写法）：向 dashboard 插槽贡献一张水位仪表卡片。
 * 用 h() 渲染函数而非 SFC —— 无需 @vitejs/plugin-vue 也能被消费，降低宿主接入成本。
 */
import { defineComponent, h, ref } from 'vue'
import type { Plugin } from '@plugx/core'

const cardStyle = {
  background: '#1a2236',
  border: '1px solid #2c3a5e',
  borderRadius: '12px',
  padding: '20px 24px',
  color: '#dde3ee',
}

const btnStyle = {
  background: '#38b2ac',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 16px',
  cursor: 'pointer',
  fontSize: '14px',
}

export const vueGaugePlugin: Plugin = {
  name: 'vue-gauge',
  apply(ctx) {
    const VueGauge = defineComponent({
      name: 'VueGauge',
      setup() {
        const value = ref(66)
        const send = () => ctx.emit('app/toast', `Vue 插件说：当前水位 ${value.value}%`)
        return () =>
          h('div', { style: cardStyle }, [
            h('h3', { style: { margin: '0 0 8px', color: '#38b2ac' } }, 'Vue 插件 · 水位仪表'),
            h('p', { style: { margin: '0 0 16px', color: '#8a93ad', fontSize: '14px' } }, `模拟水位：${value.value}%`),
            h('button', { style: btnStyle, onClick: send }, 'Vue 组件发送事件'),
          ])
      },
    })

    ctx.contribute('dashboard', { framework: 'vue', component: VueGauge, order: 20 })
  },
}
