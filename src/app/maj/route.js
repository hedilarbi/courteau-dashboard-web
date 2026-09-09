import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/eyWDcRQGfkNAN4M9hHXfjkmFGubwcJCTOJUPeV5BRRk.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
