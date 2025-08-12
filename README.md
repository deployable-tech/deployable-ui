# deployable-ui

This repository provides a minimal JavaScript UI framework along with a Python
based demo server. It is intended as a starting point for building and testing
complex web applications without relying on Node.js.

## Structure

```
src/ui/
  js/  - framework JavaScript
  css/ - framework styles

demo/      - example application using the framework
tests/     - lightweight pytest suite for the demo server
codex_startup.py - helper script to run tests and launch the demo
```

## Development

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Run the test suite:

   ```bash
   pytest
   ```

3. Launch the demo server:

   ```bash
   python demo/server.py
   ```

   or use the helper script which runs tests first:

   ```bash
   python codex_startup.py
   ```

The demo server will serve `demo/index.html` and related assets. Open your
browser to `http://127.0.0.1:8000/` to view the demo.
