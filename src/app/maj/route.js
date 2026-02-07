import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/uc1q7xt5TLeCJAscnqgSZk.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
