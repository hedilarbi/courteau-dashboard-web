import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/zwDAYDcePjBuSLmZFuB-aXH10UR9BOZ9Ic6B5sRFimI.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
