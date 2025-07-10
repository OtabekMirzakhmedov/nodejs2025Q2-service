# Home Library Service - Local Testing

## Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd nodejs2025Q2-service
   npm install
   ```

2. **Set up environment**
   ```env
   PORT=4000
   DB_PASSWORD=Pa$$word
   DATABASE_URL="postgresql://postgres:Pa$$word@localhost:5432/home_library?schema=public"
   JWT_SECRET_KEY=your_super_secret_key_here
   JWT_SECRET_REFRESH_KEY=your_super_secret_refresh_key_here
   TOKEN_EXPIRE_TIME=1h
   TOKEN_REFRESH_EXPIRE_TIME=24h
   CRYPT_SALT=10
   LOG_LEVEL=debug
   LOG_MAX_FILE_SIZE=1000k
   LOG_MAX_FILES=10d
   ```

3. **Run database migrations**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start the application**
   ```bash
   npm run start:dev
   ```

## Testing Authentication

```bash
# 1. Signup
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"login": "testuser", "password": "testpass"}'

# 2. Login (get tokens)
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "testuser", "password": "testpass"}'

# 3. Use protected route (use accessToken from login)
curl -X GET http://localhost:4000/user \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Refresh token
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

## Testing Logging

- **Check console logs** while making API calls
- **Check log files** in `logs/` folder:
   - `logs/application-YYYY-MM-DD.log` - All logs
   - `logs/error-YYYY-MM-DD.log` - Error logs only

## Run Tests

```bash
# All tests
npm test

# Auth tests  
npm run test:auth

# Refresh token tests
npm run test:refresh
```

## Features Implemented

- ✅ **Authentication** - JWT with access/refresh tokens
- ✅ **Database** - PostgreSQL with Prisma ORM
- ✅ **Logging** - File rotation, multiple levels, error tracking
- ✅ **CRUD Operations** - Users, Artists, Albums, Tracks, Favorites