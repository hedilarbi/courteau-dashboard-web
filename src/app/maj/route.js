import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/2jbmy428C7vFbRn2rKSGFB.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
