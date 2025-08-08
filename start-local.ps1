# Script para desenvolvimento local (sem Docker)
Write-Host "Iniciando ambiente de desenvolvimento local..." -ForegroundColor Green

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Limpar dist se existir
if (Test-Path "dist") {
    Write-Host "Limpando build anterior..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force dist
}

# Compilar aplicação
Write-Host "Compilando aplicacao..." -ForegroundColor Blue
npm run build

Write-Host "Configuracao concluida!" -ForegroundColor Green
Write-Host "Para iniciar o servidor, execute: npm run start:dev" -ForegroundColor Cyan