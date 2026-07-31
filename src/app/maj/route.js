import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/6RqiUmxaAriou998v19HZgyS3QfSrKxT48-8p1NwIHQ.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
