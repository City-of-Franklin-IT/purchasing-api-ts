#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  TextContent,
  Tool,
} from '@modelcontextprotocol/sdk/types.js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '../../')

interface CodebaseInfo {
  controllers: string[]
  models: string[]
  routes: string[]
  middleware: string[]
  utilities: string[]
}

// Utility functions to explore codebase
function getCodebaseStructure(): CodebaseInfo {
  const srcDir = path.join(PROJECT_ROOT, 'src')

  const readDirRecursive = (dir: string): string[] => {
    if (!fs.existsSync(dir)) return []
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const files: string[] = []

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.ts')) {
        files.push(entry.name)
      } else if (entry.isDirectory()) {
        files.push(...readDirRecursive(path.join(dir, entry.name)))
      }
    }
    return files
  }

  return {
    controllers: readDirRecursive(path.join(srcDir, 'controllers')),
    models: readDirRecursive(path.join(srcDir, 'models')),
    routes: readDirRecursive(path.join(srcDir, 'routes')),
    middleware: readDirRecursive(path.join(srcDir, 'middleware')),
    utilities: readDirRecursive(path.join(srcDir, 'utils')),
  }
}

function listDirectory(dir: string, limit: number = 50): string {
  const fullPath = path.join(PROJECT_ROOT, dir)

  if (!fs.existsSync(fullPath)) {
    return `Directory not found: ${dir}`
  }

  const entries = fs.readdirSync(fullPath, { withFileTypes: true })
  const lines: string[] = []
  let count = 0

  for (const entry of entries) {
    if (count >= limit) break
    const type = entry.isDirectory() ? '📁' : '📄'
    lines.push(`${type} ${entry.name}`)
    count++
  }

  if (count < entries.length) {
    lines.push(`... and ${entries.length - count} more items`)
  }

  return lines.join('\n')
}

function readSourceFile(filePath: string): string {
  const fullPath = path.join(PROJECT_ROOT, filePath)

  if (!fs.existsSync(fullPath)) {
    return `File not found: ${filePath}`
  }

  if (!fullPath.startsWith(PROJECT_ROOT)) {
    return 'Access denied: Path outside project root'
  }

  const content = fs.readFileSync(fullPath, 'utf-8')
  const lines = content.split('\n')

  if (lines.length > 200) {
    return lines.slice(0, 200).join('\n') + `\n\n... file continues (${lines.length} total lines)`
  }

  return content
}

function getModelInfo(modelName: string): string {
  const modelsDir = path.join(PROJECT_ROOT, 'src', 'models')

  if (!fs.existsSync(modelsDir)) {
    return 'Models directory not found'
  }

  const files = fs.readdirSync(modelsDir)
  const modelFiles = files
    .filter(f => f.endsWith('.ts') || fs.statSync(path.join(modelsDir, f)).isDirectory())

  return `Available models:\n${modelFiles.map(f => `- ${f}`).join('\n')}`
}

function getControllerInfo(): string {
  const controllersDir = path.join(PROJECT_ROOT, 'src', 'controllers')

  if (!fs.existsSync(controllersDir)) {
    return 'Controllers directory not found'
  }

  const files = fs.readdirSync(controllersDir)
  const controllerFiles = files.filter(f => f.endsWith('.ts'))

  const info: string[] = ['Available Controllers:']
  for (const file of controllerFiles) {
    const filePath = path.join(controllersDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')

    // Extract exported functions
    const functionMatches = content.match(/export\s+(?:const|function)\s+(\w+)/g) || []
    const functions = functionMatches.map(m => m.replace(/export\s+(?:const|function)\s+/, ''))

    info.push(`\n${file}:`)
    if (functions.length > 0) {
      info.push(`  Exports: ${functions.join(', ')}`)
    }
  }

  return info.join('\n')
}

function getRouteInfo(): string {
  const routesDir = path.join(PROJECT_ROOT, 'src', 'routes')

  if (!fs.existsSync(routesDir)) {
    return 'Routes directory not found'
  }

  const files = fs.readdirSync(routesDir)
  const routeFiles = files.filter(f => f.endsWith('.ts'))

  const info: string[] = ['Available Routes:']
  for (const file of routeFiles) {
    const filePath = path.join(routesDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')

    // Extract router methods
    const methods = new Set<string>()
    const methodMatches = content.match(/router\.(get|post|put|patch|delete|options)/g) || []
    methodMatches.forEach(m => {
      const method = m.replace('router.', '').toUpperCase()
      methods.add(method)
    })

    info.push(`\n${file}:`)
    if (methods.size > 0) {
      info.push(`  Methods: ${Array.from(methods).join(', ')}`)
    }
  }

  return info.join('\n')
}

// Create server
const server = new Server(
  {
    name: 'purchasing-api-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
)

// Tools
const tools: Tool[] = [
  {
    name: 'list_codebase_structure',
    description: 'List the structure of the codebase (controllers, models, routes, middleware, utilities)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_directory',
    description: 'List contents of a directory in the codebase',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Directory path relative to project root (e.g., "src/controllers")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of items to return (default: 50)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'read_file',
    description: 'Read the contents of a source file',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'File path relative to project root (e.g., "src/controllers/requests.ts")',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'get_models_info',
    description: 'Get information about available data models',
    inputSchema: {
      type: 'object',
      properties: {
        modelName: {
          type: 'string',
          description: 'Optional: specific model name to get details about',
        },
      },
    },
  },
  {
    name: 'get_controllers_info',
    description: 'Get information about available controllers and their exported functions',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_routes_info',
    description: 'Get information about API routes and HTTP methods',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
]

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    let result: string

    switch (name) {
      case 'list_codebase_structure': {
        const structure = getCodebaseStructure()
        result = `Codebase Structure:\n\nControllers (${structure.controllers.length}):\n${structure.controllers.slice(0, 10).join('\n')}${structure.controllers.length > 10 ? `\n... and ${structure.controllers.length - 10} more` : ''}\n\nModels (${structure.models.length}):\n${structure.models.slice(0, 10).join('\n')}${structure.models.length > 10 ? `\n... and ${structure.models.length - 10} more` : ''}\n\nRoutes (${structure.routes.length}):\n${structure.routes.slice(0, 10).join('\n')}${structure.routes.length > 10 ? `\n... and ${structure.routes.length - 10} more` : ''}\n\nMiddleware (${structure.middleware.length}):\n${structure.middleware.join('\n')}\n\nUtilities (${structure.utilities.length}):\n${structure.utilities.join('\n')}`
        break
      }

      case 'list_directory': {
        const dirPath = (args as { path: string; limit?: number }).path
        const limit = (args as { path: string; limit?: number }).limit || 50
        result = listDirectory(dirPath, limit)
        break
      }

      case 'read_file': {
        const filePath = (args as { path: string }).path
        result = readSourceFile(filePath)
        break
      }

      case 'get_models_info': {
        const modelName = (args as { modelName?: string }).modelName
        result = getModelInfo(modelName || '')
        break
      }

      case 'get_controllers_info': {
        result = getControllerInfo()
        break
      }

      case 'get_routes_info': {
        result = getRouteInfo()
        break
      }

      default:
        result = `Unknown tool: ${name}`
    }

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(console.error)
