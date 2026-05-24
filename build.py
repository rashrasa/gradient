import subprocess, shutil
from pathlib import Path

subprocess.run("cargo build")

subprocess.run("wasm-pack build packages/fourier/fourier-engine --target bundler")

src_fe = Path("packages/fourier/fourier-engine/pkg")
dst_fe = Path("apps/frontend/packages/fourier-engine")
dst_fe.mkdir(parents=True, exist_ok=True)
for path in src_fe.glob("*"):
    if path.is_file():
        shutil.copy2(path, dst_fe/path.name)