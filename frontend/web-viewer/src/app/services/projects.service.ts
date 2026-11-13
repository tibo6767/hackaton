import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Project {
    name: string;
    description: string;
    url: string;
}

export interface Asset {
    name: string;
    description: string;
    thumbnail_url: string;
    url: string;
}

@Injectable({ providedIn: 'root' })
export class projectService {
    private http = inject(HttpClient);
    private apiUrl = '/api';

    // L'API renvoie un objet { "nom": {...} } : on le convertit en tableau
    getProjects(): Observable<Project[]> {
        return this.http
            .get<Record<string, Omit<Project, 'name'>>>(`${this.apiUrl}/projects`)
            .pipe(map(data => Object.entries(data).map(([name, p]) => ({ name, ...p }))));
    }

    getAssets(projectName: string): Observable<Asset[]> {
        return this.http
            .post<Record<string, Omit<Asset, 'name'>>>(`${this.apiUrl}/assets`, null, {
                params: { name: projectName },
            })
            .pipe(map(data => Object.entries(data).map(([name, a]) => ({ name, ...a }))));
    }
}
