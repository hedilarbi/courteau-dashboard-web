import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/iFJLUNoobSrdJb8STiFg67.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
