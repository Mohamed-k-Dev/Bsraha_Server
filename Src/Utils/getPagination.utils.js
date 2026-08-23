const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export default function getPagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || DEFAULT_PAGE, 1);

  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}
