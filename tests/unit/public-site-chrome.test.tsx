import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PublicSiteChrome from "../../components/PublicSiteChrome";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));

vi.mock("next/navigation", () => ({ usePathname }));

describe("public site chrome", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(["/admin", "/admin/resume", "/admin/project-manager/edit/1"])(
    "hides public navigation and footer on %s",
    (pathname) => {
      usePathname.mockReturnValue(pathname);
      expect(renderToStaticMarkup(
        <PublicSiteChrome><nav>Navigation</nav><footer>Footer</footer></PublicSiteChrome>,
      )).toBe("");
    },
  );

  it.each(["/", "/resume", "/tools/mermaid", "/administrator"])(
    "preserves public navigation and footer on %s",
    (pathname) => {
      usePathname.mockReturnValue(pathname);
      expect(renderToStaticMarkup(
        <PublicSiteChrome><nav>Navigation</nav><footer>Footer</footer></PublicSiteChrome>,
      )).toBe("<nav>Navigation</nav><footer>Footer</footer>");
    },
  );
});
