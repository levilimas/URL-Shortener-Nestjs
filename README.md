# URL Shortener Service

## Description
A URL shortener service built with NestJS that allows users to create short URLs and track their usage.

## Prerequisites
- Docker
- Docker Compose
- Node.js 18+ (for local development)

## Installation and Running

### Development
1. Clone the repository
2. Create a `.env` file based on `.env.example`
3. Run the development environment:
```bash
docker-compose up -d
```

### Production
1. Create a `.env` file with production configurations
2. Run the production environment:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## API Documentation
After starting the application, visit:
- http://localhost:3000/api/docs

## Environment Variables
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

## Features
- URL shortening
- User authentication
- Click tracking
- API documentation
- Docker support

## Running Tests
```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```