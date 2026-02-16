import { useState } from 'react';

interface PaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

export const usePagination = ({
  initialPage = 1,
  pageSize = 20,
}: PaginationOptions = {}) => {
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const nextPage = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const reset = () => {
    setPage(initialPage);
    setHasMore(true);
  };

  return {
    page,
    pageSize,
    hasMore,
    setHasMore,
    nextPage,
    prevPage,
    reset,
  };
};
