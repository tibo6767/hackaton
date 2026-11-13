import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import f3d from 'f3d';

@Component({
  imports: [],
  selector: 'app-viewer',
  styleUrl: './viewer.css',
  templateUrl: './viewer.html',
})
export class Viewer implements AfterViewInit {
  @ViewChild('viewerCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  async ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    canvas.id = 'f3d-canvas';

    const module = await f3d();

    const engine = module.Engine.create();

    const options = engine.getOptions();
    options.toggle('render.grid.enable');
    options.setAsString('model.coloring', 'direct');
    options.toggle('ui.scalar_bar');
    options.setAsString('scene.up_direction', '+Z');

    const win = engine.getWindow();
    const response = await fetch('https://f3d.app/data/f3d.vtp');
    const model = new Uint8Array(await response.arrayBuffer());

    const scene = engine.getScene();
    scene.clear();
    scene.addBuffer(model);
    win.getCamera().resetToBounds(0.9);
    win.render();
    engine.getInteractor().start();
  }
}
