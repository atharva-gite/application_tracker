export function canPreviewInBrowser(mimeType: string) {
  return mimeType === "application/pdf";
}

export function documentFileResponse(
  document: { filename: string; mimeType: string },
  bytes: Buffer,
  mode: "inline" | "attachment",
) {
  const filename = document.filename.replaceAll(/["\\]/g, "_");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `${mode}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
