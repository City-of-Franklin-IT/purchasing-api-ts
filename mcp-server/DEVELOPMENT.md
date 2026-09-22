# MCP Server Development Guide

## Overview

This MCP server enables Claude to interact with the purchasing-api-ts codebase in a structured way. It was designed using eng-api-ts as a reference architecture.

## Architecture Principles

Both purchasing-api-ts and eng-api-ts follow the same architectural patterns:

### Directory Structure

```
src/
├── app.ts              # Express entry point
├── config/             # Configuration management
├── controllers/        # Business logic handlers
├── middleware/         # Express middleware
├── models/             # Sequelize ORM models
├── routes/             # API route definitions
└── utils/              # Helper utilities
```

### Key Patterns

1. **Separation of Concerns**: Controllers handle logic, routes define endpoints, models manage data
2. **Middleware Stack**: Security headers → parameter pollution → CSP → input sanitation → CORS
3. **Error Handling**: Async handlers wrap route handlers, ErrorResponse throws, global handler catches
4. **Authentication**: Entra ID (Azure AD) with development bypass
5. **Editor Tracking**: All models track createdBy/updatedBy from authenticated user

## MCP Server Tools

The server exposes six main tools:

### 1. list_codebase_structure

Returns counts and preview lists of files in each category:
- Controllers: Business logic files
- Models: Sequelize model definitions
- Routes: Express router files
- Middleware: Middleware implementations
- Utilities: Helper functions

**Use case**: Understanding the overall structure of the application

### 2. list_directory

Explores the file system within the project.

**Use case**: Finding specific files or understanding directory organization

### 3. read_file

Reads source files with automatic truncation.

**Truncation behavior**:
- Files over 200 lines show the first 200 lines + a note about the full length
- This prevents overloading Claude's context with large files
- Pair with `list_directory` to find the right file first

**Use case**: Examining controller logic, model definitions, route structures

### 4. get_models_info

Lists available Sequelize models and their metadata.

**What it shows**:
- All model files in src/models/
- Model field definitions
- Associations (if detected)

**Use case**: Understanding data structures and relationships

### 5. get_controllers_info

Analyzes controllers to show exported functions.

**What it shows**:
- Each controller file
- Exported functions (handlers, utilities)
- Route method patterns (GET, POST, etc.)

**Use case**: Finding the right controller function for a feature

### 6. get_routes_info

Shows route definitions and HTTP methods.

**What it shows**:
- Route files and their HTTP method usage
- Path patterns (though detailed paths require reading the file)

**Use case**: Understanding the API endpoint structure

## Extending the Server

### Adding a New Tool

1. Define the tool in the `tools` array:

```typescript
{
  name: 'new_tool_name',
  description: 'What this tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Parameter description',
      },
    },
    required: ['param1'],
  },
}
```

2. Add the handler in the `CallToolRequestSchema` switch:

```typescript
case 'new_tool_name': {
  const param1 = (args as { param1: string }).param1
  result = myImplementation(param1)
  break
}
```

3. Implement the helper function using Node.js fs APIs

### Best Practices

- Keep file reading safe: validate paths with `path.join()` and check they're within PROJECT_ROOT
- Handle non-existent files gracefully with meaningful error messages
- Truncate large outputs to avoid context bloat
- Use descriptive parameter names that mirror the codebase
- Test new tools by running `npm run dev` and verifying with Claude

## Common Use Cases

### Understanding a Feature

1. Use `list_codebase_structure` for overview
2. Use `get_controllers_info` to find the right controller
3. Use `read_file` to examine the controller implementation
4. Use `get_models_info` to understand the data model
5. Use `read_file` to examine the model definition
6. Use `get_routes_info` and `read_file` for the route

### Adding a New Feature

1. Examine existing controller patterns with `read_file`
2. Check model structure with `get_models_info` and `read_file`
3. Review similar routes with `read_file`
4. Follow the pattern for consistency

### Debugging Issues

1. Use `list_directory` to find relevant files
2. Use `read_file` to examine implementation
3. Cross-reference with models and routes to understand the flow

## Performance Considerations

- Directory listing is limited to 50 items by default (configurable)
- File reading truncates at 200 lines
- Structure listing caches reading all files, use sparingly
- The server runs in process with zero network overhead

## Testing

To test the MCP server:

1. Build it: `npm run build`
2. Run it: `npm start` or `npm run dev`
3. Monitor stderr for debug output
4. Verify with Claude by asking for codebase information

## Integration with Claude

Once configured in `.claude/settings.json`, Claude will automatically use these tools when:
- Exploring the codebase
- Understanding architecture
- Finding specific files
- Learning about the API structure
- Planning implementations

No additional setup is needed beyond the initial MCP server registration.
