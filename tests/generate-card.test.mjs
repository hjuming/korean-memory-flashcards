import assert from "node:assert/strict";
import { onRequest } from "../functions/api/generate-card.js";

// 案例展示模式：任何請求都回 403，而且不得發出任何對外連線。
let fetchCalls = 0;
globalThis.fetch = async () => { fetchCalls += 1; throw new Error("fetch must not be called"); };

for (const method of ["POST", "GET"]) {
  const request = new Request("https://korean.wedopr.com/api/generate-card", {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "POST" ? JSON.stringify({ korean: "사촌", meaning: "堂表兄弟姊妹" }) : undefined
  });
  const response = await onRequest({ request, env: { OPENAI_API_KEY: "sk-test-should-not-be-used" } });
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.equal(body.demo, true);
  assert.ok(body.message.includes("案例展示"));
}
assert.equal(fetchCalls, 0);

const source = await import("node:fs").then((fs) => fs.readFileSync(new URL("../functions/api/generate-card.js", import.meta.url), "utf8"));
assert.ok(!/OPENAI_API_KEY|api\.openai\.com/.test(source), "端點不得再引用 OpenAI 金鑰或網址");
const app = await import("node:fs").then((fs) => fs.readFileSync(new URL("../assets/app.js", import.meta.url), "utf8"));
assert.ok(!app.includes('fetch("/api/generate-card"'), "前端不得再呼叫產生端點");

console.log("generate-card demo mode tests passed");
