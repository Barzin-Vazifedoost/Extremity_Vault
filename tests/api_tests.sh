#!/usr/bin/env bash
# ============================================================
# Extremity Vault — API / Backend Test Suite
# Run from repo root:  bash tests/api_tests.sh
# Requires: curl, jq, mysql (XAMPP), running XAMPP server
# ============================================================

BASE="http://localhost/Extremity_Vault/src/php"
COOKIE_USER=$(mktemp)
COOKIE_ADMIN=$(mktemp)

PASS=0
FAIL=0

# ── helpers ─────────────────────────────────────────────────
green() { printf "\033[32m✔ %s\033[0m\n" "$*"; }
red()   { printf "\033[31m✘ %s\033[0m\n" "$*"; }

assert_json_field() {
  local label="$1" field="$2" expected="$3" json="$4"
  local actual
  actual=$(echo "$json" | jq -r "$field" 2>/dev/null || echo "__parse_error__")
  if [ "$actual" = "$expected" ]; then
    green "$label"
    PASS=$((PASS+1))
  else
    red "$label  (expected: $expected  got: $actual)"
    FAIL=$((FAIL+1))
  fi
}

assert_http() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    green "$label"
    PASS=$((PASS+1))
  else
    red "$label  (expected HTTP $expected  got HTTP $actual)"
    FAIL=$((FAIL+1))
  fi
}

# ── seed: ensure a test admin user exists ───────────────────
ADMIN_EMAIL="test_admin_ev@example.com"
ADMIN_PASS="AdminPass123!"
USER_EMAIL="test_user_ev@example.com"
USER_PASS="UserPass123!"

# Hash for AdminPass123! — generated once, stored directly
ADMIN_HASH=$(php -r "echo password_hash('$ADMIN_PASS', PASSWORD_BCRYPT);")
USER_HASH=$(php -r "echo password_hash('$USER_PASS', PASSWORD_BCRYPT);")

MYSQL_CMD="/Applications/XAMPP/xamppfiles/bin/mysql -u root --socket=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock vazifedb_local"

$MYSQL_CMD -e "
  DELETE FROM users WHERE email IN ('$ADMIN_EMAIL','$USER_EMAIL');
  INSERT INTO users (name, email, password, role) VALUES
    ('Test Admin', '$ADMIN_EMAIL', '$ADMIN_HASH', 'admin'),
    ('Test User',  '$USER_EMAIL',  '$USER_HASH',  'user');
" 2>/dev/null
echo "── Seed data ready ──────────────────────────────────────"

# ── 1. AUTHENTICATION ────────────────────────────────────────
echo ""
echo "=== 1. Authentication ==="

# 1a. Valid login (admin)
body=$(curl -s -c "$COOKIE_ADMIN" -X POST "$BASE/login.php" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")
assert_json_field "1a. Admin login — success:true"     ".success" "true"  "$body"

# 1b. Valid login (regular user)
body=$(curl -s -c "$COOKIE_USER" -X POST "$BASE/login.php" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASS\"}")
assert_json_field "1b. User login — success:true"      ".success" "true"  "$body"

# 1c. Wrong password
body=$(curl -s -X POST "$BASE/login.php" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"wrong\"}")
assert_json_field "1c. Wrong password — success:false" ".success" "false" "$body"

# 1d. Non-existent user
body=$(curl -s -X POST "$BASE/login.php" \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@example.com","password":"x"}')
assert_json_field "1d. Unknown user — success:false"   ".success" "false" "$body"

# 1e. Empty body — no PHP warnings, valid JSON returned
body=$(curl -s -X POST "$BASE/login.php" \
  -H "Content-Type: application/json" \
  -d '{}')
valid_json=$(echo "$body" | jq -e . >/dev/null 2>&1 && echo "ok" || echo "bad")
if [ "$valid_json" = "ok" ]; then green "1e. Empty body — returns valid JSON"; PASS=$((PASS+1));
else red "1e. Empty body — invalid JSON or PHP warning leaked"; FAIL=$((FAIL+1)); fi

# 1f. Completely empty POST body
body=$(curl -s -X POST "$BASE/login.php" \
  -H "Content-Type: application/json" \
  -d '')
valid_json=$(echo "$body" | jq -e . >/dev/null 2>&1 && echo "ok" || echo "bad")
if [ "$valid_json" = "ok" ]; then green "1f. Empty POST body — returns valid JSON"; PASS=$((PASS+1));
else red "1f. Empty POST body — invalid JSON or PHP warning leaked"; FAIL=$((FAIL+1)); fi

# 1g. Invalid email format
body=$(curl -s -X POST "$BASE/login.php" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":"x"}')
assert_json_field "1g. Invalid email format — success:false" ".success" "false" "$body"

# 1h. SQL injection in email field
body=$(curl -s -X POST "$BASE/login.php" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@x.com\" OR 1=1 -- ","password":"x"}')
assert_json_field "1h. SQL injection in email — success:false" ".success" "false" "$body"

# ── 2. REGISTRATION ─────────────────────────────────────────
echo ""
echo "=== 2. Registration ==="

# 2a. Valid new user
RAND=$RANDOM
body=$(curl -s -X POST "$BASE/register.php" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Temp\",\"email\":\"temp_$RAND@test.com\",\"password\":\"pass\"}")
assert_json_field "2a. New user register — success:true" ".success" "true" "$body"
$MYSQL_CMD -e "DELETE FROM users WHERE email='temp_$RAND@test.com';" 2>/dev/null

# 2b. Duplicate email
body=$(curl -s -X POST "$BASE/register.php" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Dup\",\"email\":\"$USER_EMAIL\",\"password\":\"pass\"}")
assert_json_field "2b. Duplicate email — success:false" ".success" "false" "$body"

# 2c. Empty body
body=$(curl -s -X POST "$BASE/register.php" \
  -H "Content-Type: application/json" \
  -d '{}')
valid_json=$(echo "$body" | jq -e . >/dev/null 2>&1 && echo "ok" || echo "bad")
if [ "$valid_json" = "ok" ]; then green "2c. Register empty body — returns valid JSON"; PASS=$((PASS+1));
else red "2c. Register empty body — PHP warning leaked"; FAIL=$((FAIL+1)); fi

# 2d. Invalid email format
body=$(curl -s -X POST "$BASE/register.php" \
  -H "Content-Type: application/json" \
  -d '{"name":"X","email":"bad","password":"pass"}')
assert_json_field "2d. Register invalid email — success:false" ".success" "false" "$body"

# 2e. SQL injection in name field
body=$(curl -s -X POST "$BASE/register.php" \
  -H "Content-Type: application/json" \
  -d '{"name":"Robert\"); DROP TABLE users;--","email":"safe@test.com","password":"pass"}')
valid_json=$(echo "$body" | jq -e . >/dev/null 2>&1 && echo "ok" || echo "bad")
# Verify users table still exists
table_check=$($MYSQL_CMD -e "SHOW TABLES LIKE 'users';" 2>/dev/null | grep -c "users" || echo "0")
if [ "$valid_json" = "ok" ] && [ "$table_check" -ge "1" ]; then
  green "2e. SQL injection in name — users table intact, valid JSON returned"
  PASS=$((PASS+1))
else
  red "2e. SQL injection in name — FAILED (table may be gone or JSON malformed)"
  FAIL=$((FAIL+1))
fi
$MYSQL_CMD -e "DELETE FROM users WHERE email='safe@test.com';" 2>/dev/null

# 2f. Extremely long name (512 chars)
LONG_NAME=$(python3 -c "print('A'*512)")
body=$(curl -s -X POST "$BASE/register.php" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$LONG_NAME\",\"email\":\"longname_$RANDOM@test.com\",\"password\":\"pass\"}")
valid_json=$(echo "$body" | jq -e . >/dev/null 2>&1 && echo "ok" || echo "bad")
if [ "$valid_json" = "ok" ]; then green "2f. Extremely long name — no crash, valid JSON"; PASS=$((PASS+1));
else red "2f. Extremely long name — invalid JSON or crash"; FAIL=$((FAIL+1)); fi
$MYSQL_CMD -e "DELETE FROM users WHERE name LIKE 'AAAA%';" 2>/dev/null

# ── 3. ROLE-BASED ACCESS CONTROL ────────────────────────────
echo ""
echo "=== 3. RBAC — create_article.php ==="

# 3a. No session → 401 / success:false
body=$(curl -s -X POST "$BASE/create_article.php" \
  -H "Content-Type: application/json" \
  -d '{"title":"hack","category_id":1,"content":"bad"}')
assert_json_field "3a. No session — success:false" ".success" "false" "$body"

# 3b. Regular user session → 403
body=$(curl -s -b "$COOKIE_USER" -X POST "$BASE/create_article.php" \
  -H "Content-Type: application/json" \
  -d '{"title":"hack","category_id":1,"content":"bad"}')
assert_json_field "3b. Regular user — success:false (403)" ".success" "false" "$body"
http_code=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE_USER" \
  -X POST "$BASE/create_article.php" \
  -H "Content-Type: application/json" \
  -d '{"title":"x","category_id":1,"content":"x"}')
assert_http "3c. Regular user — HTTP 403" "403" "$http_code"

# 3d. Admin session → success
body=$(curl -s -b "$COOKIE_ADMIN" -X POST "$BASE/create_article.php" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Article","category_id":1,"content":"Test content from API test."}')
assert_json_field "3d. Admin creates article — success:true" ".success" "true" "$body"
$MYSQL_CMD -e "DELETE FROM articles WHERE title='Test Article';" 2>/dev/null

# 3e. Admin — missing fields → validation error
body=$(curl -s -b "$COOKIE_ADMIN" -X POST "$BASE/create_article.php" \
  -H "Content-Type: application/json" \
  -d '{"title":""}')
assert_json_field "3e. Admin — missing fields — success:false" ".success" "false" "$body"

# 3f. Admin — invalid category_id (string)
body=$(curl -s -b "$COOKIE_ADMIN" -X POST "$BASE/create_article.php" \
  -H "Content-Type: application/json" \
  -d '{"title":"T","category_id":"notanumber","content":"C"}')
assert_json_field "3f. Admin — invalid category_id — success:false" ".success" "false" "$body"

# 3g. Admin — SQL injection in title
body=$(curl -s -b "$COOKIE_ADMIN" -X POST "$BASE/create_article.php" \
  -H "Content-Type: application/json" \
  -d '{"title":"INJECT\"; DROP TABLE articles;--","category_id":1,"content":"C"}')
valid_json=$(echo "$body" | jq -e . >/dev/null 2>&1 && echo "ok" || echo "bad")
table_check=$($MYSQL_CMD -e "SHOW TABLES LIKE 'articles';" 2>/dev/null | grep -c "articles" || echo "0")
if [ "$valid_json" = "ok" ] && [ "$table_check" -ge "1" ]; then
  green "3g. SQL injection in title — articles table intact"
  PASS=$((PASS+1))
else
  red "3g. SQL injection in title — FAILED"
  FAIL=$((FAIL+1))
fi
$MYSQL_CMD -e "DELETE FROM articles WHERE title LIKE 'INJECT%';" 2>/dev/null

# ── 4. SEARCH ENDPOINT ──────────────────────────────────────
echo ""
echo "=== 4. Search ==="

# 4a. No query → returns array
body=$(curl -s "$BASE/search_articles.php")
is_array=$(echo "$body" | jq 'if type=="array" then "yes" else "no" end' 2>/dev/null || echo "no")
if [ "$is_array" = '"yes"' ]; then green "4a. No query — returns JSON array"; PASS=$((PASS+1));
else red "4a. No query — expected array"; FAIL=$((FAIL+1)); fi

# 4b. Normal query
body=$(curl -s "$BASE/search_articles.php?q=the")
is_array=$(echo "$body" | jq 'if type=="array" then "yes" else "no" end' 2>/dev/null || echo "no")
if [ "$is_array" = '"yes"' ]; then green "4b. Query 'the' — returns JSON array"; PASS=$((PASS+1));
else red "4b. Query 'the' — expected array"; FAIL=$((FAIL+1)); fi

# 4c. Empty string query
body=$(curl -s "$BASE/search_articles.php?q=")
is_array=$(echo "$body" | jq 'if type=="array" then "yes" else "no" end' 2>/dev/null || echo "no")
if [ "$is_array" = '"yes"' ]; then green "4c. Empty string query — returns JSON array"; PASS=$((PASS+1));
else red "4c. Empty string query — expected array"; FAIL=$((FAIL+1)); fi

# 4d. Special characters
body=$(curl -s -G "$BASE/search_articles.php" --data-urlencode "q='; DROP TABLE articles;--")
is_array=$(echo "$body" | jq 'if type=="array" then "yes" else "no" end' 2>/dev/null || echo "no")
table_check=$($MYSQL_CMD -e "SHOW TABLES LIKE 'articles';" 2>/dev/null | grep -c "articles" || echo "0")
if [ "$is_array" = '"yes"' ] && [ "$table_check" -ge "1" ]; then
  green "4d. SQL injection in search — articles table intact"
  PASS=$((PASS+1))
else
  red "4d. SQL injection in search — FAILED"
  FAIL=$((FAIL+1))
fi

# 4e. Unicode / emoji
body=$(curl -s -G "$BASE/search_articles.php" --data-urlencode "q=🌿café")
is_array=$(echo "$body" | jq 'if type=="array" then "yes" else "no" end' 2>/dev/null || echo "no")
if [ "$is_array" = '"yes"' ]; then green "4e. Unicode/emoji query — no crash"; PASS=$((PASS+1));
else red "4e. Unicode/emoji query — crashed or non-array"; FAIL=$((FAIL+1)); fi

# 4f. Very long query (1000 chars)
LONG_Q=$(python3 -c "print('a'*1000)")
body=$(curl -s -G "$BASE/search_articles.php" --data-urlencode "q=$LONG_Q")
is_array=$(echo "$body" | jq 'if type=="array" then "yes" else "no" end' 2>/dev/null || echo "no")
if [ "$is_array" = '"yes"' ]; then green "4f. Very long query — no crash"; PASS=$((PASS+1));
else red "4f. Very long query — crashed or non-array"; FAIL=$((FAIL+1)); fi

# 4g. Invalid category_id
body=$(curl -s "$BASE/search_articles.php?category_id=abc")
is_array=$(echo "$body" | jq 'if type=="array" then "yes" else "no" end' 2>/dev/null || echo "no")
if [ "$is_array" = '"yes"' ]; then green "4g. Invalid category_id — returns array (no crash)"; PASS=$((PASS+1));
else red "4g. Invalid category_id — crashed"; FAIL=$((FAIL+1)); fi

# ── 5. BOOKMARKS ────────────────────────────────────────────
echo ""
echo "=== 5. Bookmarks ==="

# 5a. Get bookmarks without session → success:false or empty
body=$(curl -s "$BASE/get_bookmarks.php")
valid_json=$(echo "$body" | jq -e . >/dev/null 2>&1 && echo "ok" || echo "bad")
if [ "$valid_json" = "ok" ]; then green "5a. Get bookmarks no session — valid JSON"; PASS=$((PASS+1));
else red "5a. Get bookmarks no session — invalid JSON"; FAIL=$((FAIL+1)); fi

# 5b. Add bookmark no session → success:false
body=$(curl -s -X POST "$BASE/add_bookmark.php" \
  -H "Content-Type: application/json" \
  -d '{"article_id":1}')
assert_json_field "5b. Add bookmark no session — success:false" ".success" "false" "$body"

# 5c. Remove bookmark no session → success:false
body=$(curl -s -X POST "$BASE/remove_bookmark.php" \
  -H "Content-Type: application/json" \
  -d '{"article_id":1}')
assert_json_field "5c. Remove bookmark no session — success:false" ".success" "false" "$body"

# ── 6. COMMENTS ─────────────────────────────────────────────
echo ""
echo "=== 6. Comments ==="

# 6a. Add comment no session → success:false
body=$(curl -s -X POST "$BASE/add_comment.php" \
  -H "Content-Type: application/json" \
  -d '{"article_id":1,"content":"sneaky"}')
assert_json_field "6a. Add comment no session — success:false" ".success" "false" "$body"

# 6b. Get comments (public) → array
body=$(curl -s "$BASE/get_comments.php?article_id=1")
valid_json=$(echo "$body" | jq -e . >/dev/null 2>&1 && echo "ok" || echo "bad")
if [ "$valid_json" = "ok" ]; then green "6b. Get comments — valid JSON"; PASS=$((PASS+1));
else red "6b. Get comments — invalid JSON"; FAIL=$((FAIL+1)); fi

# 6c. Add comment with session but empty content
body=$(curl -s -b "$COOKIE_USER" -X POST "$BASE/add_comment.php" \
  -H "Content-Type: application/json" \
  -d '{"article_id":1,"content":""}')
assert_json_field "6c. Add comment empty content — success:false" ".success" "false" "$body"

# ── 7. SESSION CHECK ────────────────────────────────────────
echo ""
echo "=== 7. Session ==="

# 7a. No session → logged_in:false
body=$(curl -s "$BASE/session_check.php")
assert_json_field "7a. No session — logged_in:false" ".logged_in" "false" "$body"

# 7b. User session → logged_in:true
body=$(curl -s -b "$COOKIE_USER" "$BASE/session_check.php")
assert_json_field "7b. User session — logged_in:true"  ".logged_in" "true" "$body"
assert_json_field "7b. User session — role:user"       ".role"      "user" "$body"

# 7c. Admin session → role:admin
body=$(curl -s -b "$COOKIE_ADMIN" "$BASE/session_check.php")
assert_json_field "7c. Admin session — role:admin" ".role" "admin" "$body"

# ── 8. SESSION FIXATION ─────────────────────────────────────
echo ""
echo "=== 8. Session Fixation ==="

# 8a. Session ID must change on login (session_regenerate_id)
COOKIE_FIXATION=$(mktemp)
# Make an unauthenticated request to obtain a pre-login session ID
curl -s -c "$COOKIE_FIXATION" "$BASE/session_check.php" > /dev/null
pre_sid=$(grep -i "PHPSESSID" "$COOKIE_FIXATION" | awk '{print $NF}')

# Now log in using that same cookie jar
curl -s -b "$COOKIE_FIXATION" -c "$COOKIE_FIXATION" \
  -X POST "$BASE/login.php" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASS\"}" > /dev/null
post_sid=$(grep -i "PHPSESSID" "$COOKIE_FIXATION" | awk '{print $NF}')

if [ -n "$pre_sid" ] && [ -n "$post_sid" ] && [ "$pre_sid" != "$post_sid" ]; then
  green "8a. Session ID rotated on login (session fixation prevented)"
  PASS=$((PASS+1))
else
  red "8a. Session ID did NOT change on login — session fixation possible"
  FAIL=$((FAIL+1))
fi
rm -f "$COOKIE_FIXATION"

# ── cleanup ─────────────────────────────────────────────────
$MYSQL_CMD -e "DELETE FROM users WHERE email IN ('$ADMIN_EMAIL','$USER_EMAIL');" 2>/dev/null
rm -f "$COOKIE_USER" "$COOKIE_ADMIN"

# ── results ─────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════"
echo "  Results:  $PASS passed,  $FAIL failed  (total $((PASS+FAIL)))"
echo "════════════════════════════════════════════════════════"
[ "$FAIL" -eq 0 ]
