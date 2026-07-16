import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/qBiaKoDbRDR2ENomqIMoQYPUO38a-KU1msF_CS1gXjs.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
