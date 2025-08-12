"""FastAPI demo server for the Deployable UI library.

This server serves the contents of the ``demo/`` directory as the site root
and exposes the ``src/ui`` folder under ``/static`` so that the demo can load
the library's JavaScript and CSS assets.
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles


REPO_ROOT = Path(__file__).resolve().parent.parent
DEMO_DIR = REPO_ROOT / "demo"  # expects demo/index.html
STATIC_DIR = REPO_ROOT / "src" / "ui"
TITLE = "Deployable UI Demo"

app = FastAPI(title=TITLE)

# Serve static assets from the framework
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

if (DEMO_DIR / "index.html").exists():
    # Serve the demo folder as the site root
    app.mount("/", StaticFiles(directory=str(DEMO_DIR), html=True), name="demo")
else:
    # Minimal fallback so tests still pass even without the demo/
    @app.get("/", response_class=HTMLResponse)
    def fallback_index():
        return f"""<!doctype html>
<html lang=\"en\"><head>
  <meta charset=\"utf-8\" />
  <title>{TITLE}</title>
</head><body>
  <h1>{TITLE}</h1>
  <p>(Fallback page because <code>{DEMO_DIR}</code> was not found.)</p>
</body></html>"""


@app.get("/healthz")
def healthz():
    """Simple health-check endpoint used by tests."""
    return {"status": "ok", "demo_dir": str(DEMO_DIR), "exists": DEMO_DIR.exists()}


@app.get("/demo")
def to_root():
    """Convenience redirect so /demo also serves the demo."""
    return RedirectResponse(url="/")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
