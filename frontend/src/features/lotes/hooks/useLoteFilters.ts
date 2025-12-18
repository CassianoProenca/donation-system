import { useState } from "react";
import type { LoteFilters } from "../types";

export const useLoteFilters = () => {
  const [filters, setFilters] = useState<LoteFilters>({});
  const [tempFilters, setTempFilters] = useState<LoteFilters>({});

  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const resetFilters = () => {
    setTempFilters({});
    setFilters({});
  };

  const clearFilter = (key: keyof LoteFilters) => {
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
