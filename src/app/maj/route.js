import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/6LKfBr7GV1WlXZw7tLlPP1tckBhTcJCe0K8xgqvPuWU.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
