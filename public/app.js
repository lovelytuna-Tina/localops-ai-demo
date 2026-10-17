const app = document.querySelector("#app");

const STORAGE_KEY = "localops-ai-poc-v1.1";
const initialState = {
  view: "assistant",
  stage: "brief",
  budgetIncludesTraffic: null,
  selectedPlan: "balanced",
  selectedCreatorIds: [],
  replacementConfirmed: false,
  planConfirmed: false,
  script: null,
  scriptMode: null,
  scriptVersion: 1,
  scriptApproved: false,
  dataLoaded: false,
  analysis: null,
  analysisMode: null,
  tasksCreated: false,
  busy: false,
  chat: [
    {
      role: "assistant",
      html: "你好，我是 <strong>LocalOps AI</strong>。当前已进入「沸点火锅 · 上海新品套餐达人投放」Campaign。你可以直接描述目标，我会调用达人库、品牌知识库和历史案例完成方案。"
    }
  ],
  activity: [
    { time: "今天 09:30", title: "POC项目已创建", detail: "已载入8家虚构门店、达人样本库与品牌规则。" }
  ]
};

let data;
let modelStatus = { mode: "demo", model: "qwen-plus", qwenConfigured: false };
let state = loadState();
let resetModalOpen = false;

function loadState() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("fresh") === "1") {
    localStorage.removeItem(STORAGE_KEY);
    url.searchParams.delete("fresh");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  try {
    return { ...initialState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setState(patch, shouldRender = true) {
  state = { ...state, ...patch };
  saveState();
  if (shouldRender) render();
}

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const yuan = value => `¥${Number(value).toLocaleString("zh-CN")}`;
const number = value => Number(value).toLocaleString("zh-CN");
const pct = value => `${(Number(value) * 100).toFixed(value < 0.1 ? 2 : 0)}%`;
const creatorById = id => data.creators.find(item => item.id === id);

function selectedCreators() {
  const ids = state.selectedCreatorIds.length ? state.selectedCreatorIds : data.campaign.selectedCreatorIds;
  return ids.map(creatorById).filter(Boolean);
}

function weightedScore(creator) {
  const s = creator.scores;
  return Math.round(s.audience * .2 + s.category * .15 + s.conversion * .3 + s.content * .1 + s.delivery * .15 + s.cost * .1);
}

function campaignStatus() {
  if (state.tasksCreated) return ["优化执行中", "purple"];
  if (state.dataLoaded) return ["投后复盘", "orange"];
  if (state.scriptApproved) return ["投放执行中", "green"];
  if (state.planConfirmed) return ["内容待审核", "blue"];
  if (state.stage === "plans") return ["方案待确认", "orange"];
  return ["需求待补充", "blue"];
}

function addActivity(title, detail) {
  state.activity = [{ time: "刚刚", title, detail }, ...state.activity].slice(0, 10);
}

function addChat(role, html) {
  state.chat = [...state.chat, { role, html }];
}

function showToast(message) {
  const old = document.querySelector(".toast");
  if (old) old.remove();
  const toast = document.createElement("div");
  toast.className = "toast show";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3400);
}

function workflowStep() {
  if (state.tasksCreated || state.dataLoaded || state.scriptApproved) return 3;
  if (state.planConfirmed) return 2;
  if (state.stage === "plans") return 1;
  return 0;
}

function renderWorkflowStrip() {
  const current = workflowStep();
  const steps = [
    ["需求澄清", "AI补齐约束"],
    ["达人方案", "项目经理确认"],
    ["内容审核", "内容审核确认"],
    ["投后复盘", "多角色协同"]
  ];
  return `<div class="workflow-strip" aria-label="Campaign交付进度">${steps.map(([name, owner], index) => {
    const status = index < current ? "is-done" : index === current ? "is-current" : "";
    return `<div class="workflow-step ${status}" ${index === current ? 'aria-current="step"' : ""}><span class="workflow-marker">${index < current ? "✓" : index + 1}</span><span><strong>${name}</strong><small>${owner}</small></span></div>`;
  }).join("")}</div>`;
}

function icon(name) {
  const paths = {
    assistant: '<path d="M12 3l1.35 4.15L17.5 8.5l-4.15 1.35L12 14l-1.35-4.15L6.5 8.5l4.15-1.35L12 3Z"/><path d="M18.5 14.5l.75 2.25 2.25.75-2.25.75L18.5 20.5l-.75-2.25-2.25-.75 2.25-.75.75-2.25Z"/>',
    campaign: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    creators: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.5c2.9-.5 4.8 1 5.2 3.5"/>',
    content: '<path d="M5 19l1-4L16.7 4.3a2.1 2.1 0 0 1 3 3L9 18l-4 1Z"/><path d="M14.8 6.2l3 3"/>',
    analysis: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}

function navButton(id, label) {
  return `<button class="nav-button ${state.view === id ? "is-active" : ""}" data-nav="${id}"><span class="nav-icon">${icon(id)}</span><span>${label}</span></button>`;
}

function renderSuggestions() {
  if (state.stage === "brief") return `<button class="suggestion" data-prompt="我要给沸点火锅做上海8家店的达人投放，预算5万，目标500单">创建达人投放方案</button>`;
  if (state.stage === "plans" && !state.planConfirmed) return `<button class="suggestion" data-nav="creators">查看达人明细</button>`;
  if (state.planConfirmed && !state.scriptApproved) return `<button class="suggestion" data-nav="content">进入内容审核</button>`;
  if (state.scriptApproved) return `<button class="suggestion" data-nav="analysis">进入投后复盘</button>`;
  return "";
}

function render() {
  const [statusText, statusColor] = campaignStatus();
  const headings = {
    assistant: ["AI 智能运营助手", "用自然语言驱动本次 Campaign"],
    campaign: ["Campaign 总览", "目标、边界与项目状态一处同步"],
    creators: ["达人智能推荐", "可解释评分、方案比较与人工确认"],
    content: ["内容工作台", "生成、编辑、校验与人工审核"],
    analysis: ["投后分析", "从业务数据到可执行任务闭环"]
  };
  const [title, subtitle] = headings[state.view];
  app.innerHTML = `
    <div class="app-shell" ${resetModalOpen ? "inert" : ""}>
      <aside class="sidebar">
        <div class="brand"><div class="brand-mark">L</div><div><div class="brand-name">LocalOps AI</div><div class="brand-subtitle">本地生活智能运营助手</div></div></div>
        <div class="project-switcher">
          <div class="small muted">当前 Campaign</div>
          <div class="strong mt-12">沸点火锅 · 上海</div>
          <div class="project-meta">8家门店｜199元双人套餐</div>
          <span class="tag ${statusColor} project-state">${statusText}</span>
        </div>
        <nav class="nav-list" aria-label="主导航">
          ${navButton("assistant", "AI 助手")}
          ${navButton("campaign", "项目总览")}
          ${navButton("creators", "达人推荐")}
          ${navButton("content", "内容工作台")}
          ${navButton("analysis", "投后分析")}
        </nav>
        <div class="sidebar-footer">
          <div class="mode-card">
            <div class="mode-row"><span class="strong">模型服务</span><span class="tag ${modelStatus.mode === "qwen" ? "green" : "blue"}">${modelStatus.mode === "qwen" ? "千问在线" : "演示兜底"}</span></div>
            <div class="mode-detail">${modelStatus.mode === "qwen" ? esc(modelStatus.model) : "无网络也可完整演示"}</div>
          </div>
          <button class="button full" data-action="reset">重置演示</button>
        </div>
      </aside>
      <main class="main-shell">
        <header class="topbar">
          <div class="page-heading"><h1>${title}</h1><p>${subtitle}</p></div>
          <div class="top-actions"><span class="tag blue">虚构业务数据</span><span class="tag green">POC</span><button class="button" data-nav="campaign">查看项目状态</button><button class="button mobile-only" data-action="reset">重置</button></div>
        </header>
        ${renderWorkflowStrip()}
        <section class="page">${renderView()}</section>
      </main>
    </div>
    ${resetModalOpen ? renderResetModal() : ""}`;
  bindEvents();
}

function renderView() {
  if (state.view === "campaign") return renderCampaign();
  if (state.view === "creators") return renderCreators();
  if (state.view === "content") return renderContent();
  if (state.view === "analysis") return renderAnalysis();
  return renderAssistant();
}

function renderAssistant() {
  const c = data.campaign;
  return `<div class="page-grid two-column">
    <article class="card assistant-card">
      <div class="card-header"><div><h2>Campaign Copilot</h2><div class="card-title-sub">Agent会主动补齐关键信息，并在写入业务状态前请求人工确认</div></div><span class="tag purple">多工具协同</span></div>
      <div class="chat-feed" id="chat-feed">
        ${state.chat.map((message, index) => renderMessage(message, index)).join("")}
        ${assistantResult()}
      </div>
      <div class="chat-footer">
        <div class="suggestions">${renderSuggestions()}</div>
        <form class="chat-input-row" id="chat-form">
          <input class="chat-input" id="chat-input" aria-label="给AI助手发送消息" placeholder="例如：我要做上海8家店的达人投放，预算5万，目标500单" ${state.busy ? "disabled" : ""}>
          <button class="button primary" type="submit" ${state.busy ? "disabled" : ""}>${state.busy ? "处理中…" : "发送"}</button>
        </form>
      </div>
    </article>
    <aside class="stack">
      <article class="card"><div class="card-header"><div><h2>业务目标</h2><div class="card-title-sub">Agent正在使用的 Campaign 上下文</div></div></div><div class="card-body">
        <div class="kpi-grid">
          ${kpi("门店", "8家", "上海核心商圈")}${kpi("预算上限", yuan(c.creatorBudgetCap), `达人费${yuan(c.plannedCreatorCost)}`)}${kpi("目标订单", number(c.targetOrders), "7日支付归因")}${kpi("目标ROI", `≥ ${c.targetRoiThreshold.toFixed(1)}`, `目标GMV ${yuan(c.targetGmv)}`)}
        </div>
        <div class="notice info mt-16"><strong>POC边界：</strong>数据均为虚构样本，用于验证业务流程、Agent决策和人工确认闭环，不代表真实经营结果。</div>
      </div></article>
      <article class="card"><div class="card-header"><div><h2>Agent执行轨迹</h2><div class="card-title-sub">把“为什么这么推荐”讲清楚</div></div></div><div class="card-body"><div class="trace-list">${renderTrace()}</div></div></article>
    </aside>
  </div>`;
}

function renderMessage(message, index) {
  return `<div class="message ${message.role}"><div class="avatar">${message.role === "user" ? "我" : "AI"}</div><div><div class="bubble">${message.html}</div><div class="message-time">${index === state.chat.length - 1 ? "刚刚" : "本次会话"}</div></div></div>`;
}

function assistantResult() {
  if (state.stage === "plans") {
    return `<div class="chat-result"><div class="chat-result-inner">
      <div class="mode-row"><strong>已生成3套投放方案</strong><span class="tag green">约束校验通过</span></div>
      <p class="muted small mt-12">均未超过5万元达人预算。建议选择“均衡型”，兼顾曝光、垂类转化和门店覆盖。</p>
      <div class="plan-grid mt-12">${data.campaign.plans.map(plan => compactPlan(plan)).join("")}</div>
      <div class="action-row mt-16"><button class="button primary" data-nav="creators">查看达人明细与替换</button>${!state.planConfirmed ? `<button class="button" data-action="confirm-plan">按推荐方案</button>` : `<span class="tag green">方案已确认</span>`}</div>
    </div></div>`;
  }
  if (state.stage === "clarify") {
    return `<div class="chat-result"><div class="chat-result-inner"><strong>请选择预算口径</strong><p class="muted small mt-12">这是影响达人数量、组合结构和效果预估的关键约束。</p><div class="action-row mt-12"><button class="button primary" data-action="budget-creator">不含，5万全部用于达人合作</button><button class="button" data-action="budget-all">包含，达人费与投流共5万</button></div></div></div>`;
  }
  if (state.stage === "budget-scope") {
    return `<div class="chat-result"><div class="chat-result-inner"><div class="mode-row"><strong>已保留“包含投流”的预算口径</strong><span class="tag orange">需要补充数据</span></div><p class="muted small mt-12">当前POC只有达人合作费样本，没有投流成本与增量转化数据，直接估算会产生虚假精度。</p><div class="notice warning mt-12">可以回到预算问题，或明确将本次POC切换为“5万元全部用于达人合作”后继续。</div><div class="action-row mt-12"><button class="button primary" data-action="switch-creator-budget">切换为全部达人费并继续</button><button class="button" data-action="back-budget">返回预算问题</button></div></div></div>`;
  }
  return "";
}

function compactPlan(plan) {
  return `<div class="plan-card ${plan.recommended ? "selected" : ""}"><div class="plan-card-head"><div class="plan-name">${esc(plan.name)}</div>${plan.recommended ? `<div class="recommended-ribbon">执行方案</div>` : `<div class="recommended-ribbon muted">对比</div>`}</div><div class="plan-metrics"><div><span>预算</span><strong>${yuan(plan.cost)}</strong></div><div><span>订单预估</span><strong>${number(plan.predictedOrders)}</strong></div><div><span>ROI区间</span><strong>${plan.roiRange[0]}～${plan.roiRange[1]}</strong></div></div></div>`;
}

function renderTrace() {
  const steps = [
    ["理解业务目标", "上海8店、199元套餐、7日归因、目标500单", true],
    ["补齐预算口径", state.budgetIncludesTraffic === null ? "等待确认达人费是否包含投流" : state.budgetIncludesTraffic ? "已记录包含投流，等待补充拆分数据" : "已确认5万元全部用于达人合作", state.budgetIncludesTraffic !== null],
    ["检索业务知识", "达人库12人、品牌规则6条、历史案例4条", state.stage === "plans" || state.planConfirmed],
    ["生成并校验方案", "预算、履约、人群、预估ROI四类约束", state.stage === "plans" || state.planConfirmed],
    ["人工确认后写入", state.planConfirmed ? "均衡型方案已写入Campaign" : "尚未改变业务状态", state.planConfirmed]
  ];
  return steps.map(([title, detail, done]) => `<div class="trace-item"><span class="trace-dot ${done ? "done" : ""}"></span><div><div class="trace-title">${title}</div><div class="trace-detail">${detail}</div></div></div>`).join("");
}

function renderCampaign() {
  const c = data.campaign;
  const [statusText, statusColor] = campaignStatus();
  return `<div class="stack">
    <div class="kpi-grid">${kpi("项目状态", statusText, "人工确认驱动状态流转")}${kpi("达人预算", yuan(c.plannedCreatorCost), `${yuan(c.reserveBudget)}机动预留`)}${kpi("目标订单", number(c.targetOrders), `目标GMV ${yuan(c.targetGmv)}`)}${kpi("归因口径", "7日支付", "30日核销持续观察")}</div>
    <div class="page-grid two-column">
      <article class="card"><div class="card-header"><div><h2>项目简报</h2><div class="card-title-sub">从业务语言转换为可执行约束</div></div><span class="tag ${statusColor}">${statusText}</span></div><div class="card-body">
        <div class="table-wrap"><table class="table"><tbody>
          ${summaryRow("投放主题", c.title)}${summaryRow("商品与价格", `${c.product.name}（门市价${yuan(c.product.listPrice)}）`)}${summaryRow("核心人群", c.audience)}${summaryRow("内容形态", c.contentType)}${summaryRow("达人预算口径", `上限${yuan(c.creatorBudgetCap)}，计划${yuan(c.plannedCreatorCost)}，预留${yuan(c.reserveBudget)}`)}${summaryRow("效果定义", `${c.attribution}；ROI目标≥${c.targetRoiThreshold.toFixed(1)}`)}
        </tbody></table></div>
        <div class="notice warning mt-16"><strong>待后续补全：</strong>真实项目上线前仍需接入达人平台数据、门店交易数据、最终合同报价和内容审核规则。</div>
      </div></article>
      <article class="card"><div class="card-header"><div><h2>状态流转记录</h2><div class="card-title-sub">可追溯、可复盘</div></div></div><div class="card-body"><div class="timeline">${state.activity.map((item, i) => `<div class="timeline-item"><div class="timeline-time">${esc(item.time)}</div><div class="timeline-rail"><span class="timeline-dot ${i === 0 ? "active" : ""}"></span></div><div class="timeline-content"><strong>${esc(item.title)}</strong><p>${esc(item.detail)}</p></div></div>`).join("")}</div></div></article>
    </div>
    <article class="card"><div class="card-header"><div><h2>覆盖门店</h2><div class="card-title-sub">本次POC限定上海8家虚构门店</div></div></div><div class="table-wrap"><table class="table"><thead><tr><th>门店</th><th>行政区</th><th>核心商圈</th><th class="text-right">目标订单</th>${state.dataLoaded ? `<th class="text-right">实际订单</th><th class="text-right">完成率</th>` : ""}</tr></thead><tbody>${data.stores.map(store => `<tr><td class="strong">${esc(store.name)}</td><td>${esc(store.district)}</td><td>${esc(store.businessArea)}</td><td class="text-right">${store.targetOrders}</td>${state.dataLoaded ? `<td class="text-right">${store.actualOrders}</td><td class="text-right"><span class="tag ${store.actualOrders / store.targetOrders >= .9 ? "green" : store.actualOrders / store.targetOrders < .75 ? "red" : "orange"}">${pct(store.actualOrders / store.targetOrders)}</span></td>` : ""}</tr>`).join("")}</tbody></table></div></article>
  </div>`;
}

function summaryRow(label, value) {
  return `<tr><td class="muted" style="width:128px">${label}</td><td>${esc(value)}</td></tr>`;
}

function renderCreators() {
  const creators = selectedCreators();
  const cost = creators.reduce((sum, item) => sum + item.quote, 0);
  const replacement = { from: creatorById("minhang"), to: creatorById("dealcheck") };
  return `<div class="stack">
    <article class="card"><div class="card-header"><div><h2>三套策略对比</h2><div class="card-title-sub">本POC执行均衡型；其余方案只用于呈现风险与收益取舍</div></div><span class="tag blue">决策边界透明</span></div><div class="card-body"><div class="plan-grid">${data.campaign.plans.map(plan => detailedPlan(plan)).join("")}</div><div class="notice info">稳健型与冲量型缺少完整达人明细和投后样本，因此不伪装为可执行选择；真实试点会补齐数据后开放选择与重算。</div></div></article>
    <div class="page-grid two-column">
      <article class="card"><div class="card-header"><div><h2>均衡型 · 达人组合</h2><div class="card-title-sub">综合人群、垂类、历史转化、内容与履约评分</div></div><div><span class="tag green">${creators.length}位达人</span> <span class="tag blue">${yuan(cost)}</span></div></div>
        <div class="table-scroll-hint">横向滚动可查看全部评分维度</div><div class="table-wrap"><table class="table creator-table"><thead><tr><th>达人</th><th>定位</th><th class="text-right">报价</th><th class="text-right">历史ROI</th><th>综合分</th><th>风险</th></tr></thead><tbody>${creators.map(renderCreatorRow).join("")}</tbody></table></div>
      </article>
      <aside class="stack">
        <article class="card"><div class="card-header"><div><h2>推荐依据</h2><div class="card-title-sub">不是只按粉丝量排序</div></div></div><div class="card-body"><div class="check-list">
          ${check("转化表现 30%", "历史支付转化率与ROI，优先保障业务结果")}${check("人群匹配 20%", "上海受众与20～35岁女性占比")}${check("垂类匹配 15%", "火锅、美食、本地生活场景贴合度")}${check("履约稳定 15%", "准时率、内容一次通过率与档期")}${check("内容与成本 20%", "表达风格、平均播放与报价效率")}
        </div><div class="notice info mt-16">预测区间来自虚构历史样本，只用于POC验证；真实上线应以平台数据回测并校准。</div></div></article>
        <article class="card"><div class="card-header"><div><h2>替换模拟</h2><div class="card-title-sub">Agent提出建议，最终由项目经理确认</div></div></div><div class="card-body">
          ${state.replacementConfirmed ? `<div class="notice success"><strong>已完成替换：</strong>闵行饭搭子 → 套餐侦探社。总预算保持${yuan(47500)}，增强团购利益点表达。</div>` : `<div class="comparison"><div class="comparison-card"><strong>${replacement.from.name}</strong><span>综合分 ${weightedScore(replacement.from)}</span><span>预估${replacement.from.expectedOrders}单</span></div><div class="comparison-arrow">${icon("arrow")}</div><div class="comparison-card"><strong>${replacement.to.name}</strong><span>综合分 ${weightedScore(replacement.to)}</span><span>预估${replacement.to.expectedOrders}单</span></div></div><div class="notice info mt-12">建议理由：报价相同，套餐侦探社历史团购转化与成本效率更高；模型整体预测仍按520单保守去重。</div><div class="action-row mt-12"><button class="button primary" data-action="confirm-replacement">确认替换</button><button class="button" data-action="keep-creator">保留原达人</button></div>`}
        </div></article>
      </aside>
    </div>
    <article class="card"><div class="card-body"><div class="mode-row"><div><strong>${state.planConfirmed ? "均衡型方案已确认" : "方案尚未写入 Campaign"}</strong><div class="small muted mt-12">${state.planConfirmed ? "已由项目经理写入 Campaign，下一步进入内容生产与人工审核。" : "人工确认后，才会进入内容生产与审核环节。"}</div></div>${state.planConfirmed ? `<div class="action-row"><span class="tag green">已写入</span><button class="button primary" data-nav="content">进入内容工作台</button></div>` : `<button class="button primary" data-action="confirm-plan">按推荐方案并确认</button>`}</div></div></article>
  </div>`;
}

function detailedPlan(plan) {
  return `<div class="plan-card ${plan.id === "balanced" ? "selected" : ""}"><div class="plan-card-head"><div class="plan-title-row"><div class="plan-name">${esc(plan.name)}</div><span class="tag ${plan.risk === "高" ? "red" : plan.risk === "低" ? "green" : "orange"}">${esc(plan.risk)}风险</span></div><div class="recommended-ribbon ${plan.id === "balanced" ? "" : "muted"}">${plan.id === "balanced" ? "本次执行" : "对比方案"}</div></div><p class="plan-description">${esc(plan.description)}</p><div class="plan-metrics"><div><span>达人预算</span><strong>${yuan(plan.cost)}</strong></div><div><span>订单区间</span><strong>${plan.orderRange.join("～")}</strong></div><div><span>ROI区间</span><strong>${plan.roiRange.join("～")}</strong></div></div></div>`;
}

function renderCreatorRow(creator) {
  const score = weightedScore(creator);
  return `<tr><td data-label="达人"><div class="creator-cell"><div class="creator-avatar">${esc(creator.name.slice(0, 1))}</div><div><div class="creator-name">${esc(creator.name)}</div><div class="creator-meta">${number(creator.followers)}粉丝 · 上海受众${pct(creator.shanghaiAudience)}</div></div></div></td><td data-label="定位">${esc(creator.position)}</td><td data-label="报价" class="text-right">${yuan(creator.quote)}</td><td data-label="历史ROI" class="text-right">${creator.historicalRoi.toFixed(2)}</td><td data-label="综合分"><div class="score"><strong>${score}</strong><div class="score-bar"><div class="score-fill" style="width:${score}%"></div></div></div></td><td data-label="风险"><span class="tag ${creator.risk === "低" ? "green" : "orange"}">${esc(creator.risk)}</span></td></tr>`;
}

function renderContent() {
  if (!state.planConfirmed) return gatedEmpty("内容工作台尚未开放", "请先确认达人投放方案，再生成与审核内容。", "creators", "去确认达人方案");
  if (!state.script) return `<article class="card"><div class="empty-state"><div class="empty-icon">${icon("content")}</div><h2>为均衡型达人组合生成首版脚本</h2><p>Agent将检索品牌卖点、套餐规则与内容风险案例，输出45秒探店脚本和审核提示。</p><div class="notice info">千问不可用时会自动切换为已校验的演示结果，确保离线演示流程不中断。</div><button class="button primary mt-16" data-action="generate-script" ${state.busy ? "disabled" : ""}>${state.busy ? "正在生成…" : "生成45秒探店脚本"}</button></div></article>`;
  const script = state.script;
  return `<div class="stack">
    <div class="kpi-grid">${kpi("内容状态", state.scriptApproved ? "人工审核通过" : "待人工审核", state.scriptApproved ? `v${state.scriptVersion} 已锁定` : `v${state.scriptVersion} · Agent不会自动发布`)}${kpi("脚本时长", "45秒", "5段沉浸式结构")}${kpi("适用门店", "上海8店", "以门店规则为准")}${kpi("生成方式", state.scriptMode === "qwen" ? "千问在线" : "演示兜底", state.scriptMode === "qwen" ? modelStatus.model : "稳定可复现")}</div>
    <div class="content-action-dock"><div><span class="tag ${state.scriptApproved ? "green" : "orange"}">脚本 v${state.scriptVersion}</span><strong>${state.scriptApproved ? "已锁定审核版本" : "请确认脚本与合规检查后提交审核"}</strong><small>${state.scriptApproved ? "修改前需先发起修订，避免审批版本被无声覆盖。" : "所有发布动作均保留人工控制点。"}</small></div><div class="action-row">${state.scriptApproved ? `<button class="button" data-action="revise-script">发起修订</button><button class="button primary" data-nav="analysis">推进至投后一周</button>` : `<button class="button" data-action="regenerate-script">重新生成</button><button class="button primary" data-action="approve-script">人工审核通过</button>`}</div></div>
    <div class="script-grid">
      <article class="card"><div class="card-header"><div><h2>探店脚本</h2><div class="card-title-sub">${state.scriptApproved ? "审核版本已锁定；发起修订后才能编辑" : "可直接编辑；修改保存在当前浏览器"}</div></div><span class="tag ${state.scriptApproved ? "green" : "orange"}">${state.scriptApproved ? "已审核锁定" : "待审核"}</span></div><div class="card-body"><div class="notice info">${esc(script.summary)}</div><div class="table-wrap mt-16"><table class="table script-table"><thead><tr><th>时段</th><th>任务</th><th>画面</th><th>口播 / 字幕（可编辑）</th></tr></thead><tbody>${script.script.map((row, index) => `<tr><td data-label="时段" class="strong">${esc(row.time)}</td><td data-label="任务">${esc(row.goal)}</td><td data-label="画面">${esc(row.visual)}</td><td data-label="口播与字幕"><label class="field-label" for="voiceover-${index}">口播 · ${esc(row.time)}</label><textarea id="voiceover-${index}" class="script-input" data-script-field="voiceover" data-index="${index}" ${state.scriptApproved ? "disabled" : ""}>${esc(row.voiceover)}</textarea><label class="field-label mt-12" for="overlay-${index}">字幕 · ${esc(row.time)}</label><textarea id="overlay-${index}" class="script-input" data-script-field="overlay" data-index="${index}" ${state.scriptApproved ? "disabled" : ""}>${esc(row.overlay)}</textarea></td></tr>`).join("")}</tbody></table></div></div></article>
      <aside class="stack">
        <article class="card"><div class="card-header"><div><h2>可选开场钩子</h2><div class="card-title-sub">利益点前置到前3秒</div></div></div><div class="card-body"><div class="hook-list">${script.hooks.map((hook, i) => `<button class="hook" data-action="use-hook" data-index="${i}" ${state.scriptApproved ? "disabled" : ""}><span>${i + 1}</span>${esc(hook)}</button>`).join("")}</div></div></article>
        <article class="card"><div class="card-header"><div><h2>内容校验</h2><div class="card-title-sub">Agent辅助检查，不替代人工审核</div></div></div><div class="card-body"><div class="check-list">${script.checks.map(item => `<div class="check-item"><div class="check-head"><strong>${esc(item.rule)}</strong><span class="tag green">${esc(item.status)}</span></div><div class="check-note">${esc(item.note)}</div></div>`).join("")}</div><div class="divider"></div>${state.scriptApproved ? `<div class="notice success"><strong>v${state.scriptVersion} 已由内容审核确认并锁定。</strong>Campaign进入“投放执行中”。</div>` : `<div class="notice warning">提交审核后将锁定当前版本；如需修改，请发起新版本。</div>`}</div></article>
      </aside>
    </div>
  </div>`;
}

function renderAnalysis() {
  if (!state.scriptApproved) return gatedEmpty("投后分析尚未开放", "请先完成达人方案确认和内容人工审核。", state.planConfirmed ? "content" : "creators", state.planConfirmed ? "去审核内容" : "去确认方案");
  if (!state.dataLoaded) return `<article class="card"><div class="empty-state"><div class="empty-icon">${icon("analysis")}</div><h2>模拟推进到投后一周</h2><p>载入虚构的7日支付归因数据，用于验证“数据分析 → 问题诊断 → 任务闭环”。</p><div class="notice warning"><strong>演示口径：</strong>以下不是平台真实数据；支付归因观察7天，30天核销周期尚未结束。</div><button class="button primary mt-16" data-action="load-data">模拟推进至投后一周并载入数据</button></div></article>`;
  const p = data.performance;
  return `<div class="stack">
    <div class="notice warning"><strong>POC模拟数据：</strong>数据为固定虚构样本，便于现场稳定复现。口径为达人内容发布后7日支付订单；30日核销周期未结束。</div>
    <div class="kpi-grid">${kpi("支付订单", number(p.summary.actualOrders), `目标${p.summary.targetOrders} · 完成${pct(p.summary.completionRate)}`)}${kpi("支付GMV", yuan(p.summary.gmv), `客单价${yuan(p.summary.price)}`)}${kpi("支付ROI", p.summary.roi.toFixed(2), `目标≥${data.campaign.targetRoiThreshold.toFixed(1)}`, "danger")}${kpi("总播放量", number(p.summary.totalViews), "曝光高但转化分化")}</div>
    <div class="page-grid two-column">
      <article class="card"><div class="card-header"><div><h2>转化漏斗</h2><div class="card-title-sub">识别曝光到支付的关键掉点</div></div></div><div class="card-body"><div class="funnel">${p.funnel.map((item, index) => renderFunnel(item, index, p.funnel[0].value)).join("")}</div></div></article>
      <article class="card"><div class="card-header"><div><h2>Agent诊断</h2><div class="card-title-sub">严格区分数据事实与待验证推断</div></div>${state.analysis ? `<span class="tag ${state.analysisMode === "qwen" ? "green" : "blue"}">${state.analysisMode === "qwen" ? "千问生成" : "演示兜底"}</span>` : ""}</div><div class="card-body">${state.analysis ? renderDiagnosis() : `<div class="empty-state"><div class="empty-icon">${icon("assistant")}</div><p>已完成数据载入，等待Agent分析达人表现、门店差异与漏斗问题。</p><button class="button primary" data-action="run-analysis" ${state.busy ? "disabled" : ""}>${state.busy ? "分析中…" : "让Agent诊断"}</button></div>`}</div></article>
    </div>
    <article class="card"><div class="card-header"><div><h2>达人投后表现</h2><div class="card-title-sub">刻意展示“高曝光低转化”和“低曝光高ROI”的业务差异</div></div></div><div class="table-scroll-hint">横向滚动可查看GMV、成本与诊断</div><div class="table-wrap"><table class="table"><thead><tr><th>达人</th><th class="text-right">播放</th><th class="text-right">订单</th><th class="text-right">GMV</th><th class="text-right">成本</th><th class="text-right">ROI</th><th>诊断</th></tr></thead><tbody>${p.creators.map((row, i) => renderPerformanceRow(row, i)).join("")}</tbody></table></div></article>
    <article class="card"><div class="card-header"><div><h2>门店承接表现</h2><div class="card-title-sub">项目经理需要联动门店验证线上流量与线下承接</div></div></div><div class="table-scroll-hint">横向滚动可查看访问与支付转化</div><div class="table-wrap"><table class="table"><thead><tr><th>门店</th><th>商圈</th><th class="text-right">目标订单</th><th class="text-right">实际订单</th><th class="text-right">完成率</th><th class="text-right">归因访问</th><th class="text-right">支付转化率</th></tr></thead><tbody>${data.stores.map(store => `<tr><td class="strong">${esc(store.name)}</td><td>${esc(store.businessArea)}</td><td class="text-right">${store.targetOrders}</td><td class="text-right">${store.actualOrders}</td><td class="text-right">${pct(store.actualOrders / store.targetOrders)}</td><td class="text-right">${number(store.attributedVisits)}</td><td class="text-right"><span class="tag ${store.conversionRate < .015 ? "red" : store.conversionRate >= .02 ? "green" : "orange"}">${pct(store.conversionRate)}</span></td></tr>`).join("")}</tbody></table></div></article>
    ${state.tasksCreated ? renderKanban() : ""}
  </div>`;
}

function renderFunnel(item, index, max) {
  const width = Math.max(4, Math.sqrt(item.value / max) * 100);
  const label = index === 0 ? "基准" : index === 1 ? `播放→互动 ${pct(item.rate)}` : `上一步→本步 ${pct(item.rate)}`;
  return `<div class="funnel-row"><div class="funnel-name"><strong>${esc(item.name)}</strong><span>${label}</span></div><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div><div class="funnel-value">${number(item.value)}</div></div>`;
}

function renderPerformanceRow(row, index) {
  let id = row.creatorId;
  if (index === data.performance.creators.length - 1 && state.replacementConfirmed) id = "dealcheck";
  const creator = creatorById(id);
  return `<tr class="${row.roi < 1 ? "row-danger" : row.roi > 2.5 ? "row-success" : ""}"><td class="strong">${esc(creator?.name || id)}</td><td class="text-right">${number(row.views)}</td><td class="text-right">${row.orders}</td><td class="text-right">${yuan(row.gmv)}</td><td class="text-right">${yuan(row.cost)}</td><td class="text-right"><span class="tag ${row.roi < 1 ? "red" : row.roi >= 2 ? "green" : "orange"}">${row.roi.toFixed(2)}</span></td><td>${esc(row.diagnosis)}</td></tr>`;
}

function renderDiagnosis() {
  const analysis = state.analysis;
  return `<p class="strong">${esc(analysis.summary)}</p><div class="insight-list mt-16">${analysis.findings.map(item => `<div class="insight"><div class="insight-head"><div class="insight-title">${esc(item.title)}</div><span class="tag ${item.type === "事实" ? "green" : "orange"}">${esc(item.type)}</span></div><div class="insight-evidence">${esc(item.evidence)}</div></div>`).join("")}</div><div class="divider"></div><strong>建议动作</strong><ol class="recommendation-list">${analysis.recommendations.map(item => `<li>${esc(item)}</li>`).join("")}</ol>${state.tasksCreated ? `<div class="notice success mt-16">已由项目经理确认并生成5项协同任务。</div>` : `<div class="notice warning mt-16">Agent已生成预设分工，写入任务看板前请由项目经理核对。</div><details class="task-preview mt-12"><summary>核对5项任务的负责人和截止时间</summary><div class="task-preview-list">${data.tasks.map(task => `<div><strong>${esc(task.title)}</strong><span>${esc(task.owner)} · ${esc(task.due)}</span></div>`).join("")}</div></details><button class="button primary full mt-12" data-action="create-tasks">确认预设分工并生成5项任务</button>`}`;
}

function renderKanban() {
  const columns = ["待处理", "进行中", "已完成", "有风险"];
  return `<article class="card"><div class="card-header"><div><h2>优化任务看板</h2><div class="card-title-sub">把诊断结果转换为项目交付动作</div></div><span class="tag green">已人工确认</span></div><div class="card-body"><div class="kanban">${columns.map(status => `<div class="kanban-column"><div class="kanban-head"><strong>${status}</strong><span>${data.tasks.filter(task => task.status === status).length}</span></div>${data.tasks.filter(task => task.status === status).map(task => `<div class="task-card"><div class="mode-row"><span class="tag ${task.priority === "高" ? "red" : "blue"}">${task.priority}优先级</span><span class="small muted">${esc(task.due)}</span></div><div class="task-title">${esc(task.title)}</div><div class="task-meta">负责人：${esc(task.owner)}</div><div class="task-reason">${esc(task.reason)}</div></div>`).join("")}</div>`).join("")}</div><div class="closure-summary"><div><strong>本轮闭环已建立</strong><p>5项优化任务已落到4类角色；下一次复盘建议在高优先级任务完成后进行。</p></div><span class="tag green">从诊断到行动</span></div></div></article>`;
}

function gatedEmpty(title, detail, nav, button) {
  return `<article class="card"><div class="empty-state"><div class="empty-icon">${icon("campaign")}</div><h2>${title}</h2><p>${detail}</p><button class="button primary mt-16" data-nav="${nav}">${button}</button></div></article>`;
}

function renderResetModal() {
  return `<div class="modal-backdrop" role="presentation"><div class="modal reset-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title"><div class="modal-header"><h2 id="reset-title">重置本次演示？</h2><button class="button ghost modal-close" data-action="cancel-reset" aria-label="关闭重置确认" data-reset-initial>${icon("close")}</button></div><div class="modal-body"><p>达人方案、脚本修改、投后诊断和任务状态将恢复到初始状态。所有变化都只保存在当前浏览器。</p></div><div class="modal-footer"><button class="button" data-action="cancel-reset">取消</button><button class="button danger" data-action="confirm-reset">确认重置</button></div></div></div>`;
}

function kpi(label, value, context, tone = "") {
  return `<div class="kpi ${tone}"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div><div class="kpi-context">${context}</div></div>`;
}

function check(title, detail) {
  return `<div class="check-item"><div class="check-head"><strong>${title}</strong><span class="tag green">已纳入</span></div><div class="check-note">${detail}</div></div>`;
}

function bindEvents() {
  document.querySelectorAll("[data-nav]").forEach(button => button.addEventListener("click", () => {
    setState({ view: button.dataset.nav });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }));
  document.querySelectorAll("[data-action]").forEach(button => button.addEventListener("click", () => handleAction(button.dataset.action, button.dataset)));
  document.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => submitChat(button.dataset.prompt)));
  document.querySelector("#chat-form")?.addEventListener("submit", event => {
    event.preventDefault();
    const input = document.querySelector("#chat-input");
    if (input.value.trim()) submitChat(input.value.trim());
  });
  document.querySelectorAll("[data-script-field]").forEach(field => field.addEventListener("change", () => {
    if (state.scriptApproved) return;
    const updated = structuredClone(state.script);
    updated.script[Number(field.dataset.index)][field.dataset.scriptField] = field.value;
    state.script = updated;
    saveState();
    showToast("修改已保存");
  }));
  requestAnimationFrame(() => {
    const feed = document.querySelector("#chat-feed");
    if (feed) feed.scrollTop = feed.scrollHeight;
    if (resetModalOpen) document.querySelector("[data-reset-initial]")?.focus();
  });
  document.onkeydown = event => {
    if (!resetModalOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      handleAction("cancel-reset", {});
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...document.querySelectorAll(".reset-modal button:not(:disabled)")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
}

async function submitChat(text) {
  addChat("user", esc(text));
  if (state.stage === "brief") {
    addChat("assistant", "收到。为了避免预算口径理解错误，我需要先确认一个关键信息：<strong>5万元预算是否包含付费投流，还是全部用于达人合作费？</strong>");
    state.stage = "clarify";
  } else if (state.stage === "clarify") {
    const includes = /包含|投流/.test(text) && !/不含|全部用于达人/.test(text);
    confirmBudget(!includes, false);
    return;
  } else {
    addChat("assistant", "当前方案已经形成。你可以查看达人明细、进入内容工作台，或在投后一周载入模拟数据进行复盘。");
  }
  saveState();
  render();
}

function confirmBudget(allForCreators, addUserMessage = true) {
  state.budgetIncludesTraffic = !allForCreators;
  if (addUserMessage) addChat("user", allForCreators ? "不包含投流，5万元全部用于达人合作。" : "包含投流，达人合作与投流合计5万元。");
  if (allForCreators) {
    state.stage = "plans";
    addChat("assistant", "口径已明确。我已检索达人样本库、品牌规则和历史案例，并完成预算与ROI约束校验。推荐采用<strong>均衡型方案</strong>：达人费47,500元，预留2,500元机动预算，预测520单，ROI中位约2.09。");
    addActivity("需求口径已补齐", "确认5万元全部用于达人合作，Agent开始生成3套策略。 ");
  } else {
    state.stage = "budget-scope";
    addChat("assistant", "已保留“包含投流”的预算口径。当前POC没有投流成本与增量转化样本，我不会用达人费数据冒充同口径结论。请补充预算拆分，或明确切换为全部达人合作费后继续。");
    addActivity("预算口径待补充", "已记录预算包含投流；因缺少投流样本，Agent暂停生成方案。 ");
  }
  saveState();
  render();
}

async function handleAction(action, dataset) {
  if (action === "reset") {
    resetModalOpen = true;
    render();
    return;
  }
  if (action === "cancel-reset") {
    resetModalOpen = false;
    render();
    [...document.querySelectorAll('[data-action="reset"]')].find(button => button.offsetParent !== null)?.focus();
    return;
  }
  if (action === "confirm-reset") {
    localStorage.removeItem(STORAGE_KEY);
    state = structuredClone(initialState);
    state.selectedCreatorIds = [...data.campaign.selectedCreatorIds];
    resetModalOpen = false;
    render();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    showToast("演示已重置");
    return;
  }
  if (action === "budget-creator") return confirmBudget(true);
  if (action === "budget-all") return confirmBudget(false);
  if (action === "switch-creator-budget") {
    addChat("user", "明确切换：本次POC按5万元全部达人合作费继续。");
    state.budgetIncludesTraffic = false;
    state.stage = "plans";
    addChat("assistant", "已按新的预算口径生成三套策略。均衡型达人费47,500元，预留2,500元机动预算，预测520单，ROI中位约2.09。");
    addActivity("预算口径已切换", "由业务方明确切换为全部达人合作费，Agent恢复方案生成。 ");
    saveState();
    render();
    return;
  }
  if (action === "back-budget") {
    state.budgetIncludesTraffic = null;
    state.stage = "clarify";
    saveState();
    render();
    return;
  }
  if (action === "confirm-replacement") {
    const ids = [...selectedCreators().map(item => item.id)];
    const index = ids.indexOf("minhang");
    if (index >= 0) ids[index] = "dealcheck";
    setState({ selectedCreatorIds: ids, replacementConfirmed: true });
    addActivity("达人替换已确认", "同预算将“闵行饭搭子”替换为“套餐侦探社”。");
    saveState();
    showToast("替换已写入候选方案");
    return;
  }
  if (action === "keep-creator") {
    showToast("已保留原达人，可继续确认方案");
    return;
  }
  if (action === "confirm-plan") {
    state.planConfirmed = true;
    state.stage = "plans";
    addActivity("均衡型方案已确认", `8位达人，合作费${yuan(47500)}，进入内容生产。`);
    addChat("assistant", "均衡型方案已由项目经理确认并写入 Campaign。下一步可生成45秒探店脚本，内容仍需人工审核后才能进入投放。");
    saveState();
    render();
    showToast("方案已确认");
    return;
  }
  if (action === "generate-script" || action === "regenerate-script") return generateScript();
  if (action === "use-hook") {
    if (state.scriptApproved) return;
    const updated = structuredClone(state.script);
    updated.script[0].voiceover = updated.hooks[Number(dataset.index)];
    setState({ script: updated });
    showToast("已替换首句口播");
    return;
  }
  if (action === "approve-script") {
    state.scriptApproved = true;
    addActivity("内容人工审核通过", `45秒探店脚本 v${state.scriptVersion} 已锁定，Campaign进入投放执行中。`);
    saveState();
    render();
    showToast("审核通过，状态已流转");
    return;
  }
  if (action === "revise-script") {
    state.scriptApproved = false;
    state.scriptVersion = Number(state.scriptVersion || 1) + 1;
    addActivity("已发起脚本修订", `创建 v${state.scriptVersion} 草稿；上一审核版本保留在活动记录中。`);
    saveState();
    render();
    showToast(`脚本 v${state.scriptVersion} 已解锁，修改后需重新审核`);
    return;
  }
  if (action === "load-data") {
    state.dataLoaded = true;
    addActivity("已载入投后一周模拟数据", "420笔订单、83,580元GMV、支付ROI 1.76。 ");
    saveState();
    render();
    showToast("POC模拟数据已载入");
    return;
  }
  if (action === "run-analysis") return runAnalysis();
  if (action === "create-tasks") {
    state.tasksCreated = true;
    addActivity("优化任务已创建", "5项任务已分配给项目经理、达人运营、内容审核和数据运营。 ");
    saveState();
    render();
    document.querySelector(".kanban")?.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("任务已进入协同看板");
  }
}

async function generateScript() {
  const isRegeneration = Boolean(state.script);
  setState({ busy: true });
  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: "content-script",
        context: {
          campaign: data.campaign,
          brandKnowledge: data.knowledge,
          selectedCreators: selectedCreators().map(({ name, position, style }) => ({ name, position, style }))
        }
      })
    });
    if (!response.ok) throw new Error("脚本生成失败");
    const payload = await response.json();
    state.script = payload.data;
    state.scriptMode = payload.mode;
    state.scriptVersion = isRegeneration ? Number(state.scriptVersion || 1) + 1 : 1;
    state.scriptApproved = false;
    addActivity(isRegeneration ? "脚本新版本已生成" : "首版内容已生成", `使用${payload.mode === "qwen" ? "千问" : "演示兜底"}生成45秒脚本 v${state.scriptVersion}，等待人工审核。`);
    showToast(payload.mode === "qwen" ? "千问已生成脚本" : "已使用演示兜底脚本");
  } catch {
    showToast("服务暂不可用，请确认本地服务已启动");
  } finally {
    state.busy = false;
    saveState();
    render();
  }
}

async function runAnalysis() {
  setState({ busy: true });
  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "performance-analysis", context: { campaign: data.campaign, performance: data.performance, stores: data.stores } })
    });
    if (!response.ok) throw new Error("分析失败");
    const payload = await response.json();
    state.analysis = payload.data;
    state.analysisMode = payload.mode;
    addActivity("Agent完成投后诊断", "已识别高曝光低转化、垂类达人高ROI和门店承接问题。 ");
    showToast(payload.mode === "qwen" ? "千问已完成诊断" : "已使用演示兜底诊断");
  } catch {
    showToast("服务暂不可用，请确认本地服务已启动");
  } finally {
    state.busy = false;
    saveState();
    render();
  }
}

async function boot() {
  try {
    const [bootstrapResponse, statusResponse] = await Promise.all([fetch("/api/bootstrap"), fetch("/api/status")]);
    if (!bootstrapResponse.ok) throw new Error("业务数据加载失败");
    data = await bootstrapResponse.json();
    if (statusResponse.ok) modelStatus = await statusResponse.json();
    if (!state.selectedCreatorIds.length) state.selectedCreatorIds = [...data.campaign.selectedCreatorIds];
    saveState();
    render();
  } catch (error) {
    app.innerHTML = `<div class="boot-screen"><div class="boot-mark">!</div><h2>Demo未能启动</h2><p>${esc(error.message)}</p><p class="muted">请在项目目录运行 npm start 后重新打开页面。</p></div>`;
  }
}

boot();
