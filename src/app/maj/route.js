import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/w2JDX2BPc0--_BEqLAE0qpulb4u2f4uO3nW2ro2IyrU.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
