import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.dirname(currentFile);
const publicDir = path.join(rootDir, "public");
const dataDir = path.join(rootDir, "data");
const port = Number(process.env.LOCALOPS_PORT || 4173);
const qwenApiKey = process.env.DASHSCOPE_API_KEY || "";
const qwenBaseUrl = (process.env.QWEN_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1").replace(/\/$/, "");
const qwenModel = process.env.QWEN_MODEL || "qwen-plus";
const forceDemo = process.env.LOCALOPS_DEMO_MODE === "1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png"
};

const json = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
};

const readJson = async (name) => JSON.parse(await readFile(path.join(dataDir, name), "utf8"));

const getBootstrap = async () => {
  const [campaign, creators, stores, knowledge, performance, tasks] = await Promise.all([
    readJson("campaign.json"),
    readJson("creators.json"),
    readJson("stores.json"),
    readJson("knowledge.json"),
    readJson("performance.json"),
    readJson("tasks.json")
  ]);
  return { campaign, creators, stores, knowledge, performance, tasks };
};

const parseJsonContent = (content) => {
  const cleaned = String(content || "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("模型未返回可解析的JSON");
  }
};

const callQwen = async ({ system, user }) => {
  if (!qwenApiKey || forceDemo) throw new Error("DEMO_MODE");
  const response = await fetch(`${qwenBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${qwenApiKey}`
    },
    body: JSON.stringify({
      model: qwenModel,
      temperature: 0.25,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    }),
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`QWEN_${response.status}:${detail.slice(0, 180)}`);
  }
  const payload = await response.json();
  return parseJsonContent(payload?.choices?.[0]?.message?.content);
};

const isValidAgentResult = (task, value) => {
  if (!value || typeof value !== "object") return false;
  if (task === "content-script") {
    return typeof value.summary === "string"
      && Array.isArray(value.hooks)
      && Array.isArray(value.script)
      && value.script.length > 0
      && Array.isArray(value.checks);
  }
  if (task === "performance-analysis") {
    return typeof value.summary === "string"
      && Array.isArray(value.findings)
      && value.findings.length > 0
      && Array.isArray(value.recommendations);
  }
  return false;
};

const fallbackScript = {
  summary: "围绕199元双人套餐，以周末聚餐场景切入，先展示利益点，再呈现真实用餐体验。",
  hooks: [
    "上海两个人吃火锅，人均不到100能吃到什么？",
    "下班后想吃顿热乎的，这份双人套餐值不值？"
  ],
  script: [
    { time: "0～3秒", goal: "利益点钩子", visual: "热气锅底与套餐全景快速切换", voiceover: "上海两个人吃火锅，人均不到100能吃到什么？", overlay: "199元双人套餐" },
    { time: "3～10秒", goal: "建立场景", visual: "门头、环境、两人落座", voiceover: "今天来试试沸点火锅新出的双人套餐，上海8家门店都能用。", overlay: "周末聚餐｜上海8店可用" },
    { time: "10～25秒", goal: "真实种草", visual: "牛肉、毛肚、虾滑依次下锅并试吃", voiceover: "套餐里有鲜切牛肉、脆毛肚和虾滑，菜量按双人真实用餐展示。", overlay: "菜品以门店实际提供为准" },
    { time: "25～38秒", goal: "强化价值", visual: "套餐菜品平铺与价格对比", voiceover: "门市价298元，团购价199元，适合两个人下班或周末聚餐。", overlay: "门市价298元｜团购价199元" },
    { time: "38～45秒", goal: "合规转化", visual: "团购组件、门店定位与使用规则", voiceover: "下单前记得查看适用门店和预约规则，再决定是否购买。", overlay: "点击查看适用门店与使用规则" }
  ],
  checks: [
    { rule: "品牌卖点", status: "通过", note: "已准确展示价格、适用门店和双人聚餐场景" },
    { rule: "真实性", status: "通过", note: "保留‘以门店实际提供为准’，未使用绝对化表述" },
    { rule: "交易提示", status: "通过", note: "明确提示查看适用门店与预约规则" }
  ]
};

const fallbackAnalysis = {
  summary: "项目获得420笔支付订单，完成率84%；曝光达到预期，但高曝光达人向门店访问和支付的转化不足。",
  findings: [
    { title: "高曝光未形成有效转化", evidence: "阿沫吃上海播放42万，但仅带来40笔订单，支付ROI为0.80。", type: "事实" },
    { title: "垂类与地域匹配更有效", evidence: "小鹿周末探店和老饕阿杰播放量较低，但支付ROI分别为2.65和2.59。", type: "事实" },
    { title: "陆家嘴店应优先排查", evidence: "陆家嘴店访问3,600次，但支付转化率仅1.33%，为8家门店最低。", type: "事实" },
    { title: "内容利益点可能出现过晚", evidence: "结合低访问率与内容审核Badcase推断，需通过视频样本复核。", type: "待验证推断" }
  ],
  recommendations: [
    "减少低转化流量型达人的追加预算，保留项目经理审批。",
    "复用小鹿周末探店和老饕阿杰的内容结构，强化垂类与场景匹配。",
    "针对陆家嘴店核查套餐、人群、门店承接和达人地域匹配。",
    "把199元套餐利益点前置到视频前10秒并开展下一轮A/B测试。"
  ]
};

const handleAgent = async (request, response) => {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 1_000_000) return json(response, 413, { error: "请求过大" });
  }
  let body;
  try {
    body = JSON.parse(raw || "{}");
  } catch {
    return json(response, 400, { error: "请求格式无效" });
  }

  const task = body.task;
  const demoPayload = task === "content-script" ? fallbackScript : fallbackAnalysis;
  const prompts = {
    "content-script": {
      system: "你是本地生活内容运营助手。只返回合法JSON，不要Markdown。JSON字段必须为summary、hooks、script、checks。script每项包含time、goal、visual、voiceover、overlay；checks每项包含rule、status、note。内容必须真实克制，并保留人工审核。",
      user: `为以下虚构POC项目生成45秒抖音探店脚本：${JSON.stringify(body.context || {})}`
    },
    "performance-analysis": {
      system: "你是本地生活数据运营助手。只返回合法JSON，不要Markdown。JSON字段必须为summary、findings、recommendations。findings每项包含title、evidence、type，type只能是事实或待验证推断。不得修改输入中的任何数值。",
      user: `分析以下虚构POC投后数据并给出行动建议：${JSON.stringify(body.context || {})}`
    }
  };

  if (!prompts[task]) return json(response, 400, { error: "不支持的Agent任务" });

  try {
    const data = await callQwen(prompts[task]);
    if (!isValidAgentResult(task, data)) throw new Error("QWEN_INVALID_STRUCTURE");
    return json(response, 200, { mode: "qwen", model: qwenModel, data });
  } catch (error) {
    const reason = error?.message === "DEMO_MODE" ? "未配置千问或已强制演示模式" : "千问调用异常，已自动兜底";
    return json(response, 200, { mode: "demo", model: qwenModel, reason, data: demoPayload });
  }
};

const safeStaticPath = (baseDir, requestPath) => {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const root = path.resolve(baseDir);
  const resolved = path.resolve(root, relative);
  return resolved === root || resolved.startsWith(`${root}${path.sep}`) ? resolved : null;
};

const serveFile = async (response, filePath) => {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("NOT_FILE");
    const content = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(content);
  } catch {
    json(response, 404, { error: "未找到资源" });
  }
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (request.method === "GET" && url.pathname === "/api/status") {
    return json(response, 200, {
      qwenConfigured: Boolean(qwenApiKey) && !forceDemo,
      mode: Boolean(qwenApiKey) && !forceDemo ? "qwen" : "demo",
      model: qwenModel
    });
  }
  if (request.method === "GET" && url.pathname === "/api/bootstrap") {
    try {
      return json(response, 200, await getBootstrap());
    } catch (error) {
      return json(response, 500, { error: "业务数据加载失败", detail: error.message });
    }
  }
  if (request.method === "POST" && url.pathname === "/api/agent") return handleAgent(request, response);

  const filePath = safeStaticPath(publicDir, url.pathname);
  if (!filePath) return json(response, 403, { error: "禁止访问" });
  return serveFile(response, filePath);
});

server.listen(port, "127.0.0.1", () => {
  const mode = qwenApiKey && !forceDemo ? `千问 ${qwenModel}` : "演示兜底";
  process.stdout.write(`LocalOps AI 已启动：http://127.0.0.1:${port}（${mode}）\n`);
});
