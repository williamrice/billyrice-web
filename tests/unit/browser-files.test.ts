import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadTextFile } from "../../lib/utils/browser-files";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("browser file downloads", () => {
  it("attaches the link and delays object URL cleanup until after the click", () => {
    vi.useFakeTimers();
    const click = vi.fn();
    const remove = vi.fn();
    const link = { href: "", download: "", hidden: false, click, remove };
    const appendChild = vi.fn();
    vi.stubGlobal("document", {
      createElement: vi.fn(() => link),
      body: { appendChild },
    });
    vi.stubGlobal("window", { setTimeout });
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:diagram");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

    downloadTextFile("flowchart LR\nA-->B", "diagram.mmd", "text/plain");

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(appendChild).toHaveBeenCalledWith(link);
    expect(appendChild.mock.invocationCallOrder[0]).toBeLessThan(click.mock.invocationCallOrder[0]);
    expect(link).toMatchObject({ href: "blob:diagram", download: "diagram.mmd", hidden: true });
    expect(click).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledOnce();
    expect(revokeObjectURL).not.toHaveBeenCalled();

    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:diagram");
  });
});
