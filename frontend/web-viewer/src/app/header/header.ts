import { Component, output, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  isDark = signal(true);
  themeChange = output<'light' | 'dark'>();

  toggleTheme() {
    this.isDark.set(!this.isDark());
    this.themeChange.emit(this.isDark() ? 'dark' : 'light');
  }
}
