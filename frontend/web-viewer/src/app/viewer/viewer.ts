import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, signal } from '@angular/core';
import f3d from 'f3d';

type ColoringMode    = 'material' | 'scivis' | 'direct';
type AntialiasingMode = 'none' | 'fxaa';

export interface ViewerSettings {
  ao:           boolean;
  toneMapping:  boolean;
  antialiasing: AntialiasingMode;
  showEdges:    boolean;
  light:        boolean;
  grid:         boolean;
}

@Component({
  imports: [],
  selector: 'app-viewer',
  styleUrl: './viewer.css',
  templateUrl: './viewer.html',
})
export class Viewer implements AfterViewInit, OnDestroy {
  @ViewChild('viewerCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  url       = input<string | null>(null);
  status    = signal<string | null>(null);
  panelOpen = signal(false);
  settings  = signal<ViewerSettings>({
    ao: false, toneMapping: false, antialiasing: 'none',
    showEdges: false, light: false, grid: true,
  });

  private module: any;
  private engine: any;
  private resizeObserver?: ResizeObserver;
  private engineReady = false;
  private loadId = 0;

  constructor() {
    effect(() => { const url = this.url(); if (this.engineReady && url) this.load(url); });
  }

  async ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.module = await f3d({ canvas, locateFile: (p: string) => `/${p}` });
    this.module.Engine.autoloadPlugins();
    this.engine = this.module.Engine.create();
    this.engine.getOptions().setAsString('scene.up_direction', '+Y');
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
    this.engine.getInteractor().start();
    this.engineReady = true;
    this.applySettings();
    const url = this.url();
    if (url) this.load(url);
  }

  ngOnDestroy() { this.resizeObserver?.disconnect(); }

  updateSetting<K extends keyof ViewerSettings>(key: K, value: ViewerSettings[K]) {
    this.settings.update(s => ({ ...s, [key]: value }));
    this.applySettings();
  }

  private applySettings() {
    if (!this.engine) return;
    const opts = this.engine.getOptions();
    const s = this.settings();
    const sync = (name: string, v: boolean) => { if (Boolean(opts.get(name)) !== v) opts.toggle(name); };
    sync('render.effect.ambient_occlusion', s.ao);
    sync('render.effect.tone_mapping',      s.toneMapping);
    sync('render.show_edges',               s.showEdges);
    sync('render.grid.enable',              s.grid);
    sync('render.hdri.ambient',             s.light);
    opts.setAsString('render.effect.antialiasing.mode', s.antialiasing);
    const win = this.engine.getWindow();
    win.render();
  }

  private resize() {
    if (!this.engine) return;
    const c = this.canvasRef.nativeElement;
    this.engine.getWindow().setSize(Math.max(1, c.clientWidth), Math.max(1, c.clientHeight)).render();
  }

  private async load(url: string) {
    const id = ++this.loadId;
    this.status.set('Chargement...');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = new Uint8Array(await res.arrayBuffer());
      if (id !== this.loadId) return;
      let ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? 'glb';
      if (ext === 'vrm') ext = 'glb';
      const path = `/model.${ext}`;
      this.module.FS.writeFile(path, data);
      const scene = this.engine.getScene();
      scene.clear();
      scene.add(path);
      this.engine.getWindow().getCamera().resetToBounds(0.9);
      this.engine.getWindow().render();
      this.status.set(null);
    } catch (err) {
      if (id === this.loadId) this.status.set('Impossible de charger ce modèle');
    }
  }
}
