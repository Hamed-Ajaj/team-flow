export const parsePagination = (query: Record<string, unknown>) => {
  const page = Math.max(0, Number(query.page ?? 0) || 0);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 20) || 20));
  return { page, pageSize, offset: page * pageSize };
};
