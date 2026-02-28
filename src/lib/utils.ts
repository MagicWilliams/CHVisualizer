/** Extract a human-readable error message from an unknown error. */
export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}
