import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  let cookie = request.cookies.get("token");

  if (!cookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  } else {
    if (request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.next();
    }
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/articles/:path*",
    "/employes/:path*",
    "/recompenses/:path*",
    "/commandes/:path*",
    "/personnalisations/:path*",
    "/restaurants/:path*",
    "/utilisateur/:path*",
    "/parametres/:path*",
    "/offres/:path*",
    "/notifications/:path*",
    "/",
  ],
};
