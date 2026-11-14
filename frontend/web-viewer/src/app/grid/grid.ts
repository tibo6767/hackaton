import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Asset, projectService } from '../services/projects.service';

const PAGE_SIZE = 8;

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

  hovered = signal<string | null>(null);
  previews = signal<Record<string, string>>({});
  previewLoading = signal<Set<string>>(new Set());
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;

  pageCount = computed(() => Math.max(1, Math.ceil(this.assets().length / PAGE_SIZE)));
  visible = computed(() => {
    const start = this.page() * PAGE_SIZE;
    return this.assets().slice(start, start + PAGE_SIZE);
  });

  constructor() {
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

  onHover(asset: Asset) {
    this.hovered.set(asset.name);
    this.clearHoverTimer();
    if (this.previews()[asset.name] || this.previewLoading().has(asset.name)) return;

    this.hoverTimer = setTimeout(() => this.loadPreview(asset.name), 300);
  }

  onLeave() {
    this.hovered.set(null);
    this.clearHoverTimer();
  }

  private loadPreview(name: string) {
    this.previewLoading.update(s => new Set(s).add(name));
    const done = () =>
      this.previewLoading.update(s => {
        const next = new Set(s);
        next.delete(name);
        return next;
      });

    this.projectService.getPreviewUrl(name).subscribe({
      next: url => this.previews.update(p => ({ ...p, [name]: url })),
      error: err => {
        console.error(err);
        done();
      },
      complete: done,
    });
  }

  private clearHoverTimer() {
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
    this.hoverTimer = null;
  }

  prev() {
    this.page.update(p => Math.max(0, p - 1));
  }

  next() {
    this.page.update(p => Math.min(this.pageCount() - 1, p + 1));
  }
}
