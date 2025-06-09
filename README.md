# Home Library Service

A RESTful API service for managing a personal music library built with NestJS, PostgreSQL, and Docker.

## Architecture

- **NestJS App**: REST API with TypeScript
- **PostgreSQL**: Database in Docker container
- **Prisma**: ORM with automatic migrations
- **Docker**: Multi-container setup with custom networking

## Features

- CRUD operations for Users, Artists, Albums, Tracks
- Favorites system with relationships
- Automatic database setup and migrations
- Container auto-restart and persistent storage

## Prerequisites

- [Docker](https://docs.docker.com/engine/install/) (version 20.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nodejs2025Q2-service
   ```

2. **Set environment variables** (optional - defaults provided)
   ```env
   PORT=4000
   DB_PASSWORD=Pa$word
   ```

3. **Run the application**
   ```bash
   docker-compose up --build
   ```

4. **Test the API** (in another terminal window)
   ```bash
   # Health check
   curl http://localhost:4000

   # Create a user
   curl -X POST http://localhost:4000/user \
     -H "Content-Type: application/json" \
     -d '{"login": "testuser", "password": "testpass"}'

   # Get all users
   curl http://localhost:4000/user

   # Run automated tests
   docker-compose exec app npm test
   ```

That's it! Docker automatically handles PostgreSQL setup, database migrations, and networking.

## API Endpoints

- **Users**: `/user` - CRUD operations for users
- **Artists**: `/artist` - CRUD operations for artists
- **Albums**: `/album` - CRUD operations for albums
- **Tracks**: `/track` - CRUD operations for tracks
- **Favorites**: `/favs` - Add/remove favorites

See `/doc/api.yaml` for complete API documentation.

## Database Schema

The application uses the following entities:

- **Users**: User accounts with login credentials
- **Artists**: Music artists with Grammy status
- **Albums**: Music albums linked to artists
- **Tracks**: Individual songs linked to artists and albums
- **Favorites**: User favorites for artists, albums, and tracks

## Docker Configuration

### Services
- **app**: NestJS application container
- **postgres**: PostgreSQL database container

### Networks
- **home-library-network**: Custom bridge network for container communication

### Volumes
- **postgres_data**: Persistent database storage
- **postgres_logs**: Database logs storage

### Environment Variables
- `PORT`: Application port (default: 4000)
- `DB_PASSWORD`: PostgreSQL password
- `DATABASE_URL`: Complete database connection string

## Docker Commands

```bash
# Start application
docker-compose up --build

# Stop application  
docker-compose down

# View logs
docker-compose logs

# Run tests
docker-compose exec app npm test
```

## Testing with Docker

Run tests in the containerized environment:

```bash
# Run tests in the app container
docker-compose exec app npm run test

# Run specific test file
docker-compose exec app npm run test -- test/users.e2e.spec.ts

# Run with authentication tests
docker-compose exec app npm run test:auth
```

## Production Deployment

The application is fully containerized and ready for production:

```bash
# Deploy to production
docker-compose up -d

# Check container status
docker-compose ps

# Health check
curl http://localhost:4000
```

**No local PostgreSQL installation required** - everything runs in containers!

## Troubleshooting

### Port Already in Use
```bash
# Stop existing containers
docker-compose down

# Check what's using the port
netstat -tulpn | grep :4000

# Kill the process or change the port in docker-compose.yml
```

### Database Connection Issues
```bash
# Check database container logs
docker logs home-library-db

# Reset database
docker-compose down -v
docker-compose up --build
```

### Migration Issues
```bash
# Reset and rerun migrations
docker-compose exec app npx prisma migrate reset
docker-compose exec app npx prisma migrate dev
```
