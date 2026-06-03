import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { ALBUM_COVERS_BUCKET } from "@/lib/storage";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxSizeBytes = 5 * 1024 * 1024;

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "album-cover";
}

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 400 });
  if (file.size > maxSizeBytes) return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/${randomUUID()}-${safeFileName(file.name).replace(/\.[^.]+$/, "")}.${extension}`;
  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage.from(ALBUM_COVERS_BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false
  });

  if (error) {
    const missingBucket = error.message.toLowerCase().includes("bucket not found");
    return NextResponse.json(
      {
        error: missingBucket
          ? "Album cover storage bucket is missing. Apply Supabase migrations or create the album-covers bucket in Supabase Storage."
          : error.message
      },
      { status: 400 }
    );
  }
  return NextResponse.json({ path });
}
