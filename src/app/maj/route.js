import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/kV9eDGAoGveYmW1L6yJ6Gv.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
