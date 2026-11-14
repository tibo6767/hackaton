import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

// Dossier où l'API écrit ses fichiers (data/json et data/preview à la racine du repo).
// L'API et le front tournent sur le même PC, donc on lit directement les fichiers
// au lieu de passer par le back.
const DATA_DIR = resolve(import.meta.dirname, '../../data');

const CONTENT_TYPES = {
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
};

export default {
  // Appels à l'API FastAPI : /api/xxx -> http://localhost:8000/xxx
  '/api': {
    target: 'http://localhost:8000',
    secure: false,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
  },

  // Fichiers générés par l'API : /data/preview/X.mp4 -> <repo>/data/preview/X.mp4.
  // Lus à chaque requête, donc les fichiers créés après le démarrage de ng serve marchent.
  '/data': {
    target: 'http://localhost:8000', // requis par Vite, jamais utilisé (bypass répond)
    bypass(req, res) {
      const rel = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/data\/?/, '');
      const file = resolve(DATA_DIR, rel);
      const type = CONTENT_TYPES[extname(file).toLowerCase()];

      // Refuse ce qui sort de data/, les types inconnus et les fichiers absents -> 404
      if (!file.startsWith(DATA_DIR + sep) || !type || !existsSync(file) || !statSync(file).isFile()) {
        return false;
      }

      res.setHeader('Content-Type', type);
      res.setHeader('Cache-Control', 'no-cache');
      res.end(readFileSync(file));
      return req.url; // réponse déjà envoyée : Vite s'arrête là
    },
  },
};
