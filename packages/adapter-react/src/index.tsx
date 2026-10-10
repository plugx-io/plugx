/**
 * @plugx/adapter-react —— React 适配器（转换头）
 * 职责：把 core 的 Context 接进 React 世界，并担任 react 框架的渲染器。
 */
import {
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react'
import { createContext } from 'react'
import { createRoot } from 'react-dom/client'
import type { Context, Renderer, SlotContribution } from '@plugx/core'

const CordisReactContext = createContext<Context | null>(null)

export function CordisProvider(props: { ctx: Context; children: ReactNode }) {
  return createElement(CordisReactContext.Provider, { value: props.ctx }, props.children)
}

export function useCordis(): Context {
  const ctx = useContext(CordisReactContext)
  if (!ctx) throw new Error('[plugx] useCordis 必须在 <CordisProvider> 内使用')
  return ctx
}

/** 读取服务：插件组件内获取 ctx 服务的推荐方式 */
export function useService<T>(key: string): T {
  return useCordis().get<T>(key)
}

/** React 渲染器：注册到 ctx 后，React 组件即纳入跨框架插槽体系 */
export const reactRenderer: Renderer = {
  mount(el, component, props) {
    const root = createRoot(el)
    root.render(createElement(component as ComponentType<Record<string, unknown>>, props))
    return () => root.unmount()
  },
}

/**
 * 万能插槽：按贡献物的 framework 分发——
 * react 组件直接渲染；其他框架委托 <ForeignMount> 走对应渲染器。
 */
export function Slot(props: { name: string; className?: string }) {
  const ctx = useCordis()
  const [items, setItems] = useState<SlotContribution[]>(() => ctx.getSlotContributions(props.name))

  useEffect(() => {
    setItems(ctx.getSlotContributions(props.name))
    return ctx.onSlotChange(props.name, () => setItems(ctx.getSlotContributions(props.name)))
  }, [ctx, props.name])

  return createElement(
    'div',
    { className: props.className, 'data-slot': props.name },
    items.map((item, i) =>
      item.framework === 'react'
        ? createElement(item.component as ComponentType<Record<string, unknown>>, {
            key: i,
            ...item.props,
          })
        : createElement(ForeignMount, { key: i, contribution: item }),
    ),
  )
}

/** 非 React 组件的挂载点：把 DOM 交给对应框架的渲染器，卸载由 disposer 保证 */
function ForeignMount({ contribution }: { contribution: SlotContribution }) {
  const ctx = useCordis()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const renderer = ctx.getRenderer(contribution.framework)
    return renderer.mount(ref.current, contribution.component, contribution.props)
  }, [ctx, contribution])

  return createElement('div', { ref, style: { display: 'contents' } })
}
