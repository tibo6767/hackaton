import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, signal } from '@angular/core';
import f3d from 'f3d';

@Component({
  imports: [],
  selector: 'app-viewer',
  styleUrl: './viewer.css',
  templateUrl: './viewer.html',
})
export class Viewer implements AfterViewInit, OnDestroy {
  @ViewChild('viewerCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  /** URL du modèle à afficher (glb, gltf, vrm, stl, obj...) */
  url = input<string | null>(null);

  status = signal<string | null>(null);

  private module: any;
  private engine: any;
  private resizeObserver?: ResizeObserver;
  private ready = signal(false);
  private loadId = 0;

  constructor() {
    // Recharge le modèle quand l'URL change (une fois le moteur prêt)
    effect(() => {
      const url = this.url();
      if (this.ready() && url) this.load(url);
    });
  }

  async ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    // f3d dessine toujours dans le canvas d'id "canvas" (en dur dans le wasm)
    this.module = await f3d({ canvas, locateFile: (path: string) => `/${path}` });
    this.module.Engine.autoloadPlugins();
    this.engine = this.module.Engine.create();

    const options = this.engine.getOptions();
    options.toggle('render.grid.enable');
    options.setAsString('scene.up_direction', '+Y');

    // Garde la taille du rendu synchronisée avec le conteneur
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();

    this.engine.getInteractor().start();
    this.ready.set(true);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  private resize() {
    if (!this.engine) return;
    const canvas = this.canvasRef.nativeElement;
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    this.engine.getWindow().setSize(w, h).render();
  }

  private async load(url: string) {
    const id = ++this.loadId;
    this.status.set('Chargement du modèle...');
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = new Uint8Array(await response.arrayBuffer());
      if (id !== this.loadId) return; // une autre sélection a eu lieu entre-temps

      // f3d choisit le lecteur selon l'extension ; un .vrm est un glb
      let ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? 'glb';
      if (ext === 'vrm') ext = 'glb';
      const path = `/model.${ext}`;
      this.module.FS.writeFile(path, data);

      const scene = this.engine.getScene();
      scene.clear();
      scene.add(path);

      const win = this.engine.getWindow();
      win.getCamera().resetToBounds(0.9);
      win.render();
      this.status.set(null);
    } catch (err) {
      console.error(err);
      if (id === this.loadId) this.status.set('Impossible de charger ce modèle');
    }
  }
}
