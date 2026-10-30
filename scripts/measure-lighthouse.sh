#!/usr/bin/env bash
set -euo pipefail
base_url="${1:-http://127.0.0.1:3000}"
label="${2:-current}"
out_dir="${LIGHTHOUSE_OUT:-/home/ubuntu/seif-lighthouse}"
lighthouse_bin="${LIGHTHOUSE_BIN:-/home/ubuntu/tools/lighthouse/node_modules/.bin/lighthouse}"
mkdir -p "$out_dir"
for mode in mobile desktop; do
  echo "Measuring $label / $mode at $base_url"
  args=("$base_url" --only-categories=performance,accessibility,best-practices,seo --chrome-path=/usr/bin/chromium --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" --output=json --output=html --output-path="$out_dir/$label-$mode" --quiet)
  if [ "$mode" = "desktop" ]; then args+=(--preset=desktop); fi
  "$lighthouse_bin" "${args[@]}"
  node - "$out_dir/$label-$mode.report.json" <<'JS'
const fs=require('node:fs');
const data=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const scores=Object.fromEntries(Object.entries(data.categories).map(([k,v])=>[k, Math.round((v.score ?? 0)*100)]));
const metrics=Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(k=>[k,data.audits[k].displayValue]));
console.log(JSON.stringify({scores,metrics},null,2));
JS
  echo "Finished $label / $mode"
done
