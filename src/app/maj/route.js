import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/BhP7Zg0CPhRIVfgY4JrDbnabEAgB9H-H5DUt4xNPOw0.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
