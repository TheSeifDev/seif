"""Run the actual Phase 2 checks and retain their real exit codes."""
from pathlib import Path
import json
import subprocess

root = Path(__file__).resolve().parents[1]
log_dir = root / "docs" / "checks"
log_dir.mkdir(parents=True, exist_ok=True)
results = {}
for name in ("build", "typecheck", "lint"):
    print(f"Running npm run {name}...", flush=True)
    result = subprocess.run(
        ["npm", "run", name], cwd=root, text=True,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    )
    (log_dir / f"{name}.log").write_text(result.stdout)
    results[name] = {"command": f"npm run {name}", "exit_code": result.returncode}
    print(result.stdout, end="", flush=True)
    print(f"{name}: exit {result.returncode}", flush=True)
(log_dir / "results.json").write_text(json.dumps(results, indent=2) + "\n")
raise SystemExit(0 if all(v["exit_code"] == 0 for v in results.values()) else 1)
