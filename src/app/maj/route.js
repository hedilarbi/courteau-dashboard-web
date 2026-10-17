import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/OWwbQ39HC_0HInsNL7DLH1nF-OETTA9SuNjFVtsOqH8.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
