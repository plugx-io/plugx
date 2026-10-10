/**
 * @plugx/schema —— 插件身份证（manifest）与页面图纸（blueprint）的类型与校验。
 * 本包同样框架无关，未来 Registry / CLI / 设计器 / 装配器都消费这里的类型。
 */
import { z } from 'zod'

/* ---------------- 插件身份证 ---------------- */

export const ManifestSchema = z.object({
  /** 插件名：小写 kebab-case，与目录名一致 */
  name: z.string().regex(/^[a-z][a-z0-9-]*$/, '插件名必须是小写 kebab-case'),
  /** semver 版本号 */
  version: z.string().regex(/^\d+\.\d+\.\d+$/, '版本号必须是 semver（如 1.2.0）'),
  /** 渲染框架标记（已登记的见 docs/contracts.md 第四节） */
  framework: z.enum(['react', 'vue', 'html']),
  /** ESM 入口文件 */
  entry: z.string().min(1),
  /** 声明依赖的服务 key */
  inject: z.array(z.string()).optional(),
  /** 贡献到哪些插槽 */
  slots: z.array(z.string()).optional(),
  /** 会发出哪些事件（设计器据此自动建议连线） */
  emits: z.array(z.string()).optional(),
  /** 关心哪些事件 */
  listens: z.array(z.string()).optional(),
  /** 能力声明：宿主据此决定沙箱级别 */
  permissions: z.array(z.string()).optional(),
})

export type PluginManifest = z.infer<typeof ManifestSchema>

export function parseManifest(raw: unknown): PluginManifest {
  return ManifestSchema.parse(raw)
}

/* ---------------- 页面图纸（P2 核心，设计器的产物） ---------------- */

export const BlueprintSchema = z.object({
  /** 图纸格式版本，未来迁移用 */
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  title: z.string().min(1),
  /** 本页用到的插件及其配置 */
  plugins: z.array(
    z.object({
      name: z.string().min(1),
      version: z.string().optional(),
      config: z.record(z.string(), z.unknown()).optional(),
    }),
  ),
  /** 布局：哪个插件的贡献物进哪个插槽、排第几 */
  layout: z.array(
    z.object({
      slot: z.string().min(1),
      plugin: z.string().min(1),
      order: z.number().int().optional(),
    }),
  ),
  /** 事件连线：from 插件发出的 event 转发给 to 插件们 */
  wiring: z
    .array(
      z.object({
        event: z.string().min(1),
        from: z.string().min(1),
        to: z.array(z.string().min(1)),
      }),
    )
    .optional(),
})

export type PageBlueprint = z.infer<typeof BlueprintSchema>

export function parseBlueprint(raw: unknown): PageBlueprint {
  return BlueprintSchema.parse(raw)
}
