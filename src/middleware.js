import { NextResponse } from "next/server";

const AUTH_COOKIES = ["token", "name", "role", "image", "id", "restaurant"];

const clearAuthCookies = (response) => {
  AUTH_COOKIES.forEach((cookieName) => {
    response.cookies.delete(cookieName);
  });
  return response;
};

const verifyStaffToken = async (token) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || !token) return false;

  try {
    const response = await fetch(`${apiUrl}/staffs/staffByToken/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";
  const isRootPage = pathname === "/";
  const token = request.cookies.get("token")?.value || "";

  if (!token) {
    if (isLoginPage) {
      return NextResponse.next();
    }
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    return clearAuthCookies(redirectResponse);
  }

  const isTokenValid = await verifyStaffToken(token);
  if (!isTokenValid) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    return clearAuthCookies(redirectResponse);
  }

  if (isLoginPage || isRootPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|maj).*)"],
};
