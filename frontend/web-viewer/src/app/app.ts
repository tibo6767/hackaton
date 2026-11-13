import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Viewer } from './viewer/viewer';
import { Header } from './header/header';
import { LeftPanel } from './left-panel/left-panel';

@Component({
  imports: [RouterOutlet, Viewer, Header, LeftPanel],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('web-viewer');
}
