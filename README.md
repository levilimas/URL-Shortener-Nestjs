# URL Shortener Service

## Descrição
Serviço de encurtamento de URLs construído com NestJS que permite aos usuários criar URLs curtas e rastrear seu uso. Inclui autenticação de usuários, monitoramento e métricas.

## Tecnologias Utilizadas
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT Authentication
- Swagger/OpenAPI
- Docker & Docker Compose
- Prometheus & Grafana (Monitoramento)
- Winston (Logging)
- Jest (Testes)

## Pré-requisitos
- Docker
- Docker Compose
- Node.js 18+ (para desenvolvimento local)
- npm/yarn

## Instalação e Execução

### 1. Clone o repositório
```bash
git clone https://github.com/levilimas/url-shortener-nestjs.git
cd url-shortener-nestjs
```

### 2. Configure as variáveis de ambiente
Copie o arquivo .env.example para .env:
```bash
cp .env .env
```

Exemplo de configuração do .env:
```env
# Application
PORT=3000
NODE_ENV=development
URL_PREFIX=http://localhost:3000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=url_shortener

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h
```

### 3. Iniciar o ambiente

#### Desenvolvimento com Docker
```bash
# Criar a rede Docker
docker network create url-shortener-network

# Iniciar a aplicação
docker-compose up -d

# Iniciar monitoramento (opcional)
docker-compose -f docker-compose.monitoring.yml up -d
```

#### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Executar migrações
npm run migration:run

# Iniciar em modo desenvolvimento
npm run start:dev
```

## Acessando a Aplicação

### API e Documentação
- API: http://localhost:3000/api
- Swagger Documentation: http://localhost:3000/api/docs

### Monitoramento
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
  - Usuário: admin
  - Senha: admin

## Endpoints Principais

### Autenticação
- POST /api/auth/register - Registro de usuário
- POST /api/auth/login - Login de usuário

### URLs
- POST /api/urls - Criar URL curta (público)
- POST /api/urls/auth - Criar URL curta (autenticado)
- GET /api/urls/my-urls - Listar URLs do usuário
- GET /api/:shortCode - Redirecionar para URL original
- PUT /api/urls/:id - Atualizar URL
- DELETE /api/urls/:id - Deletar URL

### Health Check e Métricas
- GET /api/health - Status da aplicação
- GET /api/health/metrics - Métricas do Prometheus

## Monitoramento e Observabilidade

### Prometheus
- Coleta métricas da aplicação
- Métricas personalizadas incluem:
  - Contagem total de requisições
  - Duração das requisições
  - Status das requisições
  - Métricas do banco de dados

### Grafana
- Dashboards pré-configurados para:
  - Performance da API
  - Métricas de URLs
  - Métricas de usuários
  - Status do sistema

### Logs
- Logs de desenvolvimento: Console
- Logs de produção: Arquivos em /logs
  - error.log: Apenas erros
  - combined.log: Todos os logs

## API Gateway (KrakenD)

O projeto utiliza KrakenD como API Gateway, proporcionando:
- Rate limiting
- Caching
- CORS
- Métricas
- Logging
- Validação de JWT

### Endpoints do Gateway
Todos os endpoints da API são acessíveis através do gateway na porta 8080:
- API Gateway: http://localhost:8080
- Métricas do Gateway: http://localhost:8090

### Configuração
A configuração do KrakenD está localizada em `gateway/krakend/krakend.json`

### Recursos do Gateway
- Cache de respostas (TTL: 1 hora)
- Timeout global de 3 segundos
- CORS configurado para desenvolvimento
- Métricas expostas na porta 8090
- Logs formatados
- Validação de JWT para rotas autenticadas

## Testes
```bash
# Executar testes unitários
npm run test

# Executar testes com coverage
npm run test:cov

# Executar testes e2e
npm run test:e2e
```

## Comandos Docker Úteis
```bash
# Parar todos os serviços
docker-compose down
docker-compose -f docker-compose.monitoring.yml down

# Ver logs
docker-compose logs -f api

# Reiniciar serviço específico
docker-compose restart api

# Limpar volumes
docker-compose down -v
```

## Estrutura do Projeto
```
url-shortener-nestjs/
├── docker/
│   ├── development/
│   │   └── Dockerfile
│   └── production/
│       └── Dockerfile
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│       └── provisioning/
├── src/
│   ├── core/
│   │   ├── application/
│   │   ├── domain/
│   │   └── shared/
│   ├── infrastructure/
│   │   ├── config/
│   │   ├── database/
│   │   └── modules/
│   └── main.ts
├── test/
├── docker-compose.yml
├── docker-compose.monitoring.yml
└── README.md
```

## Contribuindo
1. Faça o fork do projeto
2. Crie sua feature branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## Pontos de Melhoria
 ### Como o projeto ainda não está como deveria, pretendo acrescentar os seguintes tópicos nos próximos dias
- Implementar cache com Redis
- Adicionar rate limiting
- Implementar sistema de filas
- Melhorar cobertura de testes
- Adicionar mais métricas e dashboards
- Implementar CI/CD
