export interface PaginationEnvelope<T> {
  data: T[]
  pagination: {
    offset: number
    limit: number
    returned: number
    total: number
    hasMore: boolean
  }
}

export const paginate = <T>(rows: T[], total: number, offset: number, limit: number): PaginationEnvelope<T> => ({
  data: rows,
  pagination: {
    offset,
    limit,
    returned: rows.length,
    total,
    hasMore: offset + rows.length < total,
  },
})
