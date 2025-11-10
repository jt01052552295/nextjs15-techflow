import { sign } from 'jsonwebtoken';

/**
 * Firebase Service Account 타입 정의
 */
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Firebase FCM용 JWT 토큰 생성
 * Google OAuth2 토큰을 얻기 위한 JWT를 생성합니다.
 *
 * @param serviceAccount Firebase 서비스 계정 정보
 * @returns JWT 토큰 문자열
 * @throws Error JWT 생성 실패 시
 *
 * @example
 * const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
 * const jwt = createJWT(serviceAccount);
 */
export function createJWT(serviceAccount: ServiceAccount): string {
  try {
    const now = Math.floor(Date.now() / 1000); // 현재 시간을 초 단위로

    const payload = {
      iss: serviceAccount.client_email, // 발급자 (issuer)
      scope: 'https://www.googleapis.com/auth/firebase.messaging', // FCM 권한 범위
      aud: 'https://oauth2.googleapis.com/token', // 대상 (audience)
      exp: now + 3600, // 만료 시간 (1시간 후)
      iat: now, // 발급 시간 (issued at)
    };

    // private_key에서 \n을 실제 개행 문자로 변환
    const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

    // RS256 알고리즘으로 JWT 서명
    const token = sign(payload, privateKey, {
      algorithm: 'RS256',
    });

    return token;
  } catch (error) {
    console.error('JWT 생성 오류:', error);
    throw error;
  }
}

/**
 * Google OAuth2 액세스 토큰 획득
 * Firebase 서비스 계정을 사용하여 FCM API 호출을 위한 액세스 토큰을 발급받습니다.
 *
 * @returns Google OAuth2 액세스 토큰
 * @throws Error 토큰 획득 실패 시
 *
 * @example
 * const accessToken = await getGoogleAccessToken();
 * // 이 토큰으로 FCM API 호출
 */
export async function getGoogleAccessToken(): Promise<string> {
  try {
    // 환경변수에서 서비스 계정 JSON 가져오기
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountJson) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT 환경변수가 설정되지 않았습니다.',
      );
    }

    // JSON 파싱
    let serviceAccount: ServiceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      throw new Error(
        `서비스 계정 JSON 파싱 오류: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
      );
    }

    // JWT 생성
    const jwt = createJWT(serviceAccount);

    // Google OAuth2 토큰 엔드포인트
    const url = 'https://oauth2.googleapis.com/token';

    // 요청 데이터
    const data = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    });

    // HTTP 요청
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: data.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP 오류 ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();

    // 액세스 토큰 확인
    if (!responseData.access_token) {
      throw new Error(
        `액세스 토큰을 받지 못했습니다: ${JSON.stringify(responseData)}`,
      );
    }

    return responseData.access_token;
  } catch (error) {
    console.error('토큰 획득 오류:', error);
    throw error;
  }
}

/**
 * FCM 푸시 알림 응답 타입
 */
interface FcmResponse {
  success: boolean;
  response?: any;
  error?: string;
}

/**
 * 모바일 푸시 알림 전송 (Android & iOS)
 * Firebase Cloud Messaging을 통해 모바일 디바이스로 푸시 알림을 전송합니다.
 *
 * @param deviceToken FCM 디바이스 토큰
 * @param title 알림 제목
 * @param body 알림 본문
 * @param targetUrl 클릭 시 이동할 URL (옵션)
 * @param additionalData 추가 데이터 (옵션)
 * @returns 전송 결과
 *
 * @example
 * const result = await sendPushNotification(
 *   'device_token_here',
 *   '새 메시지',
 *   '안녕하세요!',
 *   '/messages/123',
 *   { messageId: '123' }
 * );
 */
export async function sendPushNotification(
  deviceToken: string,
  title: string,
  body: string,
  targetUrl: string = '',
  additionalData: Record<string, any> = {},
): Promise<FcmResponse> {
  try {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apnsTopic =
      process.env.FIREBASE_APNS_TOPIC ||
      process.env.NEXT_PUBLIC_FIREBASE_APNS_TOPIC;
    const androidChannel = process.env.FIREBASE_ANDROID_CHANNEL || 'default';

    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID 환경변수가 설정되지 않았습니다.');
    }

    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    // data 필드에 url과 추가 데이터 병합
    const data = {
      title,
      body,
      targetUrl,
      ...additionalData,
    };

    const message = {
      message: {
        token: deviceToken,
        notification: {
          title,
          body,
        },
        data,
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            channel_id: androidChannel,
            visibility: 'PUBLIC',
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
            'apns-push-type': 'alert',
            'apns-topic': apnsTopic || '',
          },
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              sound: 'default',
              badge: 1,
              'mutable-content': 1,
              'content-available': 1,
            },
            data, // 커스텀 데이터도 포함
          },
        },
      },
    };

    // 액세스 토큰 획득
    const accessToken = await getGoogleAccessToken();

    // FCM API 호출
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const responseData = await response.json();

    return {
      success: response.status === 200,
      response: responseData,
    };
  } catch (error) {
    console.error('푸시 알림 전송 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 웹 푸시 알림 전송
 * Firebase Cloud Messaging을 통해 웹 브라우저로 푸시 알림을 전송합니다.
 *
 * @param deviceToken FCM 웹 토큰
 * @param title 알림 제목
 * @param body 알림 본문
 * @param targetUrl 클릭 시 이동할 URL (옵션)
 * @param additionalData 추가 데이터 (옵션)
 * @returns 전송 결과
 *
 * @example
 * const result = await sendWebPushNotification(
 *   'web_token_here',
 *   '새 알림',
 *   '확인해주세요!',
 *   '/notifications/123'
 * );
 */
export async function sendWebPushNotification(
  deviceToken: string,
  title: string,
  body: string,
  targetUrl: string = '',
  additionalData: Record<string, any> = {},
): Promise<FcmResponse> {
  try {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID 환경변수가 설정되지 않았습니다.');
    }

    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    // 아이콘 이미지 URL 설정
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '';
    const icon = `${appUrl}/assets/favicon/android-icon-144x144.png`;

    const message = {
      message: {
        token: deviceToken,
        webpush: {
          notification: {
            title,
            body,
            icon,
            // image: imageUrl, // 본문에 표시할 큰 이미지 (옵션)
          },
          headers: {
            Urgency: 'high',
          },
          data: {
            click_action: targetUrl,
            ...additionalData,
          },
        },
      },
    };

    // 액세스 토큰 획득
    const accessToken = await getGoogleAccessToken();

    // FCM API 호출
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const responseData = await response.json();

    return {
      success: response.status === 200,
      response: responseData,
    };
  } catch (error) {
    console.error('웹 푸시 알림 전송 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 알림 저장 파라미터 타입
 */
interface SaveNotificationParams {
  userId: string; // User.id
  templateId?: string; // FcmTemplate.uid (옵션)
  title: string;
  message: string;
  targetLink?: string;
  additionalData?: Record<string, any>;
}

/**
 * 사용자에게 푸시 알림을 전송하고 DB에 저장
 * - 모바일 토큰과 웹 토큰을 모두 조회하여 전송
 * - FcmMessage에 전송 로그 저장
 * - FcmAlarm에 알림 내역 저장
 *
 * @param params 알림 파라미터
 * @returns 성공 여부
 *
 * @example
 * await saveNotification({
 *   userId: 'user-uuid',
 *   templateId: 'template-uid',
 *   title: '새 메시지',
 *   message: '확인해주세요!',
 *   targetLink: '/messages/123',
 * });
 */
export async function saveNotification(
  params: SaveNotificationParams,
): Promise<boolean> {
  const {
    userId,
    templateId,
    title,
    message,
    targetLink = '',
    additionalData = {},
  } = params;

  try {
    // 필수 파라미터 검증
    if (!userId || !title || !message) {
      console.error('필수 파라미터 누락: userId, title, message');
      return false;
    }

    // Prisma import (함수 내에서만 사용)
    const { default: prisma } = await import('@/lib/prisma');

    // 1. 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId, isUse: true, isVisible: true },
      select: { id: true, idx: true },
    });

    if (!user) {
      console.error('사용자를 찾을 수 없습니다:', userId);
      return false;
    }

    // 2. 사용자 설정 확인 (푸시 알림 수신 동의 여부)
    // Setting 테이블에 pushPoint나 pushBill 같은 필드가 있다면 확인
    // 현재 스키마에는 없으므로 생략하거나, 필요시 추가

    // 3. 모바일 토큰 조회 및 전송
    const mobileTokens = await prisma.fcmToken.findMany({
      where: {
        userId: user.id,
        platform: { in: ['android', 'ios'] },
        isUse: true,
        isVisible: true,
      },
      select: { token: true, platform: true },
    });

    // 모바일 푸시 전송
    for (const tokenData of mobileTokens) {
      const result = await sendPushNotification(
        tokenData.token,
        title,
        message,
        targetLink,
        additionalData,
      );

      // 전송 로그 저장
      const resJson = JSON.stringify(result);
      const resStatus = result.success ? 'success' : 'fail';
      const resMsg =
        !result.success && result.response?.error?.message
          ? result.response.error.message
          : !result.success
            ? result.error || 'Unknown error'
            : '';

      await prisma.fcmMessage.create({
        data: {
          platform: 'app',
          templateId: templateId || null,
          userId: user.id,
          fcmToken: tokenData.token,
          title,
          body: message,
          url: targetLink,
          res: resJson,
          resStatus,
          resMsg,
        },
      });
    }

    // 4. 웹 토큰 조회 및 전송
    const webTokens = await prisma.fcmToken.findMany({
      where: {
        userId: user.id,
        platform: 'web',
        isUse: true,
        isVisible: true,
      },
      select: { token: true },
    });

    // 웹 푸시 전송
    for (const tokenData of webTokens) {
      const result = await sendWebPushNotification(
        tokenData.token,
        title,
        message,
        targetLink,
        additionalData,
      );

      // 전송 로그 저장
      const resJson = JSON.stringify(result);
      const resStatus = result.success ? 'success' : 'fail';
      const resMsg =
        !result.success && result.response?.error?.message
          ? result.response.error.message
          : !result.success
            ? result.error || 'Unknown error'
            : '';

      await prisma.fcmMessage.create({
        data: {
          platform: 'desktop',
          templateId: templateId || null,
          userId: user.id,
          fcmToken: tokenData.token,
          title,
          body: message,
          url: targetLink,
          res: resJson,
          resStatus,
          resMsg,
        },
      });
    }

    // 5. 알림 내역 저장 (FcmAlarm)
    await prisma.fcmAlarm.create({
      data: {
        userId: user.id,
        templateId: templateId || null,
        message: `${title}\n${message}`,
        url: targetLink,
        isRead: false,
      },
    });

    return true;
  } catch (error) {
    console.error('알림 저장 오류:', error);
    return false;
  }
}
