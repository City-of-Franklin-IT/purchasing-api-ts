# Purchasing API

REST API for department purchasing card management and approval workflows.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Express](https://img.shields.io/badge/Express-4.21-green)
![Sequelize](https://img.shields.io/badge/Sequelize-6.37-orange)

## Overview

This API manages purchasing card transactions for city departments. It handles purchase requests, approvals, reconciliation, and integrates with Microsoft Entra for authentication and Active Directory for department lookups.

## Features

- Purchase and request management with approval workflows
- Attachment handling with image/PDF processing
- Department delegate management
- Reconciliation tracking
- Automated email notifications via LDAP lookups
- Role-based access control via Microsoft Entra

## Prerequisites

- Node.js 18+
- npm 9+
- Access to MSSQL database
- Microsoft Entra app registration

## Installation

```bash
npm install
cp src/config/config.env.example src/config/config.env
# Edit config.env with your values
```

## Configuration

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `HOST` | Server hostname |
| `PORT` | Server port |
| `BASE_URL` | API base path (e.g., `/api/v2/dept-purchasing`) |
| `DB_HOST` | MSSQL server hostname |
| `DB_DATABASE` | Database name |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `ENTRA_URL` | Microsoft Entra validation endpoint |

## Usage

```bash
# Development with hot reload
npm run dev

# Production
npm run build
npm run start
```

## Project Structure

```
src/
├── app.ts           # Express app entry point
├── config/          # Database and environment config
├── controllers/     # Request handlers
├── middleware/      # Auth, error handling, security
├── models/          # Sequelize models
├── routes/          # API route definitions
└── utils/           # LDAP, email, image processing
```

## API Routes

All routes are prefixed with `BASE_URL` (default: `/api/v2/dept-purchasing`).

| Route | Description |
|-------|-------------|
| `/purchases` | Purchase card transactions |
| `/requests` | Purchase requests and approval workflows |
| `/approvals` | Approval status management |
| `/attachments` | File uploads (receipts, invoices) |
| `/reconciliation` | Monthly reconciliation records |
| `/coding` | Account coding information |
| `/delegates` | Department delegate assignments |
| `/opiq` | OPIQ integration data |
| `/closed` | Closed/archived records |

## API Documentation

[Postman Documentation](https://documenter.getpostman.com/view/6104227/2sAYdhHV3F)

## Deployment

```bash
# Build and deploy to server
npm run build
npm run deploy
```

The deploy script syncs to the production server and restarts the PM2 process.
