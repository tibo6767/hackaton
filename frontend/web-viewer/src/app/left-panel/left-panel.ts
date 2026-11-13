import {TitleCasePipe} from '@angular/common';
import {Component, output, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';


interface Project {
  name:string,
  items:string[]
}

@Component({
  imports: [MatListModule, MatIconModule, TitleCasePipe],
  selector: 'app-left-panel',
  styleUrl: './left-panel.css',
  templateUrl: './left-panel.html',
})
export class LeftPanel {
  projects: Project[] = [
    {name:'Poject1',items:['modele1','model2']},{name:'Project2',items:['model1']},{name:'Project3',items:['model1','model2','model3']}
  ];
  openFolders = signal<Set<string>>(new Set());
  activeItem = signal<string | null>(null);
  modelSelected = output<string>();

  select(item: string) {
    this.activeItem.set(item);
    this.modelSelected.emit(item);
  }

  toggle(name: string) {
    this.openFolders.update(set => {
      const next = new Set(set);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  isOpen(name: string) {
    return this.openFolders().has(name);
  }


}
