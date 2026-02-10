import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/otQ9K4pHaCLWCSWmh2NibC.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
