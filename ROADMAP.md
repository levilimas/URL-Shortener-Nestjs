# Roadmap

Próximos passos do URL Shortener, em ordem aproximada de prioridade.

## Infra e observabilidade

- [ ] Atualizar os Dockerfiles para Node 20+ (o pg-boss 10 exige)
- [ ] Expor `/metrics` no formato Prometheus e ajustar o scrape em `monitoring/prometheus`
- [ ] Dashboard no Grafana com redirects por segundo, latência do `GET /:shortCode` e tamanho da fila do pg-boss

## Gateway e segurança

- [ ] Rate limiting no KrakenD para `POST /api/shorten` e para o redirect
- [ ] Validar o JWT no gateway, tirando essa checagem das rotas protegidas da API

## Performance

- [ ] Gerar o shortCode por sequência + base62, sem retry em colisão
- [ ] Particionar a tabela de analytics por mês e agregar cliques em batch
- [ ] Avaliar cache no Redis para URLs com `maxClicks`, com contador atômico

## Testes e CI

- [ ] Rodar os testes e2e no CI com Postgres e Redis em containers
- [ ] Aumentar a cobertura dos serviços de URLs e analytics

## Front-end

- [ ] Painel no [URL-Shortener-Frontend](https://github.com/levilimas/URL-Shortener-Frontend): listagem de links, analytics e QR code
