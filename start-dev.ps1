# Script para iniciar o ambiente de desenvolvimento com Docker
Write-Host "🚀 Iniciando ambiente de desenvolvimento..." -ForegroundColor Green

# Parar containers existentes
Write-Host "📦 Parando containers existentes..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down

# Remover volumes órfãos (opcional)
Write-Host "🧹 Limpando volumes órfãos..." -ForegroundColor Yellow
docker volume prune -f

# Construir e iniciar containers
Write-Host "🔨 Construindo e iniciando containers..." -ForegroundColor Blue
docker-compose -f docker-compose.dev.yml up --build -d

# Aguardar inicialização
Write-Host "⏳ Aguardando inicialização dos serviços..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Verificar status dos containers
Write-Host "📊 Status dos containers:" -ForegroundColor Magenta
docker-compose -f docker-compose.dev.yml ps

# Mostrar logs da aplicação
Write-Host "📋 Logs da aplicação:" -ForegroundColor White
docker-compose -f docker-compose.dev.yml logs app

Write-Host "✅ Ambiente iniciado! Acesse: http://localhost:3000" -ForegroundColor Green
Write-Host "📚 Documentação da API: http://localhost:3000/api" -ForegroundColor Green
Write-Host "🔍 Health Check: http://localhost:3000/health" -ForegroundColor Green