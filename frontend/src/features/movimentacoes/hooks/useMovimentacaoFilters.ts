import { useState } from "react";
import type { MovimentacaoFilters } from "../types";

export const useMovimentacaoFilters = () => {
  const [filters, setFilters] = useState<MovimentacaoFilters>({});
  const [tempFilters, setTempFilters] = useState<MovimentacaoFilters>({});

  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const resetFilters = () => {
    setTempFilters({});
    setFilters({});
  };

  const clearFilter = (key: keyof MovimentacaoFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    setTempFilters(newFilters);
  };

  return {
    filters,
    tempFilters,
    setTempFilters,
    setFilters,
    applyFilters,
    resetFilters,
    clearFilter,
  };
};
