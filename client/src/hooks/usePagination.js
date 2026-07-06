import { useState, useCallback, useMemo } from 'react';

export default function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / initialLimit)),
    [totalItems, initialLimit]
  );

  const canNext = page < totalPages;
  const canPrev = page > 1;

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  return {
    page,
    totalPages,
    totalItems,
    setPage,
    setTotalItems,
    nextPage,
    prevPage,
    canNext,
    canPrev,
    limit: initialLimit,
  };
}
