# URL Shortener — API (NestJS)

Serviço REST para encurtar URLs, com autenticação JWT, contagem de cliques, analytics por requisição, soft delete e documentação OpenAPI. Pensado para rodar com **PostgreSQL** e subir com **Docker Compose** (API + banco + KrakenD opcional).

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime / framework | Node.js, **NestJS 10**, TypeScript |
| Banco | **PostgreSQL 14** |
| ORM | **TypeORM** (migrations + `synchronize` só em `development`) |
| Auth | **JWT** (Passport) |
| Validação / API | `class-validator`, **Swagger** (`/api/docs`) |
| Qualidade | **ESLint 9** (flat config), **Prettier**, **Jest** |
| Deploy local | **Docker Compose**; gateway **KrakenD 2.5** |
| Observabilidade (opcional) | Compose de **Prometheus + Grafana** (ajuste o scrape ao endpoint real de métricas, se houver) |

> **Node:** os Dockerfiles usam Node 18; o CLI do Nest 11 recomenda Node ≥ 20 — para novo ambiente, prefira **Node 20 LTS**.

---

## Arquitetura de pastas (visão limpa)

```
src/
├── domain/                 # Entidades TypeORM + serviços de domínio (ex.: geração de código curto)
├── application/dtos/       # DTOs de entrada/saída (validação + contrato da API)
├── presentation/         # Guards e decorators HTTP (ex.: JWT, usuário atual)
├── infrastructure/       # Config, TypeORM, migrations, módulos Nest (auth, urls, health, users)
├── app.module.ts
└── main.ts
```

- **Redirecionamento** do link curto fica na **raiz**: `GET /:shortCode` (fora do prefixo global `api`).
- Demais rotas da API ficam sob **`/api/...`**.

---

## Pré-requisitos

- **Docker** + **Docker Compose** (plugin `docker compose`), ou
- **Node.js** 18+ (ideal 20+), **npm**, **PostgreSQL** acessível.

---

## Configuração

1. Copie o exemplo de ambiente:

```bash
cp .env.example .env
```

2. Ajuste valores (JWT forte em produção, `URL_PREFIX` = URL pública base dos links curtos).

Variáveis principais (ver [`.env.example`](.env.example)):

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta HTTP da API (padrão 3000) |
| `NODE_ENV` | `development` habilita `synchronize` e logs SQL do TypeORM |
| `DB_*` | Host, porta, usuário, senha e nome do banco PostgreSQL |
| `JWT_SECRET` / `JWT_EXPIRATION` | Assinatura e TTL do token |
| `URL_PREFIX` | Base usada na resposta do encurtador (ex.: `http://localhost:8080` atrás do gateway) |

---

## Rodar localmente (sem Docker da API)

Com PostgreSQL no ar e `.env` com `DB_HOST=localhost`:

```bash
npm install
npm run migration:run   # recomendado em ambientes que não usam só synchronize
npm run start:dev
```

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- Health: `http://localhost:3000/api/system/health`
- Redirect: `http://localhost:3000/{shortCode}`

---

## Docker Compose (API + Postgres + KrakenD)

Na raiz do repositório:

```bash
docker compose up --build -d
```

- **Gateway (KrakenD):** `http://localhost:8080` — use este host no `URL_PREFIX` se os links curtos forem clicados pelo usuário final passando pelo gateway.
- **Postgres:** porta **5432** (mapeada no host; altere com cuidado se já houver Postgres local).
- A API escuta **3000** apenas na rede Docker (não exposta no compose “full” por padrão).

Compose alternativo só **app + Postgres** (API na porta **3000** do host):

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

### Monitoramento (opcional)

Requer a rede `url-shortener-network` criada pelo compose principal:

```bash
docker compose up -d
docker compose -f docker-compose.monitoring.yml up -d
```

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (usuário padrão `admin` / senha `admin` conforme compose)

> O `prometheus.yml` pode apontar para um path de métricas que ainda não existe na aplicação; ajuste o scrape quando expuser `/metrics` ou equivalente.

---

## Endpoints (resumo)

Prefixo **`/api`** para a API REST; **exceção:** redirect na raiz.

### Autenticação

| Método | Caminho | Auth |
|--------|---------|------|
| POST | `/api/auth/register` | Não |
| POST | `/api/auth/login` | Não |

### URLs

| Método | Caminho | Auth | Descrição |
|--------|---------|------|-----------|
| POST | `/api/shorten` | Não | Encurtar (público) |
| POST | `/api/urls` | JWT | Encurtar vinculado ao usuário |
| POST | `/api/urls/bulk` | JWT | Vários links |
| GET | `/api/urls` | JWT | Listar do usuário (inclui cliques) |
| GET | `/api/urls/:id/analytics` | JWT | Analytics da URL |
| GET | `/api/analytics` | JWT | Analytics agregados do usuário |
| POST | `/api/urls/:id/qr` | JWT | QR code |
| PUT | `/api/urls/:id` | JWT | Atualizar destino / metadados |
| DELETE | `/api/urls/:id` | JWT | Soft delete |
| GET | `/:shortCode` | Não | Redirect 302 + contabiliza clique |

### Saúde

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | `/api/system/health` | Status básico (evita colisão com `/:shortCode` sob `/api`) |

---

## Migrations

```bash
npm run migration:run
npm run migration:revert
npm run migration:generate -- src/infrastructure/database/migrations/NomeDaMigration
```

Em `NODE_ENV=development`, o TypeORM pode usar **`synchronize: true`** (útil no Docker de dev); em produção use **migrations** e `synchronize: false`.

---

## Testes e lint

```bash
npm run test
npm run test:cov
npm run test:e2e    # requer API + Postgres conforme ambiente do teste
npm run lint
npm run format
```

---

## KrakenD

Configuração: [`gateway/krakend/krakend.json`](gateway/krakend/krakend.json).  
Dockerfile: [`gateway/Dockerfile`](gateway/Dockerfile).

Hoje o gateway faz principalmente **proxy**, **CORS** e **métricas** do próprio KrakenD (porta 8090). A **validação JWT** das rotas protegidas continua na **API Nest**.

---

## Escala horizontal (lembrete para produção)

- **Estado:** JWT stateless ajuda; **banco e filas** viram gargalo antes da API.
- **Redirect:** tráfego alto em `GET /:shortCode` — cache HTTP (CDN / edge) ou cache do destino por `shortCode` reduz carga no banco.
- **Geração de código:** índice único em `shortCode`; colisão tratada com retry; em escala muito alta, avaliar sequência + base62 ou alocação em lote.
- **Analytics:** escrita por clique — particionar por tempo, fila assíncrona ou agregação em batch.
- **Gateway:** rate limiting, WAF e TLS no edge (KrakenD, API Gateway gerenciado ou reverse proxy).

---

## Documentação extra

- [Perguntas de entrevista — Pleno e Sênior](docs/PERGUNTAS_ENTREVISTA.md) (roteiro de estudo e raciocínio de engenharia).

---

## Licença

UNLICENSED (projeto privado; ajuste conforme necessidade).
