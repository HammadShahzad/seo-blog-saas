import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Allow public routes
      const publicPaths = ["/", "/login", "/register", "/pricing", "/features", "/api/register"];
      const isPublic = publicPaths.some((path) => req.nextUrl.pathname === path);
      const isApiAuth = req.nextUrl.pathname.startsWith("/api/auth");
      const isPublicApi = req.nextUrl.pathname.startsWith("/api/v1");

      if (isPublic || isApiAuth || isPublicApi) {
        return true;
      }

      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/websites/:path*",
    "/api/register",
  ],
};
