import { Connection, Request as TediousRequest, TYPES } from "tedious"

export type ServerKey = "purchasing"

interface ServerConfig {
  server: string
  database: string
  userName: string | undefined
  password: string | undefined
}

const getServerConfig = (serverKey: ServerKey): ServerConfig => {
  switch(serverKey) {
    case "purchasing":
      return {
        server: process.env.DB_HOST as string,
        database: process.env.DB_DATABASE as string,
        userName: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
      }
  }
}

const connectionPools: Record<ServerKey, Connection | null> = {
  "purchasing": null,
}

export const getConnection = async (serverKey: ServerKey = "purchasing"): Promise<Connection> => {
  const existingConnection = connectionPools[serverKey]
  if(existingConnection && !existingConnection.closed) {
    return existingConnection
  }

  const config = getServerConfig(serverKey)
  const connection = new Connection({
    server: config.server,
    authentication: {
      type: "default",
      options: {
        userName: config.userName,
        password: config.password,
      },
    },
    options: {
      database: config.database,
      encrypt: true,
      trustServerCertificate: true,
      rowCollectionOnRequestCompletion: true,
      connectTimeout: 30000,
      requestTimeout: 60000,
      useUTC: false,
    },
  })

  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if(err) {
        reject(err)
        return
      }

      // Explicitly switch to the specified database after connecting
      const useRequest = new TediousRequest(`USE [${ config.database }]`, (err) => {
        if(err) {
          reject(err)
          return
        }

        connectionPools[serverKey] = connection
        resolve(connection)
      })

      connection.execSql(useRequest)
    })
  })
}

export interface QueryResult {
  rows: any[]
  rowsAffected: number | null
}

export interface QueryParam {
  name: string
  type: (typeof TYPES)[keyof typeof TYPES]
  value: any
}

// A tedious Connection handles exactly one in-flight request at a time, and
// getConnection() caches a single Connection per server key (not a real pool of
// several physical connections) -- issuing two execSql calls on it concurrently
// (e.g. from Promise.all across tools, or two overlapping tool calls) throws
// "Requests can only be made in the LoggedIn state, not the SentClientRequest
// state". This queue serializes every executeQuery call per server key so
// callers never have to reason about that themselves.
const requestQueues: Record<ServerKey, Promise<unknown>> = {
  "purchasing": Promise.resolve(),
}

const runQuery = async (sql: string, params: QueryParam[], serverKey: ServerKey): Promise<QueryResult> => {
  const connection = await getConnection(serverKey)

  return new Promise((resolve, reject) => {
    const rows: any[] = []
    let rowsAffected: number | null = null

    const request = new TediousRequest(sql, (err) => {
      if(err) {
        reject(err)
      } else resolve({ rows, rowsAffected })
    })

    params.forEach((param) => {
      request.addParameter(param.name, param.type, param.value)
    })

    request.on("row", (columns) => {
      const row: Record<string, any> = {}
      columns.forEach((col: { metadata: { colName: string | number }; value: any }) => {
        row[col.metadata.colName] = col.value
      })
      rows.push(row)
    })

    // Capture rows affected for INSERT/UPDATE/DELETE statements
    request.on("doneInProc", (rowCount) => {
      if(rowCount !== undefined && rowCount !== null) {
        rowsAffected = rowCount
      }
    })

    connection.execSql(request)
  })
}

// The claude schema's views are the only thing this connection ever queries (see
// mcp's README / the claude DB login's grants) — parameters are always
// bound via tedious's addParameter, never string-interpolated into `sql`.
export const executeQuery = (sql: string, params: QueryParam[] = [], serverKey: ServerKey = "purchasing"): Promise<QueryResult> => {
  const run = () => runQuery(sql, params, serverKey)
  // Chain onto the queue regardless of whether the previous query succeeded or
  // failed, so one failed query doesn't wedge every query after it -- but return
  // this call's own result/rejection to its caller, not whatever the queue tail is.
  const result = requestQueues[serverKey].then(run, run)
  requestQueues[serverKey] = result.catch(() => undefined)
  return result
}

export const closeConnection = async (serverKey: ServerKey): Promise<void> => {
  return new Promise((resolve) => {
    const connection = connectionPools[serverKey]
    if(connection && !connection.closed) {
      connection.close()
      connectionPools[serverKey] = null
    }

    resolve()
  })
}

export const closeAllConnections = async (): Promise<void> => {
  return new Promise((resolve) => {
    const keys: ServerKey[] = ["purchasing"]
    keys.forEach((key) => {
      const connection = connectionPools[key]
      if(connection && !connection.closed) {
        connection.close()
        connectionPools[key] = null
      }
    })

    resolve()
  })
}
