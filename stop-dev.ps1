# Script para parar o ambiente de desenvolvimento
Write-Host "🛑 Parando ambiente de desenvolvimento..." -ForegroundColor Red

# Parar e remover containers
docker-compose -f docker-compose.dev.yml down

Write-Host "✅ Ambiente parado com sucesso!" -ForegroundColor Green