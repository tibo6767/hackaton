import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Asset } from '../services/projects.service';

/**
 * Fenêtre d'aperçu d'un modèle : affiche sa miniature (thumbnail_url de l'API).
 * Se ferme avec `true` si l'utilisateur confirme, `false`/undefined sinon.
 */
@Component({
  imports: [MatDialogModule, MatButtonModule],
  selector: 'app-model-preview-dialog',
  styleUrl: './model-preview-dialog.css',
  templateUrl: './model-preview-dialog.html',
})
export class ModelPreviewDialog {
  readonly asset = inject<Asset>(MAT_DIALOG_DATA);

  imageLoaded = signal(false);
  imageError = signal(false);
}
