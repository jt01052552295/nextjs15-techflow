import { NextRequest } from 'next/server';
import { UAParser } from 'ua-parser-js';

// 로그 데이터를 처리하는 함수
export async function logUserAgent(req: NextRequest) {
  const userAgent = req.headers.get('user-agent') || '';
  const parser = new UAParser();
  const uaResult = parser.setUA(userAgent).getResult();

  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const referer = req.headers.get('referer') || 'unknown';
  const host = req.nextUrl.host;

  const isMobile = uaResult.device.type === 'mobile';
  const isTablet = uaResult.device.type === 'tablet';
  const isDesktop = !uaResult.device.type; // `device.type`이 없으면 데스크탑으로 간주
  const isRobot = /bot|crawl|spider|slurp/i.test(userAgent);

  let keyword = '';
  let key = '';

  // 검색 쿼리 파라미터 추출
  if (referer.indexOf('?q=') !== -1) {
    key = '?q=';
  } else if (referer.indexOf('&q=') !== -1) {
    key = '&q=';
  } else if (referer.indexOf('?query=') !== -1) {
    key = '?query=';
  } else if (referer.indexOf('&query=') !== -1) {
    key = '&query=';
  }

  if (key) {
    let str = referer.substring(referer.indexOf(key) + key.length);
    str = str.replace(key, '');

    if (str.indexOf('&') !== -1) {
      str = str.substring(0, str.indexOf('&'));
    }

    // 검색 키워드 추출 후 공백으로 변환
    keyword = str.replace(/\+/g, ' ');
  }

  const userAgentData = {
    browser: uaResult.browser.name,
    browserVersion: uaResult.browser.version,
    os: uaResult.os.name,
    osVersion: uaResult.os.version,
    device: uaResult.device.type || 'Desktop',
    ip,
    referer,
    host,
    isMobile,
    isTablet,
    isDesktop,
    isRobot,
    keyword,
  };

  const agent_url = `${process.env.NEXT_PUBLIC_APP_URL}/api/agent`;
  const res = await fetch(agent_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: userAgentData }),
  });
  if (res.ok) {
    // const result = await res.json();
    // console.log(result); // 필요시 결과를 처리
  }
}
