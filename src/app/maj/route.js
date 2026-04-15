import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/boNYLVNupuEq4w4k5iRDN7.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
