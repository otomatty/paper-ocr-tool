/**
 * Logo Component Tests
 *
 * Testing the PaperScan logo component based on Logo.spec.md
 */

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { render } from "../../../test-utils";
import { Logo } from "./Logo";

describe("Logo Component", () => {
  describe("TC-001: デフォルトレンダリング", () => {
    it("should render the logo with default props", () => {
      const { container } = render(<Logo />);

      // SVGアイコンが表示される
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();

      // "PaperScan"テキストが表示される
      expect(screen.getByText("PaperScan")).toBeTruthy();

      // デフォルトサイズ（120px）で表示される
      const logoContainer = container.firstChild as HTMLElement;
      expect(logoContainer.style.width).toBe("120px");
    });
  });

  describe("TC-002: アイコンのみ表示", () => {
    it("should render only the icon without text when showText is false", () => {
      render(<Logo showText={false} />);

      // SVGアイコンが表示される
      const svg = screen.getByRole("img", { name: /paperscan logo/i });
      expect(svg).toBeTruthy();

      // テキストが表示されない
      expect(screen.queryByText("PaperScan")).toBeNull();
    });
  });

  describe("TC-003: カスタムサイズ", () => {
    it("should render with custom size", () => {
      const { container } = render(<Logo size={60} />);

      // 幅60pxで表示される
      const logoContainer = container.firstChild as HTMLElement;
      expect(logoContainer.style.width).toBe("60px");

      // SVGのサイズも調整される（60 * 0.3 = 18px）
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("width")).toBe("18");
      expect(svg?.getAttribute("height")).toBe("18");
    });

    it("should render with large size", () => {
      const { container } = render(<Logo size={200} />);

      const logoContainer = container.firstChild as HTMLElement;
      expect(logoContainer.style.width).toBe("200px");

      // SVGのサイズも調整される（200 * 0.3 = 60px）
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("width")).toBe("60");
      expect(svg?.getAttribute("height")).toBe("60");
    });
  });

  describe("TC-004: カスタムclassName", () => {
    it("should apply custom className", () => {
      const { container } = render(<Logo className="custom-class" />);

      const logoContainer = container.firstChild as HTMLElement;
      expect(logoContainer.className).toContain("custom-class");

      // デフォルトクラスも保持される
      expect(logoContainer.className).toContain("inline-flex");
      expect(logoContainer.className).toContain("items-center");
    });
  });

  describe("TC-005: アクセシビリティ", () => {
    it("should have proper accessibility attributes", () => {
      const { container } = render(<Logo />);

      const svg = container.querySelector("svg");

      // role="img"属性
      expect(svg?.getAttribute("role")).toBe("img");

      // aria-label属性
      expect(svg?.getAttribute("aria-label")).toBe("PaperScan logo");

      // title要素
      const title = svg?.querySelector("title");
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe("PaperScan");
    });
  });

  describe("Edge Cases", () => {
    it("should handle size=0 without crashing", () => {
      const { container } = render(<Logo size={0} />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should handle extremely large size", () => {
      const { container } = render(<Logo size={1000} />);

      const logoContainer = container.firstChild as HTMLElement;
      expect(logoContainer.style.width).toBe("1000px");
    });
  });

  describe("Visual Structure", () => {
    it("should contain paper path elements", () => {
      const { container } = render(<Logo />);

      const svg = container.querySelector("svg");
      const paths = svg?.querySelectorAll("path");

      // 紙のアウトライン、折り返し角などのパスが存在
      expect(paths).toHaveLength(3);
    });

    it("should contain scanning lines", () => {
      const { container } = render(<Logo />);

      const svg = container.querySelector("svg");
      const lines = svg?.querySelectorAll("line");

      // スキャンラインが存在（3本 + ビーム効果 = 4本）
      expect(lines?.length).toBeGreaterThanOrEqual(3);
    });
  });
});
