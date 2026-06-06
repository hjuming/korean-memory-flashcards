const assert = require("node:assert/strict");

const {
  buildMemoryDraft,
  buildImagePrompt,
  normalizeProgress
} = require("../assets/card-utils.js");

{
  const draft = buildMemoryDraft({ korean: "자리", meaning: "座位" });
  assert.equal(draft.korean, "자리");
  assert.equal(draft.meaning, "座位");
  assert.ok(draft.cue.includes("자리"));
  assert.ok(draft.scene.includes("자리"));
  assert.ok(draft.imagePrompt.includes("韓文單字：자리"));
  assert.ok(draft.imagePrompt.includes("中文意思：座位"));
}

{
  const prompt = buildImagePrompt({
    korean: "엽서",
    meaning: "明信片",
    pronunciation: "yeop-seo",
    cue: "漢字是葉書。",
    scene: "一片大葉子被當成明信片。",
    tag: "漢字音"
  });
  assert.ok(prompt.includes("韓文單字：엽서"));
  assert.ok(prompt.includes("聯想密碼：漢字是葉書。"));
  assert.ok(prompt.includes("溫暖極簡"));
}

{
  const progress = normalizeProgress({
    status: "mastered",
    reviewCount: "3",
    correctStreak: "2",
    dueAt: "2026-06-09T00:00:00.000Z"
  });
  assert.deepEqual(progress, {
    status: "mastered",
    reviewCount: 3,
    correctStreak: 2,
    lastReviewedAt: "",
    dueAt: "2026-06-09T00:00:00.000Z"
  });
}

console.log("card-utils tests passed");
