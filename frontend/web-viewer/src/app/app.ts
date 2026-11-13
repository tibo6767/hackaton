import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Viewer } from './viewer/viewer';
import { Header } from './header/header';
import { LeftPanel } from './left-panel/left-panel';
import { Grid } from './grid/grid';
import { Asset } from './services/projects.service';

@Component({
  imports: [RouterOutlet, Viewer, Header, LeftPanel, Grid],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  host: { '[attr.data-theme]': 'theme()' },
})
export class App {
  protected readonly title = signal('web-viewer');
  protected readonly theme = signal<'light' | 'dark'>('dark');
  protected readonly selectedModel = signal<Asset | null>(null);
  protected readonly mode = signal<'single' | 'grid'>('single');
  protected readonly selectedProject = signal<string | null>(null);

  // Clic sur une vignette de la grille : on ouvre le modèle en mode classique
  protected openAsset(asset: Asset) {
    this.selectedModel.set(asset);
    this.mode.set('single');
  }
}
