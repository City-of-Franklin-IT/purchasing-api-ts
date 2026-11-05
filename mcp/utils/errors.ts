// tedious batches multiple SQL errors (e.g. several invalid-column errors in one query) into
// a single AggregateError, whose own .message is empty even though it IS an Error instance —
// `error instanceof Error ? error.message : String(error)` silently returns "" for these.
// This unwraps the real per-error messages instead. Use this in every tool catch block.
export const describeError = (error: unknown): string => {
  // Duck-typed rather than `instanceof AggregateError` — this project's TS lib target
  // (ES2020) predates the AggregateError type, though the Node runtime supports it.
  if (error && typeof error === "object" && Array.isArray((error as { errors?: unknown }).errors)) {
    const errors = (error as { errors: unknown[] }).errors
    return errors.map((e) => (e instanceof Error ? e.message : String(e))).join("; ")
  }
  if (error instanceof Error) {
    return error.message || error.toString()
  }
  return String(error)
}
