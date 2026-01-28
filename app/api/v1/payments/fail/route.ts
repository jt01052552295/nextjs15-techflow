/**
 * 결제 실패 리다이렉트 URL
 * GET /api/v1/payments/fail
 *
 * TossPay 결제창에서 결제 실패/취소 후 리다이렉트되는 URL
 */
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get('code');
  const message = searchParams.get('message');

  // 파라미터 로깅 (디버깅용)
  console.log('Payment Failed Redirect:', { code, message });

  // 에러 메시지 디코딩
  const decodedMessage = message
    ? decodeURIComponent(message)
    : '결제가 실패했습니다.';

  // 실패 페이지 HTML 반환
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>결제 실패</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 400px;
          }
          .icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            color: #e53935;
            margin-bottom: 10px;
          }
          p {
            color: #666;
            word-break: keep-all;
          }
          .code {
            font-size: 12px;
            color: #999;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">❌</div>
          <h1>결제에 실패했습니다</h1>
          <p>${decodedMessage}</p>
          <p class="code">에러 코드: ${code || 'UNKNOWN'}</p>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
