"""FastAPI demo server for the Deployable UI library.

Serves:
  /           -> demo/html/index.html
  /js/*       -> files from demo/js
  /static/*   -> library assets from src/ui (css/js)

Keep demo-only code under demo/, library-only code under src/ui/.
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, RedirectResponse, Response
from fastapi.staticfiles import StaticFiles

# Resolve paths
REPO_ROOT = Path(__file__).resolve().parent.parent
DEMO_DIR = REPO_ROOT / "demo"
DEMO_HTML_DIR = DEMO_DIR / "html"
DEMO_JS_DIR = DEMO_DIR / "js"
DEMO_INDEX = DEMO_HTML_DIR / "index.html"
SRC_UI_DIR = REPO_ROOT / "src" / "ui"

app = FastAPI(title="Deployable UI Demo")

# Mount library assets at /static (CSS/JS used by the demo)
app.mount("/static", StaticFiles(directory=SRC_UI_DIR), name="static")

# Mount demo JS at /js
app.mount("/js", StaticFiles(directory=DEMO_JS_DIR), name="demo_js")


@app.get("/", response_class=HTMLResponse)
def root():
    if not DEMO_INDEX.exists():
        return HTMLResponse(
            f"<h1>Index not found</h1><p>Expected: {DEMO_INDEX}</p>", status_code=500
        )
    return HTMLResponse(DEMO_INDEX.read_text(encoding="utf-8"))


@app.get("/demo")
def to_root():
    # Convenience alias: /demo -> /
    return RedirectResponse(url="/")


@app.get("/favicon.ico")
def favicon():
    # Silence browser 404 noise without shipping an icon
    return Response(status_code=204)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "demo_dir": str(DEMO_DIR),
        "html_dir": str(DEMO_HTML_DIR),
        "js_dir": str(DEMO_JS_DIR),
        "index_exists": DEMO_INDEX.exists(),
        "static_dir": str(SRC_UI_DIR),
    }



def healthz():
    """Backwards compatible health endpoint."""
    return {"status": "ok", "exists": True}


if __name__ == "__main__":
    import uvicorn

    # Note: your Makefile uses :8001; this is for direct runs.
    uvicorn.run(app, host="127.0.0.1", port=8001, reload=True)
