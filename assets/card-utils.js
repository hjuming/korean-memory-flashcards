(function initCardUtils(root, factory) {
  const utils = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = utils;
  }
  root.KoreanMemoryUtils = utils;
})(typeof globalThis !== "undefined" ? globalThis : window, function createCardUtils() {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const VALID_STATUS = new Set(["new", "stuck", "mastered"]);

  function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : 0;
  }

  function normalizeProgress(card) {
    const status = VALID_STATUS.has(card?.status) ? card.status : "new";
    return {
      status,
      reviewCount: toNumber(card?.reviewCount),
      correctStreak: toNumber(card?.correctStreak),
      lastReviewedAt: cleanText(card?.lastReviewedAt),
      dueAt: cleanText(card?.dueAt)
    };
  }

  function nextDueDate(status, correctStreak, now = new Date()) {
    const base = now instanceof Date ? now : new Date(now);
    const days = status === "mastered" ? Math.min(14, Math.max(1, correctStreak) * 2) : 1;
    return new Date(base.getTime() + days * ONE_DAY).toISOString();
  }

  function detectTag(korean, meaning) {
    const source = `${korean} ${meaning}`;
    if (/[A-Za-z]/.test(source)) {
      return "外來語";
    }
    if (source.length <= 4) {
      return "諧音";
    }
    return "情境畫面";
  }

  function buildMemoryDraft(input) {
    const korean = cleanText(input?.korean);
    const meaning = cleanText(input?.meaning) || "待補中文意思";
    const pronunciation = cleanText(input?.pronunciation);
    const tag = cleanText(input?.tag) || detectTag(korean, meaning);
    const cue = cleanText(input?.cue) || `把「${korean}」的聲音和「${meaning}」綁在一起：想像一個一眼就能看懂的畫面，畫面中心只出現 ${korean}。`;
    const scene = cleanText(input?.scene) || `一張溫暖的韓文記憶卡，中央是「${korean}」，旁邊用具體物件表現「${meaning}」，讓聲音、意思和畫面同時被記住。`;
    const imagePrompt = buildImagePrompt({ korean, meaning, pronunciation, tag, cue, scene });

    return {
      korean,
      meaning,
      pronunciation,
      tag,
      cue,
      scene,
      imagePrompt
    };
  }

  function buildImagePrompt(card) {
    const korean = cleanText(card?.korean);
    const meaning = cleanText(card?.meaning) || "待補中文意思";
    const pronunciation = cleanText(card?.pronunciation) || "無";
    const tag = cleanText(card?.tag) || "情境畫面";
    const cue = cleanText(card?.cue) || `用畫面記住 ${korean}`;
    const scene = cleanText(card?.scene) || cue;

    return [
      "請生成一張韓文圖像聯想記憶卡插圖。",
      `韓文單字：${korean}`,
      `中文意思：${meaning}`,
      `發音拆解：${pronunciation}`,
      `記憶類型：${tag}`,
      `聯想密碼：${cue}`,
      `主要畫面：${scene}`,
      "風格：溫暖極簡、紙張質感、柔和自然光、清楚可記、像高品質學習卡，不要雜亂背景。",
      "文字規則：只保留必要韓文字，不要加入錯誤韓文、假字、英文或多餘中文。",
      "構圖：主物件明確，留白乾淨，適合 4:3 或 1:1 記憶卡裁切。"
    ].join("\n");
  }

  function buildSpeechConfig(korean) {
    const text = cleanText(korean);
    if (!text) {
      return null;
    }
    return {
      text,
      lang: "ko-KR",
      rate: 0.82,
      pitch: 1
    };
  }

  return {
    buildMemoryDraft,
    buildImagePrompt,
    buildSpeechConfig,
    cleanText,
    nextDueDate,
    normalizeProgress
  };
});
