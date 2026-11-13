import { Component, input, output, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [TitleCasePipe, MatIconModule],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  modelName = input<string | null>(null);
  isDark = signal(true);
  themeChange = output<'light' | 'dark'>();

  toggleTheme() {
    this.isDark.set(!this.isDark());
    this.themeChange.emit(this.isDark() ? 'dark' : 'light');
  }
}
