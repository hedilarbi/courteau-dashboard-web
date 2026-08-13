import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/J1ekxxceJh3zk4bRoQk6wn6jb9xkzMoWozzDXwUZbCs.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
