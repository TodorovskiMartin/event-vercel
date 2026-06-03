import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requireUser } from "@/lib/auth";
import { createQrPng, createQrSvg, pdfSafeText, publicEventUrl, safeDownloadName } from "@/lib/qr";

export const runtime = "nodejs";

function centerText(page: import("pdf-lib").PDFPage, text: string, y: number, size: number, font: import("pdf-lib").PDFFont, color = rgb(0.04, 0.04, 0.06)) {
  const width = page.getWidth();
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: Math.max(48, (width - textWidth) / 2),
    y,
    size,
    font,
    color
  });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireUser();
    const { searchParams } = new URL(request.url);
    const requestedFormat = searchParams.get("format");
    const format = requestedFormat === "png" || requestedFormat === "pdf" ? requestedFormat : "svg";
    const { data: event } = await supabase.from("events").select("slug,title,artist_name,album_name").eq("id", id).eq("created_by", user.id).single();
    if (!event) return new Response("Event not found", { status: 404 });

    const publicUrl = publicEventUrl(event.slug);
    const fileName = safeDownloadName(event.slug);

    if (format === "png") {
      const buffer = await createQrPng(publicUrl);
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
      return new Response(arrayBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${fileName}-qr.png"`
        }
      });
    }

    if (format === "pdf") {
      const qrPng = await createQrPng(publicUrl, 820);
      const pdf = await PDFDocument.create();
      const page = pdf.addPage([595.28, 841.89]);
      const regular = await pdf.embedFont(StandardFonts.Helvetica);
      const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const qrImage = await pdf.embedPng(qrPng);

      centerText(page, pdfSafeText(event.artist_name), 770, 28, bold);
      centerText(page, pdfSafeText(event.album_name), 738, 20, regular);
      centerText(page, pdfSafeText(event.title), 710, 16, regular, rgb(0.22, 0.22, 0.25));

      page.drawImage(qrImage, {
        x: 147.64,
        y: 310,
        width: 300,
        height: 300
      });

      centerText(page, "Scan to vote after the presentation", 250, 18, bold);
      const displayUrl = publicUrl.length > 88 ? `${publicUrl.slice(0, 85)}...` : publicUrl;
      centerText(page, displayUrl, 224, 9, regular, rgb(0.25, 0.25, 0.28));

      const pdfBytes = await pdf.save();
      const arrayBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
      return new Response(arrayBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}-qr.pdf"`
        }
      });
    }

    const svg = await createQrSvg(publicUrl);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}-qr.svg"`
      }
    });
  } catch (error) {
    console.error("QR export failed", { error });
    return new Response("QR export failed. Please try SVG or PNG, or refresh and retry.", { status: 500 });
  }
}
