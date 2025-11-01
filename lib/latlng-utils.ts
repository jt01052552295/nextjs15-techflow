// 네이버 API 설정
export const CLIENT_ID = process.env.NCP_CLIENT_ID || '';
export const CLIENT_SECRET = process.env.NCP_CLIENT_SECRET || '';

export const NAVER_GEOCODE_URL =
  'https://maps.apigw.ntruss.com/map-geocode/v2/geocode';

// 타입 정의
export type NaverGeocodeAddressElement = {
  types: string[]; // e.g., ["SIDO"], ["ROAD_NAME"]
  longName: string; // "경기도"
  shortName: string; // "경기도"
  code: string; // ""
};

export type NaverGeocodeAddress = {
  roadAddress: string; // "경기도 성남시 분당구 불정로 6 NAVER그린팩토리"
  jibunAddress: string; // "경기도 성남시 분당구 정자동 178-1 NAVER그린팩토리"
  englishAddress: string; // "6, Buljeong-ro, Bundang-gu, ..."
  addressElements: NaverGeocodeAddressElement[];
  x: string; // "127.1054328"  (lng)
  y: string; // "37.3595963"   (lat)
  distance: number; // 0.0
};

export type NaverGeocodeMeta = {
  totalCount: number; // 1
  page: number; // 1
  count: number; // 1
};

export type NaverGeocodeResponse = {
  status: string; // "OK" | "ERROR" (문서상 문자열)
  meta: NaverGeocodeMeta;
  addresses: NaverGeocodeAddress[];
  errorMessage?: string; // "" 또는 오류 메시지
};

type Coords = {
  lat: number;
  lng: number;
  road?: string;
  jibun?: string;
};

export async function getlatlng(query: string): Promise<NaverGeocodeResponse> {
  const url = `${NAVER_GEOCODE_URL}?${new URLSearchParams({ query }).toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'x-ncp-apigw-api-key-id': CLIENT_ID,
      'x-ncp-apigw-api-key': CLIENT_SECRET,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Geocode failed: ${res.status} ${res.statusText} ${text}`);
  }

  const data = (await res.json()) as NaverGeocodeResponse;

  if (data.status && data.status !== 'OK') {
    throw new Error(
      data.errorMessage || `Geocode error: status=${data.status}`,
    );
  }

  return data;
}

export async function getCoords(query: string): Promise<Coords | null> {
  const resp = await getlatlng(query);
  const a = resp.addresses?.[0];
  if (!a) return null;

  const lat = Number(a.y);
  const lng = Number(a.x);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return {
    lat,
    lng,
    road: a.roadAddress || undefined,
    jibun: a.jibunAddress || undefined,
  };
}
