# === Config (override with: make VAR=...) ===
VENV_NAME ?= venv
PYTHON    ?= python3
PIP       := $(VENV_NAME)/bin/pip
PY        := $(VENV_NAME)/bin/python
UVICORN   := $(VENV_NAME)/bin/uvicorn
APP_MODULE = demo.server:app

# Build the venv only if it doesn't exist
$(VENV_NAME)/bin/activate:
	$(PYTHON) -m venv $(VENV_NAME)
	$(PIP) install --upgrade pip setuptools wheel

venv: $(VENV_NAME)/bin/activate

install: venv requirements.txt
	$(PIP) install -r requirements.txt

dev: install
	$(UVICORN) $(APP_MODULE) --host 127.0.0.1 --port 8001 --reload

test: install
	$(PY) -m pytest

.PHONY: venv install dev test
