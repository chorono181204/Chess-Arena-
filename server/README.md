# NestJS Prisma Boilerplate

A modern, production-ready boilerplate for building scalable NestJS applications with Prisma ORM, following industry-standard design patterns and best practices.

## Features

- **NestJS** - Progressive Node.js framework for building efficient and scalable server-side applications
- **Prisma ORM** - Next-generation ORM for Node.js and TypeScript
- **PostgreSQL** - Powerful, open-source relational database system
- **Swagger Documentation** - API documentation with OpenAPI specification
- **Request Validation** - Input validation using class-validator and class-transformer
- **Repository Pattern** - Separation of data access logic
- **Dependency Injection** - Built-in NestJS DI system
- **Error Handling** - Global exception filters for consistent error responses
- **Environment Configuration** - Using @nestjs/config for flexible environment configuration
- **CORS Support** - Cross-Origin Resource Sharing enabled
- **API Response Transformation** - Consistent API response format
- **Testing Setup** - Jest setup for unit and e2e testing
- **Authentication** - JWT and Basic authentication strategies
- **Authorization** - Role-based access control with CASL
- **Caching** - Redis-based caching system for improved performance
- **Logging** - Advanced logging with Winston
- **Response Decorators** - Custom decorators for standardized API responses
- **Health Checks** - Endpoint monitoring with @nestjs/terminus
- **AWS S3 Integration** - File storage capabilities
- **Pagination** - Efficient data pagination with @nodeteam/nestjs-prisma-pagination

## Project Structure

```
nestjs-prisma-boilerplate/
├── prisma/                    # Prisma configuration and migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── common/                # Shared utilities, constants, filters, guards, etc.
│   │   ├── constants/
│   │   ├── decorators/        # Custom decorators including response decorators
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/                # Configuration modules
│   │   ├── app.config.ts
│   │   ├── auth.config.ts
│   │   ├── redis.config.ts
│   │   └── logger.config.ts
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication module
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   ├── strategies/    # JWT and Basic auth strategies
│   │   │   └── auth.service.ts
│   │   ├── casl/              # CASL authorization module
│   │   │   ├── abilities/
│   │   │   ├── decorators/
│   │   │   └── guards/
│   │   ├── health/            # Health check module
│   │   ├── cache/             # Redis cache module
│   │   ├── logger/            # Winston logger module
│   │   └── users/             # Example feature module
│   │       ├── dto/           # Data Transfer Objects
│   │       ├── entities/      # Entity definitions
│   │       ├── repositories/  # Repository pattern implementation
│   │       ├── services/      # Business logic
│   │       ├── controllers/   # HTTP endpoints
│   │       └── users.module.ts
│   ├── prisma/                # Prisma service module
│   │   └── prisma.service.ts
│   ├── app.module.ts          # Root application module
│   └── main.ts                # Application entry point
├── test/                      # Test files
│   ├── e2e/
│   └── jest/
├── .env                       # Environment variables
├── .env.example               # Example environment variables
├── ecosystem.config.js        # PM2 deployment configuration
└── other config files...
```

## Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL database
- Redis server (for caching)
- AWS S3 account (optional, for file storage)

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/IsnuMdr/nestjs-prisma-boilerplate.git
cd nestjs-prisma-boilerplate
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file with your database connection details and other configuration.

### Database Setup

1. Create a PostgreSQL database:

```bash
createdb nestjs_prisma_boilerplate
```

2. Generate Prisma client:

```bash
npm run db:generate
# or
yarn db:generate
```

3. Run database migrations (if you have migration files):

```bash
npx prisma migrate dev
```

4. Seed the database with initial data (if you have a seed script):

```bash
npx prisma db seed
```

### Running the Application

Start the application in development mode:

```bash
npm run start:dev
# or
yarn start:dev
```

For production deployment with PM2:

```bash
npm run deploy
# or
yarn deploy
```

The API will be available at http://localhost:3000/api.
Swagger documentation will be available at http://localhost:3000/api/docs.
Health check endpoint will be available at http://localhost:3000/health.

## API Endpoints

### Authentication

- `POST /auth/login` - User login with JWT token response
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get current user profile

### Users

- `POST /users` - Create a new user
- `GET /users` - Get all users with pagination
- `GET /users/:id` - Get a user by ID
- `PATCH /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

### Health Check

- `GET /health` - Application health status check

Additional endpoint documentation is available through Swagger at `/api/docs`.

## Development

### Generate Prisma Client

After changing the Prisma schema, generate the Prisma client:

```bash
npm run db:generate
# or
yarn db:generate
```

### Database Migrations

Create a new migration:

```bash
npx prisma migrate dev --name migration_name
```

### Prisma Studio

Open Prisma Studio to explore your database:

```bash
npx prisma studio
```

### Authentication and Authorization

This boilerplate uses JWT for authentication and CASL for authorization:

1. JWT Authentication:

   - Configurable token expiry and secret in environment variables
   - Refresh token functionality
   - Role-based JWT claims

2. CASL Authorization:
   - Define permissions based on user roles
   - Protect routes with permission guards
   - Use `@CheckAbilities` decorator to verify permissions

### Redis Caching

The boilerplate includes a Redis-based caching system:

- Cache service for storing and retrieving data
- Cache interceptors for automatic response caching
- Configurable TTL (Time To Live) for cached items
- Cache invalidation strategies

### Logging

Advanced logging is configured with Winston:

- Log rotation with winston-daily-rotate-file
- Different log levels based on environment
- External logging integrations with Papertrail and Slack
- Request context-aware logging

## Testing

### Running Tests

Run unit tests:

```bash
npm run test
# or
yarn test
```

Run e2e tests:

```bash
npm run test:e2e
# or
yarn test:e2e
```

Run tests with coverage:

```bash
npm run test:cov
# or
yarn test:cov
```

## Building for Production

1. Build the application:

```bash
npm run build
# or
yarn build
```

2. Start the production server:

```bash
npm run start:prod
# or
yarn start:prod
```

## Design Patterns

This boilerplate follows these key design patterns:

1. **Repository Pattern**: The data access logic is separated from business logic through repositories.
2. **Dependency Injection**: NestJS's built-in DI container is used for managing dependencies.
3. **Module Pattern**: Code is organized into feature modules.
4. **DTO Pattern**: Data Transfer Objects validate incoming data.
5. **Entity Pattern**: Entities represent domain models and control data transformation.
6. **Decorator Pattern**: Custom decorators for response formatting and permission checks.
7. **Strategy Pattern**: Used in authentication with different strategies (JWT, Basic).
8. **Middleware Pattern**: Request processing pipelines for logging, authentication, etc.
9. **Proxy Pattern**: Caching layer implemented as a proxy.
10. **Observer Pattern**: Event-based communication between modules when applicable.

## Adding New Features

To add a new feature module:

1. Create a new directory in the `src/modules` folder
2. Define entities, DTOs, controllers, services, and repositories
3. Create a module file that imports and exports your components
4. Import your module in the `app.module.ts` file
5. Define CASL abilities for the new resources
6. Set up appropriate caching strategies
7. Add appropriate logging

### Using Response Decorators

The boilerplate includes custom response decorators for standardized API responses:

```typescript
@Controller('examples')
export class ExampleController {
  @Get()
  @ApiResponseSuccess({ type: ExampleResponseDto, isArray: true })
  @ApiResponseError([404, 403])
  @ResponseApi({ paginated: true })
  async findAll() {
    // Your implementation here
  }
}
```

### Setting Up Permissions with CASL

Define abilities for your feature:

```typescript
import { AbilityBuilder, Ability } from '@casl/ability';
import { Action } from '../enums/action.enum';
import { User, Resource } from '../interfaces';

export function defineAbilitiesFor(user: User) {
  const { can, cannot, build } = new AbilityBuilder(Ability);

  if (user.role === 'admin') {
    can(Action.Manage, 'all');
  } else {
    can(Action.Read, 'YourResource');
    cannot(Action.Create, 'YourResource').because(
      'Only admins can create resources',
    );
  }

  return build();
}
```

Then use in your controllers:

```typescript
@CheckAbilities({ action: Action.Create, subject: 'YourResource' })
@Post()
create(@Body() createDto: CreateDto) {
  // Method only accessible if user has appropriate permissions
}
```

## Additional Features

### File Uploads with AWS S3

The boilerplate includes integration with AWS S3 for file storage:

```typescript
// Example usage in a service
async uploadFile(file: Express.Multer.File) {
  return this.s3Service.uploadFile(file.buffer, file.originalname);
}
```

### Health Checks

The application includes health check endpoints using @nestjs/terminus:

- Database connection health
- Redis connection health
- Overall application health status

### PM2 Deployment

Easy deployment using PM2 with the included ecosystem.config.js:

```bash
npm run deploy
```

## Environment Variables

Key environment variables to configure:

```
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/db_name

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS S3
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Logging
LOG_LEVEL=info
PAPERTRAIL_HOST=logs.papertrailapp.com
PAPERTRAIL_PORT=12345
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
