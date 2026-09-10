import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/6Ylx4KGppF1Nq4_iyKdfKgKtJEKfib_Z0vdL3JS3H3k.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
