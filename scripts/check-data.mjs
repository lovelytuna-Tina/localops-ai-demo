import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const load = async (name) => JSON.parse(await readFile(path.join(root, "data", name), "utf8"));
const [campaign, creators, stores, performance] = await Promise.all([
  load("campaign.json"), load("creators.json"), load("stores.json"), load("performance.json")
]);

const sum = (items, selector) => items.reduce((total, item) => total + selector(item), 0);
const selected = creators.filter((creator) => campaign.selectedCreatorIds.includes(creator.id));
const creatorCost = sum(selected, (creator) => creator.quote);
const predictedOrders = sum(selected, (creator) => creator.expectedOrders);
const actualCreatorOrders = sum(performance.creators, (item) => item.orders);
const actualCreatorViews = sum(performance.creators, (item) => item.views);
const actualCreatorGmv = sum(performance.creators, (item) => item.gmv);
const storeTargets = sum(stores, (store) => store.targetOrders);
const storeActuals = sum(stores, (store) => store.actualOrders);
const actualRoi = actualCreatorGmv / creatorCost;
const plannedTargetRoi = campaign.targetGmv / campaign.plannedCreatorCost;

const checks = [
  ["入选达人数量", selected.length === 8, selected.length],
  ["计划达人费用", creatorCost === 47500, creatorCost],
  ["机动预算", campaign.creatorBudgetCap - creatorCost === 2500, campaign.creatorBudgetCap - creatorCost],
  ["基础预测订单", predictedOrders === 520, predictedOrders],
  ["达人实际订单", actualCreatorOrders === 420, actualCreatorOrders],
  ["门店目标订单", storeTargets === 500, storeTargets],
  ["门店实际订单", storeActuals === 420, storeActuals],
  ["实际播放量", actualCreatorViews === 1250000, actualCreatorViews],
  ["实际GMV", actualCreatorGmv === 83580, actualCreatorGmv],
  ["实际ROI", Math.abs(actualRoi - 1.7595789474) < 0.0001, actualRoi.toFixed(4)],
  ["目标ROI", Math.abs(plannedTargetRoi - 2.0947368421) < 0.0001, plannedTargetRoi.toFixed(4)]
];

let failed = false;
for (const [name, ok, value] of checks) {
  process.stdout.write(`${ok ? "PASS" : "FAIL"}  ${name}: ${value}\n`);
  if (!ok) failed = true;
}
if (failed) process.exitCode = 1;
