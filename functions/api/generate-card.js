const DEFAULT_MODEL = "gpt-5";

export async function onRequestPost({ request, env }) {
  let input;
  try {
    input = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const korean = cleanText(input.korean).slice(0, 80);
  const meaning = cleanText(input.meaning).slice(0, 120);
  if (!korean) {
    return jsonResponse({ error: "Missing korean" }, 400);
  }

  if (!env.OPENAI_API_KEY) {
    return jsonResponse({ source: "fallback", draft: buildFallbackDraft(korean, meaning) });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || DEFAULT_MODEL,
        instructions: [
          "你是韓文單字圖像聯想記憶卡助手。",
          "請只回傳 JSON，不要 markdown。",
          "JSON 欄位必須是 korean, meaning, pronunciation, tag, cue, scene, imagePrompt。",
          "tag 只能是：漢字音、諧音、情境畫面、外來語、文法片語。",
          "圖像 Prompt 要避免要求模型產生錯誤韓文字；只允許必要韓文字。"
        ].join("\n"),
        input: [
          `韓文：${korean}`,
          `中文意思：${meaning || "如果無法確定，請填待補中文意思，不要猜得太武斷。"}`,
          "請產生適合繁體中文學習者的聯想密碼與圖像提示詞。"
        ].join("\n")
      })
    });

    if (!response.ok) {
      return jsonResponse({ source: "fallback", draft: buildFallbackDraft(korean, meaning) });
    }

    const data = await response.json();
    const parsed = parseModelJson(data.output_text);
    return jsonResponse({ source: "openai", draft: normalizeDraft(parsed, korean, meaning) });
  } catch {
    return jsonResponse({ source: "fallback", draft: buildFallbackDraft(korean, meaning) });
  }
}

function normalizeDraft(draft, korean, meaning) {
  const fallback = buildFallbackDraft(korean, meaning);
  return {
    korean,
    meaning: cleanText(draft.meaning) || fallback.meaning,
    pronunciation: cleanText(draft.pronunciation),
    tag: ["漢字音", "諧音", "情境畫面", "外來語", "文法片語"].includes(draft.tag) ? draft.tag : fallback.tag,
    cue: cleanText(draft.cue) || fallback.cue,
    scene: cleanText(draft.scene) || fallback.scene,
    imagePrompt: cleanText(draft.imagePrompt) || fallback.imagePrompt
  };
}

function parseModelJson(text) {
  const raw = cleanText(text);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  }
}

function buildFallbackDraft(korean, meaning) {
  const safeMeaning = meaning || "待補中文意思";
  const cue = `把「${korean}」的聲音和「${safeMeaning}」綁在一起：想像一個一眼就能看懂的畫面，畫面中心只出現 ${korean}。`;
  const scene = `一張溫暖的韓文記憶卡，中央是「${korean}」，旁邊用具體物件表現「${safeMeaning}」。`;
  return {
    korean,
    meaning: safeMeaning,
    pronunciation: "",
    tag: "情境畫面",
    cue,
    scene,
    imagePrompt: [
      "請生成一張韓文圖像聯想記憶卡插圖。",
      `韓文單字：${korean}`,
      `中文意思：${safeMeaning}`,
      "發音拆解：無",
      "記憶類型：情境畫面",
      `聯想密碼：${cue}`,
      `主要畫面：${scene}`,
      "風格：溫暖極簡、紙張質感、柔和自然光、清楚可記、像高品質學習卡。",
      "文字規則：只保留必要韓文字，不要加入錯誤韓文、假字、英文或多餘中文。"
    ].join("\n")
  };
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
