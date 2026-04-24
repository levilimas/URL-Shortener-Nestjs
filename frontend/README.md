# URL Shortener — Frontend (Vite + React)

Esqueleto para você evoluir **amanhã** ou publicar como **repositório separado** (copie só esta pasta e inicialize um novo `git` se quiser).

## Uso

Na pasta `frontend/`:

```bash
npm install
npm run dev
```

- UI: `http://localhost:5173`
- Chamadas a `/api/*` são enviadas ao backend em `http://localhost:3000` (proxy do Vite).

Ajuste `vite.config.ts` se a API rodar em outra porta ou atrás do KrakenD (`8080`).

## Próximos passos sugeridos

- Tela de login/registro consumindo `POST /api/auth/*`
- Formulário de encurtar + listagem autenticada `GET /api/urls`
- Variável `VITE_API_BASE_URL` se preferir fetch absoluto em produção
