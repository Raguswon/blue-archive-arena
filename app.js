// Loads the last full application source and applies the lineup-match hotfix before execution.
// This also restores app.js after it was accidentally replaced with PLACEHOLDER.
(async () => {
  const sourceUrl = "https://raw.githubusercontent.com/e34106052/blue-archive-arena/470b3cb6da134765b9c791037c320df8d4147977/app.js";
  const response = await fetch(sourceUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load application source: ${response.status}`);
  let source = await response.text();
  const oldCode = `    const similarity=exact/known.length;\n    if(els.exactOnly.checked && exact<known.length)return null;\n    return {exact,known:known.length,sameChars,similarity};`;
  const newCode = `    // All selected characters must be present on the matched side.\n    if(sameChars < known.length)return null;\n    const similarity=exact/known.length;\n    if(els.exactOnly.checked && exact<known.length)return null;\n    return {exact,known:known.length,sameChars,similarity};`;
  if (!source.includes(oldCode)) throw new Error("Expected compareLineup block was not found");
  source = source.replace(oldCode, newCode);
  (0, eval)(source);
})().catch(err => {
  console.error(err);
  const message = document.querySelector("#form-message");
  if (message) message.textContent = "網站程式載入失敗，請重新整理頁面。";
});
