from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse

class DemoHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        root = Path(__file__).resolve().parent
        path = path.lstrip('/')
        if path == "":
            path = "index.html"
        return str(root / path)


def run(host='127.0.0.1', port=8000):
    server = ThreadingHTTPServer((host, port), DemoHandler)
    print(f"Serving demo at http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run the Deployable UI demo server')
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    run(args.host, args.port)
