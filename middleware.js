import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // 獲取 token（包含用戶資訊）
    const token = req.nextauth.token;
    // 檢查是否有 token
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    // 確認是否為 Google 登入（檢查 email）
    if (!token.email) {
      return new NextResponse(
        JSON.stringify({ error: "Must login with Google" }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }

    const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') || [];


    const isAllowedEmail = allowedEmails.includes(token.email);
    if (!isAllowedEmail) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // 通過所有檢查，允許請求繼續
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: [
    '/api/parse-bill',
    '/api/check-email',
    // 其他需要保護的路徑
  ]
}; 