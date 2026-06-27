import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/QomW1SuCVzSGepBK5TMVR9bzeTZn8tPx-uLVjMgkzM4.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
