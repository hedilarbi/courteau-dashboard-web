import { NextResponse } from "next/server";

const APK_URL = "https://expo.dev/artifacts/eas/zUmmcbWYQc0smUrlDl_kVqrE5G0-7YhcdIbFCXEMhE8.apk";

export function GET() {
  return NextResponse.redirect(APK_URL, { status: 302 });
}
