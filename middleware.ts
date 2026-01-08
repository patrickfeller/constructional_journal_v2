export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/((?!auth|register|api/auth|api/register|api/migrate.*|api/resize-blobs|api/debug|api/test.*|api/simple-post).*)"],
};


