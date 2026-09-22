# Purchasing API MCP Server

This is a Model Context Protocol (MCP) server that provides Claude with tools to explore and understand the purchasing-api-ts codebase.

## Overview

The MCP server exposes the following capabilities:

- **List Codebase Structure**: Get an overview of controllers, models, routes, middleware, and utilities
- **List Directory**: Browse the contents of any directory in the project
- **Read File**: View the contents of source files (with automatic truncation for large files)
- **Get Models Info**: Explore available data models and their definitions
- **Get Controllers Info**: View controller functions and their exports
- **Get Routes Info**: Understand API routes and HTTP methods

## Setup

### Installation

```bash
cd mcp-server
npm install
```

### Build

```bash
npm run build
```

### Development

For development with hot reloading:

```bash
npm run dev
```

### Production

To run the compiled server:

```bash
npm start
```

## Configuration

To use this MCP server with Claude, add it to your Claude Code settings in `.claude/settings.json`:

```json
{
  "mcpServers": {
    "purchasing-api": {
      "command": "node",
      "args": ["path/to/mcp-server/dist/server.js"]
    }
  }
}
```

Or if using TypeScript directly:

```json
{
  "mcpServers": {
    "purchasing-api": {
      "command": "npx",
      "args": ["tsx", "path/to/mcp-server/src/server.ts"]
    }
  }
}
```

## Available Tools

### list_codebase_structure

Returns an overview of the codebase structure with counts of files in each category.

**Example usage:**
```
Can you give me an overview of the codebase structure?
```

### list_directory

Lists the contents of a directory in the project.

**Parameters:**
- `path` (required): Directory path relative to project root (e.g., "src/controllers")
- `limit` (optional): Maximum number of items to return (default: 50)

**Example usage:**
```
What files are in the src/controllers directory?
```

### read_file

Reads and displays the contents of a source file. Large files are automatically truncated to 200 lines.

**Parameters:**
- `path` (required): File path relative to project root (e.g., "src/controllers/requests.ts")

**Example usage:**
```
Show me the requests controller
```

### get_models_info

Provides information about available data models in the application.

**Parameters:**
- `modelName` (optional): Specific model name to get details about

**Example usage:**
```
What models are available in this application?
```

### get_controllers_info

Lists all controllers and their exported functions.

**Example usage:**
```
What controllers are available and what functions do they export?
```

### get_routes_info

Provides information about API routes and their HTTP methods.

**Example usage:**
```
What API routes are available?
```

## Architecture Reference

This MCP server uses the eng-api-ts repository as a reference for understanding the codebase patterns. Both apis follow similar architectural principles:

- **Controllers**: Implement business logic with async error handling
- **Models**: Sequelize ORM models with associations
- **Routes**: Express routers organized by resource
- **Middleware**: Authentication, error handling, security
- **Utilities**: Helper functions and shared logic

## Development

The server is built with:
- Node.js with TypeScript
- @modelcontextprotocol/sdk for MCP protocol
- Standard Node.js file system APIs for codebase exploration

To extend the server with new tools, add them to the `tools` array in `src/server.ts` and handle them in the `CallToolRequestSchema` request handler.
