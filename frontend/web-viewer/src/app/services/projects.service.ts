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

    getPreviewUrl(modelName: string): Observable<string> {
        return this.http
            .post<{ url: string; preview: string }>(`${this.apiUrl}/model`, null, {
                params: { name: modelName },
            })
            .pipe(map(res => dataUrl(res.preview)));
    }
}

// Convertit un chemin renvoyé par l'API ("../data/preview/X.mp4") en URL servie par le proxy
export function dataUrl(apiPath: string): string {
    const rel = apiPath.replace(/\\/g, '/').split('/data/').pop()!.replace(/^\/+/, '');
    return '/data/' + rel.split('/').map(encodeURIComponent).join('/');
}
