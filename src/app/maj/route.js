import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/b6tLSNQ4sLd6RhB2heGW5h.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
