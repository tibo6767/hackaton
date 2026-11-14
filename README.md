# Hackaton – 3D Asset Viewer

A web app built around [F3D](https://f3d.app) to browse the 3D models of the
[open-source-3D-assets](https://github.com/ToxSam/open-source-3D-assets) database.

Pick a project, browse its assets, and select a model: the backend downloads it and
renders a turntable preview video with F3D, which the frontend then plays.

## Built with

- [Angular](https://angular.dev) + Angular Material – frontend
- [FastAPI](https://fastapi.tiangolo.com) (Python) – backend API
- [F3D](https://f3d.app) Python bindings + `ffmpeg` – turntable video rendering

## Project structure

```
.
├── frontend/web-viewer/   # Angular app (grid, viewer, side panel)
│   └── proxy.conf.mjs     # Dev proxy: /api -> FastAPI, /data -> generated files
├── loader/                # FastAPI backend
│   ├── main.py            # API endpoints
│   ├── turntable_video.py # Turntable video generation with F3D
│   └── f3d_extras/        # F3D helpers (download, camera, ffmpeg encoding)
└── data/                  # Generated at runtime (git-ignored)
    ├── json/              # Downloaded project/asset metadata
    └── preview/           # Rendered .mp4 previews
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) and npm (recent version, required by Angular)
- Python 3.10+
- [`ffmpeg`](https://ffmpeg.org) available on your `PATH`

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/tibo6767/hackaton
   cd hackaton
   ```

2. Install the Python dependencies (a virtual environment is recommended)
   ```sh
   python -m venv .venv
   source .venv/bin/activate
   pip install "fastapi[standard]" f3d requests numpy tqdm
   ```

3. Install the frontend dependencies
   ```sh
   cd frontend/web-viewer
   npm install
   ```

> **Nix users:** a dev shell is available in `loader/flake.nix` (`nix develop`), but it
> doesn't include `f3d`, `numpy` or `tqdm` yet.

## Running

Start both services in two separate terminals.

**Backend** (API on http://localhost:8000):
```sh
cd loader
fastapi dev main.py
```

**Frontend** (app on http://localhost:4200):
```sh
cd frontend/web-viewer
npm start
```

Then open http://localhost:4200.

The Angular dev server proxies `/api/*` to the backend and serves the generated previews
from `data/` directly, so both services must run on the same machine.

## API

| Method | Endpoint             | Description                                                          |
| ------ | -------------------- | -------------------------------------------------------------------- |
| GET    | `/projects`          | List the projects in the asset database                              |
| POST   | `/assets?name=<name>`| List the assets of a project                                         |
| POST   | `/model?name=<name>` | Render (or reuse) the turntable preview of an asset; returns its URL and video path |

Interactive docs are available at http://localhost:8000/docs while the backend is running.

> `/assets` must be called before `/model`: the backend keeps the currently selected
> project's assets in memory.
