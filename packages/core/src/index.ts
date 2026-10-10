/**
 * @plugx/core —— PlugX 插件运行时核
 *
 * 红线：本包禁止 import 任何 UI 框架（react/vue/组件库），
 * 只允许 TypeScript 标准库 + DOM 类型。core 是"插线板标准"，必须框架无关。
 */

/** 资源释放函数：一切注册的"后悔药" */
export type Disposer = () => void

/**
 * 插件：实现 Service 的对象。
 * - name：全局唯一，与目录名一致
 * - inject：声明依赖的服务 key，全部就绪后 apply 才会执行
 * - apply：挂载入口；执行期间的 on/contribute/effect 自动归入本插件作用域
 */
export interface Plugin<Config = unknown> {
  name: string
  inject?: string[]
  apply: (ctx: Context, config?: Config) => void | Disposer
}

/** 框架渲染器：把某框架的组件挂载到 DOM 元素，返回卸载函数 */
export interface Renderer {
  mount: (el: HTMLElement, component: unknown, props?: Record<string, unknown>) => Disposer
}

/** 插槽贡献物：一个"要显示在某插槽里"的组件及其框架标记 */
export interface SlotContribution {
  framework: string
  component: unknown
  props?: Record<string, unknown>
  order?: number
}

type Listener = (...args: unknown[]) => unknown
type NextFn<T> = (value?: T) => T
type WaterfallListener = (value: unknown, next: NextFn<unknown>) => unknown

export class Context {
  private services = new Map<string, unknown>()
  private listeners = new Map<string, Set<Listener>>()
  private waterfallListeners = new Map<string, Set<WaterfallListener>>()
  private renderers = new Map<string, Renderer>()
  private slots = new Map<string, Set<SlotContribution>>()
  private rootDisposers: Disposer[] = []
  private pluginDisposers = new Map<string, Disposer[]>()
  /** 插件挂载作用域栈：apply 执行期间收集该插件的全部 disposer */
  private scopeStack: Disposer[][] = []
  private pendingPlugins: { plugin: Plugin; config?: unknown }[] = []

  /* ---------------- 服务容器 ---------------- */

  set<T>(key: string, service: T): void {
    this.services.set(key, service)
    this.flushPending()
  }

  get<T>(key: string): T {
    if (!this.services.has(key)) {
      throw new Error(`[plugx] 服务未注册: ${key}（先检查壳工程是否 ctx.set('${key}', ...)）`)
    }
    return this.services.get(key) as T
  }

  has(key: string): boolean {
    return this.services.has(key)
  }

  /* ---------------- 插件挂载 ---------------- */

  /** 挂载插件。inject 声明的服务未就绪时自动挂起，服务注册后自动补挂 */
  plugin(plugin: Plugin, config?: unknown): void {
    const deps = plugin.inject ?? []
    if (deps.every((d) => this.services.has(d))) {
      this.mountPlugin(plugin, config)
    } else {
      this.pendingPlugins.push({ plugin, config })
    }
  }

  private mountPlugin(plugin: Plugin, config?: unknown): void {
    if (this.pluginDisposers.has(plugin.name)) {
      throw new Error(`[plugx] 插件重复挂载: ${plugin.name}`)
    }
    const scope: Disposer[] = []
    this.scopeStack.push(scope)
    try {
      const d = plugin.apply(this, config)
      if (typeof d === 'function') scope.push(d)
    } finally {
      this.scopeStack.pop()
    }
    this.pluginDisposers.set(plugin.name, scope)
  }

  private flushPending(): void {
    if (this.pendingPlugins.length === 0) return
    const ready = this.pendingPlugins.filter(({ plugin }) =>
      (plugin.inject ?? []).every((d) => this.services.has(d)),
    )
    if (ready.length === 0) return
    this.pendingPlugins = this.pendingPlugins.filter((p) => !ready.includes(p))
    for (const { plugin, config } of ready) this.mountPlugin(plugin, config)
  }

  /** 卸载单个插件：逆序撤销它挂载期间注册的一切（监听器/插槽贡献/定时器…） */
  unplug(name: string): void {
    const scope = this.pluginDisposers.get(name)
    if (!scope) return
    for (const d of [...scope].reverse()) d()
    this.pluginDisposers.delete(name)
  }

  /* ---------------- 可逆副作用 ---------------- */

  /** 执行一段副作用逻辑，其返回的 disposer 会被自动收集 */
  effect(fn: () => void | Disposer): void {
    const d = fn()
    if (typeof d === 'function') this.track(d)
  }

  /** disposer 归属：插件作用域内归插件，否则归根（dispose 时统一清理） */
  private track(d: Disposer): void {
    const scope = this.scopeStack[this.scopeStack.length - 1]
    if (scope) scope.push(d)
    else this.rootDisposers.push(d)
  }

  /** 销毁整个上下文（应用退出 / 热更新） */
  dispose(): void {
    for (const name of [...this.pluginDisposers.keys()].reverse()) this.unplug(name)
    for (const d of [...this.rootDisposers].reverse()) d()
    this.rootDisposers = []
    this.listeners.clear()
    this.waterfallListeners.clear()
    this.slots.clear()
  }

  /* ---------------- 类型化事件（五种分发） ---------------- */

  /** 监听事件。返回值为解绑函数（已自动收集，通常无需手动调） */
  on(name: string, fn: Listener): Disposer {
    let set = this.listeners.get(name)
    if (!set) {
      set = new Set()
      this.listeners.set(name, set)
    }
    set.add(fn)
    const dispose = () => {
      set.delete(fn)
    }
    this.track(dispose)
    return dispose
  }

  /** emit：广播观察，监听器按注册顺序执行，无返回值 */
  emit(name: string, ...args: unknown[]): void {
    for (const fn of this.listeners.get(name) ?? []) fn(...args)
  }

  /** parallel：所有监听器并行执行，await 全部完成，无返回值 */
  async parallel(name: string, ...args: unknown[]): Promise<void> {
    const fns = [...(this.listeners.get(name) ?? [])]
    await Promise.all(fns.map(async (fn) => fn(...args)))
  }

  /** serial：监听器按注册顺序依次 await，返回值依次传递（返回 undefined 则保留原值） */
  async serial<T>(name: string, initial: T): Promise<T> {
    let value = initial
    for (const fn of this.listeners.get(name) ?? []) {
      const next = await fn(value)
      if (next !== undefined) value = next as T
    }
    return value
  }

  /** bail：按序执行，任一监听器返回非 undefined 即短路返回该值 */
  bail<T = unknown>(name: string, ...args: unknown[]): T | undefined {
    for (const fn of this.listeners.get(name) ?? []) {
      const result = fn(...args)
      if (result !== undefined) return result as T
    }
    return undefined
  }

  /**
   * waterfall：环绕中间件。监听器收到 (value, next)：
   * 调 next() 委托下游并拿到下游结果；不调 next() 直接返回 = 短路（单决策场景的设计意图）
   */
  onWaterfall(name: string, fn: WaterfallListener): Disposer {
    let set = this.waterfallListeners.get(name)
    if (!set) {
      set = new Set()
      this.waterfallListeners.set(name, set)
    }
    set.add(fn)
    const dispose = () => {
      set.delete(fn)
    }
    this.track(dispose)
    return dispose
  }

  waterfall<T>(name: string, initial: T): T {
    const fns = [...(this.waterfallListeners.get(name) ?? [])] as ((v: T, next: NextFn<T>) => T)[]
    const run = (index: number, value: T): T =>
      index >= fns.length ? value : fns[index]!(value, (nextValue?: T) => run(index + 1, nextValue ?? value))
    return run(0, initial)
  }

  /* ---------------- 渲染器注册表 ---------------- */

  setRenderer(framework: string, renderer: Renderer): void {
    this.renderers.set(framework, renderer)
  }

  getRenderer(framework: string): Renderer {
    const r = this.renderers.get(framework)
    if (!r) throw new Error(`[plugx] 未注册的渲染器: ${framework}（壳工程需 ctx.setRenderer）`)
    return r
  }

  /* ---------------- 插槽 ---------------- */

  /** 向插槽贡献一个组件，返回撤销函数（已自动收集到当前插件作用域） */
  contribute(slot: string, item: SlotContribution): Disposer {
    let set = this.slots.get(slot)
    if (!set) {
      set = new Set()
      this.slots.set(slot, set)
    }
    set.add(item)
    this.emit(`slot/changed:${slot}`)
    const dispose = () => {
      set.delete(item)
      this.emit(`slot/changed:${slot}`)
    }
    this.track(dispose)
    return dispose
  }

  getSlotContributions(slot: string): SlotContribution[] {
    return [...(this.slots.get(slot) ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }

  /** 插槽内容变化通知，供 UI 框架订阅刷新（core 内部事件，插件禁止直接监听） */
  onSlotChange(slot: string, cb: () => void): Disposer {
    return this.on(`slot/changed:${slot}`, cb)
  }
}
