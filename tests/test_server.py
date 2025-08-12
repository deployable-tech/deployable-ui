# tests/test_server.py
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, RedirectResponse

# Repo root (…/your-repo/)
REPO_ROOT = Path(__file__).resolve().parent.parent
DEMO_DIR = REPO_ROOT / "demo"           # expects demo/index.html
TITLE = "Deployable UI Demo"

app = FastAPI(title=TITLE)

if DEMO_DIR.exists() and (DEMO_DIR / "index.html").exists():
    # Serve the demo folder as the site root
    app.mount("/", StaticFiles(directory=str(DEMO_DIR), html=True), name="demo")
else:
    # Minimal fallback so tests still pass even without the demo/
    @app.get("/", response_class=HTMLResponse)
    def fallback_index():
        return f"""<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8" />
  <title>{TITLE}</title>
</head><body>
  <h1>{TITLE}</h1>
  <p>(Fallback page because <code>{DEMO_DIR}</code> was not found.)</p>
</body></html>"""

# Optional: health endpoint for quick readiness checks
@app.get("/healthz")
def healthz():
    return {"status": "ok", "demo_dir": str(DEMO_DIR), "exists": DEMO_DIR.exists()}

# Optional: convenience redirect if someone hits /demo explicitly
@app.get("/demo")
def to_root():
    return RedirectResponse(url="/")

if __name__ == "__main__":
    # Allows: python tests/test_server.py (handy outside Makefile)
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
