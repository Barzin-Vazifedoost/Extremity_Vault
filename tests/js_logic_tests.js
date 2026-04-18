/**
 * Extremity Vault — JavaScript Logic Test Suite
 * Tests: applyFilter logic, autosave (localStorage), debounce behaviour
 * Run: node tests/js_logic_tests.js
 */

'use strict';

let PASS = 0;
let FAIL = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`\x1b[32m✔ ${label}\x1b[0m`);
    PASS++;
  } else {
    console.error(`\x1b[31m✘ ${label}\x1b[0m`);
    FAIL++;
  }
}

// ── Mock localStorage ────────────────────────────────────────────────────────
const localStorage = (() => {
  let store = {};
  return {
    getItem:    (k)    => (k in store ? store[k] : null),
    setItem:    (k, v) => { store[k] = String(v); },
    removeItem: (k)    => { delete store[k]; },
    clear:      ()     => { store = {}; },
    _dump:      ()     => store,
  };
})();

// ── applyFilter logic (extracted from index.js) ──────────────────────────────
// Mirrors the exact filter in index.js
function applyFilter(allArticles, q, category_id) {
  q = (q || '').trim().toLowerCase();
  return allArticles.filter(function (article) {
    const matchQ = !q ||
      article.title.toLowerCase().includes(q) ||
      article.content.toLowerCase().includes(q);
    const matchCat = !category_id || String(article.category_id) === String(category_id);
    return matchQ && matchCat;
  });
}

const SAMPLE_ARTICLES = [
  { id: 1, title: 'The Dragon',      content: 'A story about dragons.',  category_id: 1 },
  { id: 2, title: 'Enchanted Forest', content: 'Deep in the woods.',      category_id: 2 },
  { id: 3, title: 'Magic Sword',     content: 'A weapon of legend.',     category_id: 3 },
  { id: 4, title: "O'Brien's Quest", content: "It's a journey: café.",   category_id: 1 },
  { id: 5, title: "'; DROP TABLE",   content: "injection attempt",       category_id: 2 },
];

// ── 1. Live Search — applyFilter ────────────────────────────────────────────
console.log('\n=== 1. Live Search — applyFilter logic ===');

let result = applyFilter(SAMPLE_ARTICLES, '', '');
assert('1a. Empty query returns all articles', result.length === SAMPLE_ARTICLES.length);

result = applyFilter(SAMPLE_ARTICLES, 'dragon', '');
assert('1b. Query "dragon" matches title', result.length === 1 && result[0].id === 1);

result = applyFilter(SAMPLE_ARTICLES, 'DRAGON', '');
assert('1c. Query is case-insensitive', result.length === 1);

result = applyFilter(SAMPLE_ARTICLES, 'woods', '');
assert('1d. Query matches content field', result.length === 1 && result[0].id === 2);

result = applyFilter(SAMPLE_ARTICLES, '', '1');
assert('1e. Category filter alone works', result.length === 2);

result = applyFilter(SAMPLE_ARTICLES, 'dragon', '1');
assert('1f. Combined query + category', result.length === 1 && result[0].id === 1);

result = applyFilter(SAMPLE_ARTICLES, 'dragon', '2');
assert('1g. Query matches category mismatch → 0 results', result.length === 0);

result = applyFilter(SAMPLE_ARTICLES, 'xyzzy_no_match', '');
assert('1h. No-match query returns empty array', result.length === 0);

result = applyFilter(SAMPLE_ARTICLES, "'; DROP TABLE articles;--", '');
assert('1i. SQL injection string — no crash, treated as literal', Array.isArray(result));

result = applyFilter(SAMPLE_ARTICLES, '🌿café', '');
assert('1j. Unicode/emoji query — no crash', Array.isArray(result));

result = applyFilter(SAMPLE_ARTICLES, 'a'.repeat(1000), '');
assert('1k. 1000-char query — no crash', Array.isArray(result));

result = applyFilter([], 'dragon', '');
assert('1l. Empty article list — returns empty array', result.length === 0);

result = applyFilter(SAMPLE_ARTICLES, "o'brien", '');
assert("1m. Apostrophe in query — matches article with apostrophe in title", result.length === 1);

result = applyFilter(SAMPLE_ARTICLES, 'café', '');
assert("1n. Accented char query — matches article content", result.length === 1);

// ── 2. Debounce behaviour ────────────────────────────────────────────────────
console.log('\n=== 2. Debounce ===');

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

(function () {
  let callCount = 0;
  const debounced = debounce(() => callCount++, 300);

  // Fire 5 times rapidly (synchronously with fake timers via overriding setTimeout)
  const timers = [];
  const origSetTimeout = global.setTimeout;
  const origClearTimeout = global.clearTimeout;
  let lastId = 0;
  const pending = {};

  global.setTimeout = (fn, delay) => {
    const id = ++lastId;
    pending[id] = fn;
    return id;
  };
  global.clearTimeout = (id) => { delete pending[id]; };

  debounced(); debounced(); debounced(); debounced(); debounced();

  // Only the last pending timer should exist
  const pendingCount = Object.keys(pending).length;
  assert('2a. 5 rapid calls — only 1 pending timer (debounce works)', pendingCount === 1);

  // Fire that timer
  Object.values(pending).forEach(fn => fn());
  assert('2b. After timer fires — callback called exactly once', callCount === 1);

  global.setTimeout   = origSetTimeout;
  global.clearTimeout = origClearTimeout;
})();

// ── 3. Autosave — localStorage ───────────────────────────────────────────────
console.log('\n=== 3. Autosave — localStorage ===');

const AUTOSAVE_KEY = 'ev_editor_draft';

function saveDraft(title, category_id, content) {
  const draft = { title, category_id, content };
  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
}

function restoreDraft() {
  const saved = localStorage.getItem(AUTOSAVE_KEY);
  if (!saved) return null;
  try { return JSON.parse(saved); } catch (e) { return null; }
}

function clearDraft() {
  localStorage.removeItem(AUTOSAVE_KEY);
}

// 3a. Save and restore
localStorage.clear();
saveDraft('My Title', '2', 'My content here.');
const draft = restoreDraft();
assert('3a. Draft saves and restores correctly', draft && draft.title === 'My Title' && draft.category_id === '2' && draft.content === 'My content here.');

// 3b. Category switch — last write wins
saveDraft('My Title', '1', 'My content here.');
saveDraft('My Title', '3', 'My content here.');
const draft2 = restoreDraft();
assert('3b. Multiple category switches — last value persists', draft2.category_id === '3');

// 3c. Clear after submit
clearDraft();
assert('3c. Draft cleared after submit', localStorage.getItem(AUTOSAVE_KEY) === null);

// 3d. Restore when nothing saved → null
const draft3 = restoreDraft();
assert('3d. No saved draft → restore returns null', draft3 === null);

// 3e. Corrupted localStorage — no crash
localStorage.setItem(AUTOSAVE_KEY, '{ this is not: valid JSON !!!');
let draftCorrupt;
let crashed = false;
try { draftCorrupt = restoreDraft(); } catch (e) { crashed = true; }
assert('3e. Corrupted localStorage — no crash', !crashed);
assert('3f. Corrupted localStorage — returns null gracefully', draftCorrupt === null);

// 3g. Draft with special characters survives round-trip
localStorage.clear();
saveDraft("Title with 'quotes' & <tags>", '1', 'Content: "hello" \n newline \t tab');
const draftSpecial = restoreDraft();
assert('3g. Special chars survive JSON round-trip', draftSpecial && draftSpecial.title === "Title with 'quotes' & <tags>");

// 3h. Draft with very long content
localStorage.clear();
const longContent = 'x'.repeat(50000);
saveDraft('Long', '1', longContent);
const draftLong = restoreDraft();
assert('3h. Very long content (50k chars) — saves and restores', draftLong && draftLong.content.length === 50000);

// ── 4. Input validation helpers ──────────────────────────────────────────────
console.log('\n=== 4. Input validation (client-side guards) ===');

function validateArticleForm(title, category_id, content) {
  if (!title || !title.trim())     return 'Title is required.';
  if (!category_id)                return 'Category is required.';
  if (!content || !content.trim()) return 'Content is required.';
  return null; // valid
}

assert('4a. All fields present — valid',        validateArticleForm('T', '1', 'C') === null);
assert('4b. Missing title — error returned',    validateArticleForm('',  '1', 'C') !== null);
assert('4c. Whitespace-only title — error',     validateArticleForm('   ', '1', 'C') !== null);
assert('4d. Missing category — error',          validateArticleForm('T',  '',  'C') !== null);
assert('4e. Missing content — error',           validateArticleForm('T', '1', '')  !== null);
assert('4f. Whitespace-only content — error',   validateArticleForm('T', '1', '  ') !== null);

// ── Results ──────────────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════════════════');
console.log(`  Results:  ${PASS} passed,  ${FAIL} failed  (total ${PASS + FAIL})`);
console.log('════════════════════════════════════════════════════════');
process.exit(FAIL > 0 ? 1 : 0);
