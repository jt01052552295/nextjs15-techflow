export interface ISetup {
  idx: number;
  uid: string;

  /** 기본 설정 여부 */
  isDefault: boolean;

  /** SNS 링크들 */
  snsFacebook?: string | null;
  snsTwitter?: string | null;
  snsInstagram?: string | null;
  snsYoutube?: string | null;
  snsLinkedin?: string | null;
  snsKakao?: string | null;
  snsNaver?: string | null;

  /** 필터/접근 제어(민감: 클라이언트 노출 주의) */
  idFilter?: string | null;
  wordFilter?: string | null;
  possibleIp?: string | null;
  interceptIp?: string | null;

  /** 안드로이드 앱 설정 */
  aosVersion?: string | null; // 예: "1.2.3"
  aosUpdate?: '1' | '2' | null; // 1:선택, 2:강제
  aosStoreApp?: string | null; // 앱에서 사용할 딥링크/스토어 주소
  aosStoreWeb?: string | null; // 웹에서 열 주소

  /** iOS 앱 설정 */
  iosVersion?: string | null;
  iosUpdate?: '1' | '2' | null; // 1:선택, 2:강제
  iosStoreApp?: string | null;
  iosStoreWeb?: string | null;

  /** 정적 리소스 버전 (쿼리스트링용) */
  jsCssVer?: string | null;

  /** 메타 */
  createdAt: Date;
  updatedAt: Date;
  isUse: boolean;
  isVisible: boolean;
}
