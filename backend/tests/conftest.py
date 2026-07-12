import os
import sys

# Programmatically add the local virtual environment's site-packages to sys.path
# so that the global test runner can locate all dependencies (fastapi, pytest-asyncio, etc.)
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
venv_paths = [
    os.path.join(base_dir, "venv", "lib", "python3.14", "site-packages"),
    os.path.join(base_dir, "venv", "lib64", "python3.14", "site-packages"),
    os.path.join(base_dir, "venv", "lib", "python3.13", "site-packages"),
    os.path.join(base_dir, "venv", "lib64", "python3.13", "site-packages"),
    os.path.join(base_dir, "venv", "lib", "python3.12", "site-packages"),
    os.path.join(base_dir, "venv", "lib64", "python3.12", "site-packages"),
    base_dir  # Add root directory for absolute imports (main, routes, etc.)
]

for p in venv_paths:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

pytest_plugins = ["pytest_asyncio"]
