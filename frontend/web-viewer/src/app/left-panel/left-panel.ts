import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Asset, Project, projectService } from '../services/projects.service';
@Component({
  imports: [MatListModule, MatIconModule],
  selector: 'app-left-panel',
  styleUrl: './left-panel.css',
  templateUrl: './left-panel.html',
})
export class LeftPanel implements OnInit {
  private projectService = inject(projectService);

  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Assets chargés par projet (cache), et projets en cours de chargement
  assets = signal<Record<string, Asset[]>>({});
  loadingAssets = signal<Set<string>>(new Set());

  openFolders = signal<Set<string>>(new Set());
  activeItem = signal<string | null>(null);
  modelSelected = output<Asset>();

  // Mode d'affichage : un fichier à la fois, ou grille des fichiers d'un projet
  mode = input<'single' | 'grid'>('single');
  modeChange = output<'single' | 'grid'>();
  activeProject = signal<string | null>(null);
  projectSelected = output<string>();

  clickProject(name: string) {
    if (this.mode() === 'grid') {
      this.activeProject.set(name);
      this.projectSelected.emit(name);
    } else {
      this.toggle(name);
    }
  }

  select(item: Asset) {
    this.activeItem.set(item.name);
    this.modelSelected.emit(item);
  }
  ngOnInit() {
    this.projectService.getProjects().subscribe({
      next: data => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.error.set('Impossible de charger les projets');
        this.loading.set(false);
      },
    });
  }

  toggle(name: string) {
    this.openFolders.update(set => {
      const next = new Set(set);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

    if (this.isOpen(name) && !this.assets()[name]) {
      this.loadAssets(name);
    }
  }

  isOpen(name: string) {
    return this.openFolders().has(name);
  }

  private loadAssets(name: string) {
    this.loadingAssets.update(s => new Set(s).add(name));
    this.projectService.getAssets(name).subscribe({
      next: list => this.assets.update(a => ({ ...a, [name]: list })),
      error: err => console.error(err),
      complete: () =>
        this.loadingAssets.update(s => {
          const next = new Set(s);
          next.delete(name);
          return next;
        }),
    });
  }
}
