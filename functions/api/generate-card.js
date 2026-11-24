// 案例展示模式（2026-11-24，MING 裁定）：本端點不呼叫任何 AI 服務，也不讀任何金鑰。
// 原本會呼叫 OpenAI Responses API，但沒有登入與流量限制，任何人都能反覆呼叫產生費用；
// 改為一律回 403，前端改用瀏覽器內建範本（assets/card-utils.js 的 buildMemoryDraft）產生草稿。
const DEMO_MESSAGE = "案例展示，不提供 AI 產生。草稿由網頁內建範本產生。";

export async function onRequest() {
  return new Response(JSON.stringify({ error: "demo_mode", demo: true, message: DEMO_MESSAGE }), {
    status: 403,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
