import QRCode from "qrcode";
import { env } from "./config";
import { publicEventPath } from "./urls";

export function publicEventUrl(slug: string) {
  return `${env.NEXT_PUBLIC_APP_URL}${publicEventPath(slug)}`;
}

export async function createQrSvg(url: string, width = 960) {
  return QRCode.toString(url, {
    type: "svg",
    margin: 1,
    width,
    color: { dark: "#0a0b10", light: "#ffffff" }
  });
}

export async function createQrPng(url: string, width = 960) {
  return QRCode.toBuffer(url, {
    margin: 1,
    width,
    color: { dark: "#0a0b10", light: "#ffffff" }
  });
}

export function safeDownloadName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]+/g, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "event";
}

export function pdfSafeText(value: string) {
  const cleaned = value.replace(/[^\x20-\x7E]+/g, "").trim();
  return cleaned || "Event";
}
