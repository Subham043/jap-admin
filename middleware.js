import { NextResponse } from "next/server";

const isTokenValid = async (token) => {
  try {
    const response = await fetch("https://server-api.jap.bio/api/v1/profile", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await response.json();

    if (
      response.ok &&
      data.user.roles.map((role) => role.name).includes("Super-Admin")
    ) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Token validation failed:", error);
    return false;
  }
};

export default async function middleware(req) {
  const token = req.cookies.get("japAccessToken")?.value;
  const { pathname } = req.nextUrl;

  const isPublicPath = pathname.startsWith("/authentication/sign-in");
  const loginUrl = new URL("/authentication/sign-in", req.url);
  loginUrl.searchParams.set("redirect", pathname);

  // 🧩 Create a response instance to manipulate cookies
  const res = NextResponse.next();

  // 🧩 Case 1: public page
  if (isPublicPath) {
    if (token && (await isTokenValid(token))) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return res;
  }

  // 🧩 Case 2: protected page, no token
  if (!token) {
    const redirect = NextResponse.redirect(loginUrl);
    redirect.cookies.delete("japAccessToken");
    return redirect;
  }

  // 🧩 Case 3: invalid token
  const valid = await isTokenValid(token);
  if (!valid) {
    const redirect = NextResponse.redirect(loginUrl);
    redirect.cookies.delete("japAccessToken");
    return redirect;
  }

  // 🧩 Case 4: valid token
  return res;
}

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
