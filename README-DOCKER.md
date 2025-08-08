# 🐳 Desenvolvimento com Docker

Este guia explica como executar a aplicação URL Shortener usando Docker para desenvolvimento.

## 📋 Pré-requisitos

- Docker Desktop instalado
- PowerShell (Windows)

## 🚀 Início Rápido

### Opção 1: Usando Scripts PowerShell (Recomendado)

```powershell
# Iniciar ambiente de desenvolvimento
.\start-dev.ps1

# Parar ambiente de desenvolvimento
.\stop-dev.ps1
```

### Opção 2: Comandos Docker Compose Manuais

```bash
# Iniciar ambiente
docker-compose -f docker-compose.dev.yml up --build -d

# Parar ambiente
docker-compose -f docker-compose.dev.yml down

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f app

# Ver status dos containers
docker-compose -f docker-compose.dev.yml ps
```

## 🔧 Configuração

O ambiente de desenvolvimento inclui:

- **PostgreSQL 14**: Banco de dados principal
- **NestJS App**: Aplicação principal com hot reload
- **Volumes**: Código sincronizado para desenvolvimento

### Portas Expostas

- **3000**: Aplicação NestJS
- **5432**: PostgreSQL

### Variáveis de Ambiente

As seguintes variáveis são configuradas automaticamente:

```env
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=url_shortener
JWT_SECRET=your_jwt_secret_key_here
URL_PREFIX=http://localhost:3000
```

## 📚 Endpoints Disponíveis

- **API Base**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 🛠️ Comandos Úteis

```bash
# Reconstruir apenas a aplicação
docker-compose -f docker-compose.dev.yml build app

# Executar comandos dentro do container
docker-compose -f docker-compose.dev.yml exec app npm run test

# Acessar shell do container
docker-compose -f docker-compose.dev.yml exec app sh

# Ver logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f

# Limpar volumes (cuidado: remove dados do banco)
docker-compose -f docker-compose.dev.yml down -v
```

## 🐛 Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker-compose -f docker-compose.dev.yml logs app

# Reconstruir imagem
docker-compose -f docker-compose.dev.yml build --no-cache app
```

### Problemas de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
docker-compose -f docker-compose.dev.yml ps postgres

# Verificar logs do PostgreSQL
docker-compose -f docker-compose.dev.yml logs postgres
```

### Limpar ambiente completamente
```bash
# Parar tudo e remover volumes
docker-compose -f docker-compose.dev.yml down -v

# Remover imagens não utilizadas
docker system prune -f
```

## 📝 Notas

- O hot reload está habilitado, então mudanças no código são refletidas automaticamente
- Os dados do PostgreSQL são persistidos em um volume Docker
- O primeiro build pode demorar alguns minutos para baixar as dependências