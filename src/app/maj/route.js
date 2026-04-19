import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/mD75A2fyJReGogpenyVPEh.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
