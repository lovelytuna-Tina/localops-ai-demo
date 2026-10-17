---
name: LocalOps AI
description: 以渐变空间承托真实系统证据的专业 B 端 AI 项目案例设计系统。
colors:
  deep-ink: "#172033"
  soft-ink: "#47546c"
  muted-ink: "#58647b"
  evidence-blue: "#2f68f4"
  evidence-blue-deep: "#1746c8"
  glacier-blue: "#ddebff"
  mist-pink: "#f3a9cc"
  mist-pink-soft: "#ffe2f0"
  soft-violet: "#b8a5ff"
  soft-violet-light: "#e8e0ff"
  cool-paper: "#f8fbff"
  translucent-paper: "rgba(255, 255, 255, 0.86)"
  pure-paper: "#ffffff"
  hairline: "rgba(52, 72, 111, 0.15)"
  hairline-strong: "rgba(52, 72, 111, 0.24)"
  ambient-glacier: "rgba(102, 166, 255, 0.34)"
  ambient-mist: "rgba(246, 153, 198, 0.26)"
  ambient-violet: "rgba(169, 148, 255, 0.24)"
typography:
  display:
    fontFamily: '"Segoe UI Variable", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "clamp(42px, 5.1vw, 76px)"
    fontWeight: 720
    lineHeight: 1.06
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"Segoe UI Variable", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "clamp(40px, 4.4vw, 64px)"
    fontWeight: 720
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  editorial:
    fontFamily: '"Iowan Old Style", Baskerville, "Times New Roman", "Songti SC", serif'
    fontSize: "clamp(26px, 2.5vw, 38px)"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  title:
    fontFamily: '"Segoe UI Variable", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "normal"
  body:
    fontFamily: '"Segoe UI Variable", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.72
    letterSpacing: "normal"
  action:
    fontFamily: '"Segoe UI Variable", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "14px"
    fontWeight: 760
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: '"Segoe UI Variable", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: "12px"
    fontWeight: 750
    lineHeight: 1.5
    letterSpacing: "0.05em"
rounded:
  compact: "9px"
  mark: "10px"
  control: "12px"
  interactive: "13px"
  surface: "16px"
  pill: "999px"
spacing:
  hairline: "4px"
  compact: "8px"
  control: "12px"
  surface: "16px"
  roomy: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.evidence-blue-deep}"
    textColor: "{colors.pure-paper}"
    typography: "{typography.action}"
    rounded: "{rounded.interactive}"
    padding: "13px 20px"
  button-primary-hover:
    backgroundColor: "{colors.evidence-blue-deep}"
    textColor: "{colors.pure-paper}"
    typography: "{typography.action}"
    rounded: "{rounded.interactive}"
    padding: "13px 20px"
  button-dark:
    backgroundColor: "{colors.deep-ink}"
    textColor: "{colors.pure-paper}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-light:
    backgroundColor: "{colors.pure-paper}"
    textColor: "{colors.deep-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.interactive}"
    padding: "13px 20px"
  link-text:
    backgroundColor: "transparent"
    textColor: "{colors.deep-ink}"
    typography: "{typography.action}"
    rounded: "0"
    padding: "0"
  chip-proof:
    backgroundColor: "rgba(255, 255, 255, 0.45)"
    textColor: "{colors.soft-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 11px"
  nav-chapters:
    backgroundColor: "rgba(255, 255, 255, 0.58)"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.control}"
    padding: "4px"
  evidence-frame:
    backgroundColor: "{colors.pure-paper}"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.surface}"
    padding: "0"
  trail-marker:
    backgroundColor: "#f5f9ff"
    textColor: "{colors.evidence-blue-deep}"
    rounded: "{rounded.pill}"
    size: "40px"
  demo-panel:
    backgroundColor: "#111a34"
    textColor: "{colors.pure-paper}"
    rounded: "{rounded.surface}"
    padding: "clamp(44px, 6vw, 84px)"
---

# Design System: LocalOps AI

## Overview

**Creative North Star: "Gradient Evidence / 渐变证据场"**

“渐变证据场”把冰川蓝、雾粉与浅紫组织成明亮而克制的空间背景，让真实工作台截图成为页面里最有分量的证据。整体是一份专业、可信、带编辑感的 B 端作品集：大字号中文命题快速建立立场，细线和大面积留白维持理性秩序，渐变只负责空气与章节过渡。

设计不把 AI 当作装饰主题。按钮与演示入口坚定清楚，关键写入、人工确认和 Demo 行动拥有最高视觉优先级；框架半透明但不过度玻璃化，信息通过层次、轨迹和真实系统状态推进，而不是堆成通用卡片墙。

**Key Characteristics:**

- 真实产品界面优先于概念性视觉。
- 蓝粉浅紫渐变制造空间感，不进入文字填充。
- 巨大无衬线中文标题与有限编辑衬线形成张力。
- 平面细线为基础，仅在证据框架和核心 Demo 区使用环境式阴影。
- 固定章节导航与常驻演示入口让行动始终可达。

## Colors

色彩以冷纸面和深墨建立可信度，以证据蓝指示可操作与已验证内容，再用雾粉、浅紫和冰川蓝构成低对比的环境光场。

### Primary

- **证据蓝：** 用于主行动、活动章节、进度轨迹和可验证状态，必须与真正可操作或可核验的内容绑定。
- **深证据蓝：** 用于主要 CTA、图标和高权重强调，承担深色背景之外最明确的行动信号。

### Secondary

- **雾粉：** 用于环境渐变、章节色调变化和未来验证项的轻提示，不独立承担正文信息。
- **浅紫：** 连接证据蓝与雾粉，用于轨迹渐变和环境光晕，保持柔和而非霓虹。

### Tertiary

- **冰川蓝：** 提供首屏和页面底色的清澈空间感；其软色阶只做氛围或低权重选中态。

### Neutral

- **深墨：** 主文字、品牌标记与深色按钮的高对比基底。
- **柔墨：** 正文与说明文字，降低长篇阅读的视觉硬度。
- **静墨：** 元数据、图注和辅助标签。
- **冷纸面 / 纯纸面 / 半透纸面：** 负责页面、真实产品框架和轻量浮层，不制造厚重玻璃质感。
- **发丝线 / 强发丝线：** 建立表格、列表、轨迹和章节结构，是默认的分层手段。

### Named Rules

**The 证据优先 Rule.** 证据蓝只标记行动、当前状态或可核验事实；渐变负责空间，不负责替代信息层级。

**The 无渐变文字 Rule.** 所有标题和正文使用稳定实色，蓝粉紫只能出现在背景、光场、进度线或结构性细节中。

## Typography

**Display Font:** Segoe UI Variable（回退至 PingFang SC、Microsoft YaHei 与系统无衬线）

**Body Font:** Segoe UI Variable（回退至 PingFang SC、Microsoft YaHei 与系统无衬线）

**Editorial Font:** Iowan Old Style（回退至 Baskerville、Times New Roman 与 Songti SC）

**Character:** 中文无衬线承担信息密度、可信度和行动清晰度；编辑衬线只在英文品牌名、引述式命题和少量数字中出现，为理性的 B 端语气加入有限的人文节奏。

### Hierarchy

- **Display**（720，流体大标题，1.06 行高）：用于首屏主命题；巨大中文标题仍保持无衬线和紧凑字距。
- **Headline**（720，流体章节标题，1.1 行高）：用于章节级结论，控制在约 16 个中文字符宽度内。
- **Editorial**（500，流体编辑标题，1.4 行高）：用于品牌名、粘性命题和数据数字；通常配合斜体，但不承载长段正文。
- **Title**（720，20px，1.45 行高）：用于模块标题、步骤标题和价值分组。
- **Body**（400，16px，1.72 行高）：用于说明与案例叙述；正文列通常控制在约 36–40rem。
- **Action**（760，14px）：用于 CTA 和明确的文字行动。
- **Label**（750，12px，0.05em 字距）：用于证据类型、阶段、标签和图注中的高权重小字。

### Named Rules

**The 中文主标题 Rule.** 巨大中文主标题一律使用正文无衬线字体；展示衬线只做英文品牌、数字或短命题的编辑性点睛。

## Layout

页面采用宽幅、章节化的证据叙事。桌面内容容器上限为 1200px，左右至少保留 56px；常规章节以 `clamp(92px, 10vw, 144px)` 形成纵向节奏，标题与说明常用不对称双栏，真实产品截图获得更宽的证据列。Demo 核心区可扩展到 1320px，以独立深色场形成一次明确的节奏转换。

桌面顶部章节导航固定在 72px 高的半透明冷纸面上，右侧 44px 宽的竖向演示 CTA 常驻。1120px 及以下，章节导航下沉为可横向滚动的第二层，常驻 CTA 移至右下；820px 及以下，主叙事、证据与架构转为单列，四阶段轨迹从横向变为纵向；520px 及以下采用 66px 品牌行动行加 54px 章节行的固定双层头部，隐藏浮动 CTA，但保留右上演示 CTA。所有可见点击目标至少 44px。

空间节奏以 4、8、12、16、24、32px 为基础档位，但大结构允许 46–80px 的不对称间距。优先使用留白、细线和网格调整密度；不要用额外卡片包裹来修补布局。

## Elevation & Depth

系统平面为主，深度是少数证据元素的特权。列表、角色、路线图与架构外围依靠纸面色差、1px 发丝线和渐变光场分层；真实产品截图、架构核心和深色 Demo 区才使用大半径、低浓度的环境式阴影。半透明表面服务于空间连续性，不模拟厚重玻璃。

### Shadow Vocabulary

- **证据框架：** `0 30px 80px rgba(42, 62, 108, 0.19)`，用于真实产品截图框架。
- **架构核心：** `0 24px 64px rgba(47, 69, 112, 0.14)`，仅用于中央系统核心。
- **Demo 场：** `0 34px 90px rgba(18, 31, 67, 0.28)`，用于全页唯一的深色核心行动区。
- **常驻行动：** `0 18px 44px rgba(23, 70, 200, 0.28)`，用于桌面右侧演示入口；悬停提高至 `0 22px 52px rgba(23, 70, 200, 0.36)`。
- **行动反馈：** `0 15px 35px rgba(23, 70, 200, 0.23)`，只在主要 CTA 悬停时出现。

### Named Rules

**The 平面优先 Rule.** 默认表面不投影；只有真实产品证据、架构核心和 Demo 入口可以获得环境式柔和阴影。

## Shapes

形状语言是轻柔但不幼态：16px 用于产品框架、架构节点和核心区，12–13px 用于按钮与导航容器，9–10px 用于内部选项和品牌标记，999px 仅用于标签、标记点和胶囊。所有边框保持 1px 冷蓝灰细线；产品框架允许约 ±0.65° 的轻微旋转，创造纸面证据被摆入场景的感觉。

避免用圆角矩形包住每一段内容。角色分工、痛点、决策和价值清单优先共享边界线或开放留白；只有需要承载真实系统画面、关键行动或明确系统节点时才形成完整容器。

## Components

### Buttons

- **Shape:** 主要行动使用坚定的轻圆角矩形（13px）；导航 CTA 使用更紧凑的 12px 圆角。
- **Primary:** 深证据蓝底、纯纸面文字，内边距 13px × 20px，最小高度 50px；用于“开始全新演示”等关键写入或入口。
- **Hover / Focus:** 悬停上移 2px，并仅对主要行动增加柔和蓝色阴影；键盘焦点使用 3px 深蓝轮廓和 4px 外偏移。
- **Dark:** 深墨底、纯纸面文字，最小高度 44px；固定导航中的演示行动默认使用这一版本，悬停转为深证据蓝。
- **Light:** 纯纸面底、深墨文字，仅用于深色 Demo 场中的主行动。
- **Text:** 无底色，以 1px 深墨下划线形成次行动；保留至少 44px 的点击高度。

### Chips

- **Style:** 半透明纸面、1px 发丝线与完整胶囊圆角，文字使用柔墨；常规证据标签为 6px × 11px 内边距。
- **State:** 当前实现为静态项目标签或可靠性说明，不把胶囊当作装饰性按钮。

### Cards / Containers

- **Corner Style:** 完整证据框架使用 16px 圆角；开放内容默认无外框。
- **Background:** 产品证据使用纯纸面，架构外围节点可使用低透明纸面，核心 Demo 使用深墨蓝实色场。
- **Shadow Strategy:** 遵循“平面优先”，只对真实截图、架构核心和 Demo 场使用对应环境阴影。
- **Border:** 图注、来源、步骤和列表使用发丝线建立内部秩序。
- **Internal Padding:** 大容器采用 24–34px；Demo 场使用流体内边距。

### Navigation

顶部导航固定并使用半透明冷纸面。品牌标记深墨底、编辑衬线斜体字母；章节链接为 44px 最小高度、13px 半粗体，活动态以浅冰川蓝底和深证据蓝文字显示。手机端导航保持固定双层结构，章节行横向滚动，右上 CTA 始终保留。

### Campaign Trail

四阶段轨迹用 2px 蓝—紫—粉渐变线表达页面进度，40px 圆形标记承载细线图标。桌面横向推进，窄屏转为纵向；动效只随滚动揭示进度，并在 `prefers-reduced-motion` 下停止非必要运动。

### Evidence Frame

真实系统截图铺满纯纸面框架，底部 46px 图注明确标识“真实系统界面”和具体状态。框架允许极轻旋转与最多 ±14px 的桌面视差；移动端保持稳定、全宽展示，不用装饰图替代证据。

## Do's and Don'ts

### Do:

- Do 让真实产品截图、可验证流程和人工控制点承担视觉中心。
- Do 用细线、留白和渐变光场建立层次，保持冷纸面上的专业明亮感。
- Do 把关键写入与 Demo 入口做成坚定、清楚且至少 44px 的点击目标。
- Do 在桌面保留固定章节导航和右侧常驻 CTA，在手机保留固定双层头部、横向章节导航与右上 CTA。
- Do 为非必要滚动揭示、视差和色调变化提供 reduced-motion 静态回退。

### Don't:

- Don't 使用人物照片、装饰性 AI 插画、WebGL 或重型 3D。
- Don't 使用渐变文字、通用卡片墙或粗侧边彩色强调线。
- Don't 让半透明表面演变成过度玻璃化，或为普通内容堆叠阴影。
- Don't 用概念图、模型想象或虚构商业成果替代真实系统证据。
- Don't 把编辑衬线用于巨大中文主标题或长篇正文。
