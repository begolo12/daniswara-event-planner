import { useState, useCallback, useMemo } from 'react';

export default function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / limit)),
    [totalItems, limit]
  );

  const canNext = page < totalPages;
  const canPrev = page > 1;

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  const setLimit = useCallback((newLimit) => {
    setLimitState(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  return {
    page,
    totalPages,
    totalItems,
    setPage,
    setTotalItems,
    limit,
    setLimit,
    nextPage,
    prevPage,
    canNext,
    canPrev,
  };
}
