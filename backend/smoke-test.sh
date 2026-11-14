#!/usr/bin/env bash
# Smoke test for the running A.U.R.A. app against specs/001-aura-health-dashboard/contracts/donki-sep-route.md
# Usage: start the app (pnpm dev or pnpm start), then: bash smoke-test.sh [base-url]
# Needs curl and node (no jq).
set -u

BASE_URL="${1:-${BASE_URL:-http://localhost:3000}}"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
FAILS=0

pass() { printf '  PASS  %s\n' "$1"; }
fail() { printf '  FAIL  %s: %s\n' "$1" "$2"; FAILS=$((FAILS + 1)); }

# get <path> -> sets STATUS and CTYPE, body in $TMP
get() {
  local meta
  meta="$(curl -sS -m 15 -o "$TMP" -w '%{http_code} %{content_type}' "$BASE_URL$1" 2>&1)" || {
    STATUS=000; CTYPE="$meta"; return
  }
  STATUS="${meta%% *}"
  CTYPE="${meta#* }"
}

# Validates the DONKI SEP response body on stdin; prints a reason and exits 1 on violation.
check_sep_body() {
  node -e '
    let raw = "";
    process.stdin.on("data", (c) => (raw += c)).on("end", () => {
      const die = (m) => { console.log(m); process.exit(1); };
      let b;
      try { b = JSON.parse(raw); } catch { die("body is not JSON"); }
      if (!["nasaLive", "nasaCached"].includes(b.source)) die(`bad source: ${b.source}`);
      if (b.fetchedAt !== null && (typeof b.fetchedAt !== "string" || isNaN(Date.parse(b.fetchedAt))))
        die(`bad fetchedAt: ${b.fetchedAt}`);
      if (!Array.isArray(b.events)) die("events is not an array");
      if (b.events.length > 20) die(`more than 20 events (${b.events.length})`);
      b.events.forEach((e, i) => {
        if (typeof e.id !== "string" || !e.id) die(`events[${i}].id missing`);
        if (typeof e.eventTime !== "string" || isNaN(Date.parse(e.eventTime))) die(`events[${i}].eventTime invalid`);
        if (!Array.isArray(e.instruments) || e.instruments.some((x) => typeof x !== "string"))
          die(`events[${i}].instruments not string[]`);
        if (e.link !== undefined && typeof e.link !== "string") die(`events[${i}].link not a string`);
        if (i > 0 && Date.parse(e.eventTime) > Date.parse(b.events[i - 1].eventTime))
          die(`events not sorted newest first at index ${i}`);
      });
      console.log(`${b.source}, ${b.events.length} events`);
    });
  ' < "$TMP"
}

echo "A.U.R.A. smoke test -> $BASE_URL"

get "/"
if [ "$STATUS" = "200" ]; then pass "GET / -> 200"; else fail "GET /" "status $STATUS"; fi

# Default request plus edge-case days values: the route must never return an error status.
for q in "" "?days=1" "?days=60" "?days=0" "?days=-5" "?days=9999" "?days=abc"; do
  name="GET /api/donki/sep$q"
  get "/api/donki/sep$q"
  if [ "$STATUS" != "200" ]; then fail "$name" "status $STATUS"; continue; fi
  case "$CTYPE" in application/json*) ;; *) fail "$name" "content-type $CTYPE"; continue ;; esac
  if msg="$(check_sep_body)"; then pass "$name ($msg)"; else fail "$name" "$msg"; fi
done

if [ "$FAILS" -eq 0 ]; then echo "All checks passed."; else echo "$FAILS check(s) failed."; fi
[ "$FAILS" -eq 0 ]
