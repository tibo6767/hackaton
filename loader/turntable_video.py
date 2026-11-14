import logging
from pathlib import Path
from tempfile import gettempdir
from typing import Any

import f3d
from tqdm import tqdm

from f3d_extras import (
    download_file_if_url,
    image_sequence_to_video,
    turntable_interpolator,
)


def generate_video(model_fn):
    resolution = 640, 360
    initial_camera_position = 1, 1, 1
    camera_zoom_factor = 1.2
    duration = 2
    fps = 12
    turns = 1
    #model_fn = "https://github.com/KhronosGroup/glTF-Sample-Models/raw/main/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb"
    #video_path = Path(gettempdir()) / "f3d-turntable.mp4"
    #model_fn = "https://raw.githubusercontent.com/ToxSam/cc0-models-Polygonal-Mind/main/projects/MomusPark/Bench_01_Art.glb"
    video_path = Path(model_fn).stem + ".mp4"

    if Path(video_path).exists():
        return video_path

    options: dict[str, Any] = {
        "render.hdri.ambient": "on",
        "scene.up_direction": "+y",
    }

    engine = f3d.Engine.create(offscreen=True)
    engine.window.size = resolution
    engine.options.update(options)

    engine.scene.add(download_file_if_url(model_fn))
    engine.window.camera.position = initial_camera_position
    engine.window.camera.reset_to_bounds(zoom_factor=camera_zoom_factor)

    camera_state_interpolator = turntable_interpolator(engine, turns=turns)

    def render_images():
        time = 0.0
        while time < duration:
            camera_state_interpolator(time / duration)
            yield engine.window.render_to_image()
            time += 1.0 / fps

    image_sequence_to_video(
        #tqdm(render_images(), total=fps * duration),  # tqdm for progress bar
        render_images(),
        fps,
        video_path,
        ("-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "ultrafast", "-crf", 23),
    )
    return video_path
