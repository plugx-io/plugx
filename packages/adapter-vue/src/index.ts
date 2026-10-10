/**
 * @plugx/adapter-vue —— Vue 适配器（转换头）
 * 职责：
 * 1. 担任 vue 框架的渲染器，把 Vue 组件挂载进任意插槽（含非 Vue 宿主场景）
 * 2. 提供 Vue 应用侧的接入件：createCordis / useCordis / useService / <Slot>
 */
import {
  createApp,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type App,
  type Component,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue'
import type { Context, Renderer, SlotContribution } from '@plugx/core'

/* ---------------- 渲染器 ---------------- */

export const vueRenderer: Renderer = {
  mount(el, component, props) {
    const app = createApp(component as Component, props ?? {})
    app.mount(el)
    return () => app.unmount()
  },
}

/* ---------------- Vue 应用接入 ---------------- */

const CordisKey: InjectionKey<Context> = Symbol('plugx-ctx')

/** Vue 插件：app.use(createCordis(ctx)) 后，全应用可 useCordis()/useService() */
export function createCordis(ctx: Context) {
  return {
    install(app: App) {
      app.provide(CordisKey, ctx)
    },
  }
}

export function useCordis(): Context {
  const ctx = inject(CordisKey)
  if (!ctx) throw new Error('[plugx] useCordis 必须在 app.use(createCordis(ctx)) 之后使用')
  return ctx
}

/** 读取服务：插件组件内获取 ctx 服务的推荐方式 */
export function useService<T>(key: string): T {
  return useCordis().get<T>(key)
}

/* ---------------- 插槽组件 ---------------- */

/** 非 Vue 组件的挂载点：把 DOM 交给对应框架的渲染器，卸载由 disposer 保证 */
const ForeignMount = defineComponent({
  name: 'PlugxForeignMount',
  props: {
    contribution: { type: Object as PropType<SlotContribution>, required: true },
  },
  setup(props) {
    const ctx = useCordis()
    const el: Ref<HTMLElement | null> = ref(null)
    let unmount: (() => void) | undefined

    onMounted(() => {
      if (!el.value) return
      unmount = ctx
        .getRenderer(props.contribution.framework)
        .mount(el.value, props.contribution.component, props.contribution.props)
    })
    onBeforeUnmount(() => unmount?.())

    return () => h('div', { ref: el, style: 'display:contents' })
  },
})

/**
 * 万能插槽：<Slot name="dashboard" />
 * vue 组件直接渲染；其他框架委托 ForeignMount 走对应渲染器。
 * 订阅 slot/changed 事件，插件挂载/卸载时自动刷新。
 */
export const Slot = defineComponent({
  name: 'PlugxSlot',
  props: {
    name: { type: String, required: true },
  },
  setup(props) {
    const ctx = useCordis()
    const items = ref<SlotContribution[]>(ctx.getSlotContributions(props.name))
    let off: (() => void) | undefined

    const subscribe = (slot: string) => {
      off?.()
      items.value = ctx.getSlotContributions(slot)
      off = ctx.onSlotChange(slot, () => {
        items.value = ctx.getSlotContributions(slot)
      })
    }

    onMounted(() => subscribe(props.name))
    watch(
      () => props.name,
      (slot) => subscribe(slot),
    )
    onBeforeUnmount(() => off?.())

    return () =>
      h(
        'div',
        { 'data-slot': props.name },
        items.value.map((item, i) =>
          item.framework === 'vue'
            ? h(item.component as Component, { key: i, ...item.props })
            : h(ForeignMount, { key: i, contribution: item }),
        ),
      )
  },
})
