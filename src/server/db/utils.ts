export function handleSuccess() {
  return { success: true as const, data: null };
}

export function handleError(error: unknown) {
  console.error(error);

  return {
    success: false as const,
    error: error instanceof Error ? error.message : "Something went wrong!",
  };
}
