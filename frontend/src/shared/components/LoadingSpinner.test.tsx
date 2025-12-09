import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  it("deve renderizar spinner", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-label", "Carregando");
  });

  it("deve aplicar tamanho pequeno", () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector(".h-4");
    expect(spinner).toBeInTheDocument();
  });

  it("deve aplicar tamanho médio por padrão", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".h-8");
    expect(spinner).toBeInTheDocument();
  });

  it("deve aplicar tamanho grande", () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector(".h-12");
    expect(spinner).toBeInTheDocument();
  });

  it("deve aplicar className customizada", () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const spinner = container.querySelector(".custom-class");
    expect(spinner).toBeInTheDocument();
  });
});

