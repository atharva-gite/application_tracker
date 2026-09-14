import { describe, expect, it } from "vitest";

import { canPreviewInBrowser, documentFileResponse } from "@/lib/document-file";

describe("document preview", () => {
  it("previews PDFs in the browser", () => {
    expect(canPreviewInBrowser("application/pdf")).toBe(true);
    expect(
      canPreviewInBrowser(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ).toBe(false);
  });

  it("serves files inline for in-app viewing", () => {
    const response = documentFileResponse(
      { filename: 'resume "v2".pdf', mimeType: "application/pdf" },
      Buffer.from("%PDF"),
      "inline",
    );
    expect(response.headers.get("Content-Disposition")).toBe(
      'inline; filename="resume _v2_.pdf"',
    );
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
  });
});
