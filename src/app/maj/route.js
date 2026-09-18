import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/i_UCY2Pfj8-yZ-Gm2hJRZNPXvUO-EXe4OqiJx8IjfyQ.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
