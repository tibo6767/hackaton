import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Asset, projectService } from '../services/projects.service';

const PAGE_SIZE = 8; // 2 lignes de 4

@Component({
  imports: [MatIconModule],
  selector: 'app-grid',
  styleUrl: './grid.css',
  templateUrl: './grid.html',
})
export class Grid {
  private projectService = inject(projectService);

  project = input<string | null>(null);
  assetOpened = output<Asset>();

  assets = signal<Asset[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  page = signal(0);

  pageCount = computed(() => Math.max(1, Math.ceil(this.assets().length / PAGE_SIZE)));
  visible = computed(() => {
    const start = this.page() * PAGE_SIZE;
    return this.assets().slice(start, start + PAGE_SIZE);
  });

  constructor() {
    // Recharge les assets quand le projet sélectionné change
    effect(onCleanup => {
      const name = this.project();
      this.assets.set([]);
      this.page.set(0);
      this.error.set(null);
      if (!name) return;

      this.loading.set(true);
      const sub = this.projectService.getAssets(name).subscribe({
        next: list => this.assets.set(list),
        error: err => {
          console.error(err);
          this.error.set('Impossible de charger les assets');
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  prev() {
    this.page.update(p => Math.max(0, p - 1));
  }

  next() {
    this.page.update(p => Math.min(this.pageCount() - 1, p + 1));
  }
}
