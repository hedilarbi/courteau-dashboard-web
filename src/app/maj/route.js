import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/E1Su6SeBy8y2pY8DTkntm.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
