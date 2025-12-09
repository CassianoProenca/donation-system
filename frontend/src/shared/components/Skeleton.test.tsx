import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonDashboard } from "./Skeleton";

describe("Skeleton Components", () => {
  it("deve renderizar Skeleton básico", () => {
    const { container } = render(<Skeleton className="h-4 w-full" />);
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("deve renderizar SkeletonCard", () => {
    const { container } = render(<SkeletonCard />);
    const card = container.querySelector(".rounded-lg");
    expect(card).toBeInTheDocument();
  });

  it("deve renderizar SkeletonTable com número de linhas customizado", () => {
    const { container } = render(<SkeletonTable rows={10} />);
    const rows = container.querySelectorAll(".space-y-3 > div");
    expect(rows.length).toBe(11); // 1 header + 10 rows
  });

  it("deve renderizar SkeletonDashboard", () => {
    const { container } = render(<SkeletonDashboard />);
    const dashboard = container.querySelector(".space-y-6");
    expect(dashboard).toBeInTheDocument();
  });
});

