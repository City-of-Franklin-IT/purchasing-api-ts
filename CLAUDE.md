# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Build**: `npm run build` - Compiles TypeScript and resolves path aliases using tsc-alias
- **Development**: `npm run dev` - Runs with nodemon and tsconfig-paths for hot reloading
- **Production**: `npm run start` - Runs compiled code from dist/
- **Deploy**: `npm run deploy` - Syncs dist to server and restarts PM2 process

## Architecture

This is an Express REST API for a purchasing application using TypeScript. It connects to MSSQL via Sequelize and uses Microsoft Entra for authentication.

### Project Structure

```
src/
├── app.ts              # Express app entry point, middleware setup
├── config/             # Database configuration (MSSQL via Sequelize)
├── controllers/        # Route handlers with async error handling
├── middleware/         # Auth (Entra), error handling, rate limiting, CSP, input sanitation
├── models/             # Sequelize models with associations
├── routes/             # Express routers (one per resource)
└── utils/              # LDAP, email, image/PDF processing, status calculations
```

### Path Aliases

TypeScript path aliases are configured in tsconfig.json and resolved at runtime via tsconfig-paths (dev) and tsc-alias (build):
- `@config` → `src/config/*`
- `@controllers/*` → `src/controllers/*`
- `@middleware/*` → `src/middleware/*`
- `@models/*` → `src/models/*`
- `@routes/*` → `src/routes/*`
- `@utils/*` → `src/utils/*`

### Key Patterns

- **Controller pattern**: Controllers use `asyncHandler` wrapper for async error handling and call `ErrorResponse` with message/status code to trigger error middleware
- **Model associations**: Models define relationships in static `associate()` methods, called during initialization in `models/index.ts`
- **Editor tracking**: Use `editorTracking(req)` utility to spread createdBy/updatedBy fields from authenticated user
- **Route structure**: Each route file creates a Router, applies auth middleware, and exports the router. Routes are mounted via `routes/index.ts` with a base URL prefix.

### Authentication

The `entra` middleware validates tokens against an external Entra service. In development, it bypasses authentication with a test user. The authenticated user data is available at `req.entra` (production) or `req.user` (development).

### Environment

Configuration is loaded from `src/config/config.env` via dotenv. Required variables include database credentials (DB_*), HOST, PORT, NODE_ENV, BASE_URL, and ENTRA_URL.

## Standards & Auditing

When auditing or reviewing code in this project, follow the guides and templates at `/opt/claude-standards/`:

- `/opt/claude-standards/README_TEMPLATE.md` - Template for creating/updating README.md files
- `/opt/claude-standards/TYPESCRIPT_STYLE.md` - TypeScript style conventions
- `/opt/claude-standards/IMPORT_ORGANIZATION.md` - Import ordering and organization
- `/opt/claude-standards/VERSION_CONTROL.md` - Git and version control practices
