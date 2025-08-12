import threading
import time
import urllib.request
import sys
from pathlib import Path
import pytest

# Ensure repository root is on sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from demo import server


def start_server():
    server.run('127.0.0.1', 8001)


def test_index_served():
    thread = threading.Thread(target=start_server, daemon=True)
    thread.start()
    time.sleep(0.5)
    with urllib.request.urlopen('http://127.0.0.1:8001/') as response:
        body = response.read().decode('utf-8')
    assert 'Deployable UI Demo' in body
