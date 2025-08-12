from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))

import demo.server as server


def test_index_file_contains_title():
    index_path = Path(server.DEMO_DIR) / "index.html"
    assert index_path.exists()
    contents = index_path.read_text()
    assert "Deployable UI Demo" in contents


def test_health_function():
    data = server.healthz()
    assert data["status"] == "ok"
    assert data["exists"] is True
