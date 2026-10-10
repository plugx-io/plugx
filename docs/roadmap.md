# 路线图

> 原则：**每阶段独立有收益，不许跳步。** 设计器和市场都是壳，Runtime 和 Schema 才是芯。

## P1 · 插件化内核（当前阶段）

**目标**：跑通"新增功能 = 新增一个插件文件，不碰存量代码"。

| 交付物 | 状态 |
|---|---|
| `packages/core` 插件运行时核 | ✅ |
| `packages/adapter-react`（Slot + hooks + 渲染器） | ✅ |
| `packages/adapter-vue`（Vue 渲染器） | ✅ |
| `packages/schema`（身份证 + 图纸类型） | ✅ 骨架 |
| `apps/playground` 跨框架验证场 | ✅ |
| 契约检查脚本（代码事件名 vs contracts.md 自动比对） | ⬜ 待认领 |
| AI 生成插件的脚手架命令 | ⬜ 待认领 |

**验收**：playground 里 React 卡片与 Vue 卡片同屏渲染，双方通过事件总线互发消息；卸载任一插件界面无残留。

## P2 · 图纸驱动

**目标**：把"手写 ctx.plugin()"变成"读 JSON 图纸自动装配"。

- `packages/assembler`：读 PageBlueprint → 动态 import 插件 → 挂载 → 按 wiring 接事件线
- playground 改为纯图纸驱动（页面内容全部来自 blueprint.json）
- 图纸的版本迁移机制（schemaVersion 字段）

**验收**：改 blueprint.json 不改一行代码，页面结构即变化。

## P3 · 设计器（低代码体验成型）

- 网页版拖拽画布：左物料（插件列表）、中画布、右属性/连线面板
- 产物即 PageBlueprint JSON；利用插件 manifest 声明的 emits/listens **自动建议事件连线**
- 实时预览 = playground 换皮

**验收**：不写代码拖出一个双卡片联动页面并导出图纸。

## P4 · 市场与平台化

- Registry：插件上架/审核/版本/契约校验
- 插件分级安全模型：官方认证 / 社区审核 / iframe 沙箱
- 商业化三档：Runtime 开源免费 / 云端设计器 SaaS / 私有化部署（Docker 打包整套）

**验收**：第三方按文档上架一个插件并被 playground 安装使用。

## 长远差异化（贯穿各阶段）

- **AI 即插件生产者**：契约稳定 → AI 按契约生成插件 → 爆炸半径被锁死。这是相对 Appsmith/ToolJet 的核心差异点。
- **垂直先赢**：优先服务安防大屏/政企场景（设备地图、视频墙、报警联动），不做通用平台正面竞争。
