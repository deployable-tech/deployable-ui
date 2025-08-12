"""Helper script to validate and launch the Deployable UI demo.

Running this script will execute the test suite and, if successful,
start the local demo server.
"""
import subprocess
import sys

def run_tests():
    result = subprocess.run([sys.executable, '-m', 'pytest'], check=False)
    return result.returncode == 0


def start_server():
    subprocess.run([sys.executable, 'demo/server.py'])


def main():
    if run_tests():
        start_server()
    else:
        print('Tests failed. Fix issues before starting the server.')


if __name__ == '__main__':
    main()
