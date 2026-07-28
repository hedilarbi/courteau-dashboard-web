import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/uk_2OFo2C8SClmapsR8TurkDtS3DHxCgxaFZHo8g98c.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
