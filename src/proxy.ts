import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const { pathname } = req.nextUrl;

      const publicPaths = ["/", "/login", "/register", "/pricing", "/features", "/forgot-password", "/reset-password"];
      const isPublic = publicPaths.some((path) => pathname === path);
      const isApiAuth = pathname.startsWith("/api/auth");
      const isPublicApi = pathname.startsWith("/api/v1");
      const isBlog = pathname.startsWith("/blog/");
      const isStripeWebhook = pathname === "/api/stripe/webhook";
      const isCronOrWorker = pathname.startsWith("/api/cron") || pathname.startsWith("/api/worker");

      if (isPublic || isApiAuth || isPublicApi || isBlog || isStripeWebhook || isCronOrWorker) {
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
    "/api/admin/:path*",
    "/api/team/:path*",
    "/api/user/:path*",
    "/api/api-keys/:path*",
    "/api/stripe/checkout",
    "/api/stripe/portal",
  ],
};
