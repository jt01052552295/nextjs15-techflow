export type TypeAsMonth =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12';
export type TypeAsSeason = '봄' | '여름' | '가을' | '겨울';

export const KEPCO_CONTRACTS: any = {
  ko: {
    CONT00: '주택용(저압)',
    CONT01: '주택용(고압)',
    CONT02: '일반용(갑)Ⅰ',
    CONT03: '일반용(갑)Ⅱ',
    CONT04: '일반용(을)',
    CONT05: '1주택 수 가구',
    CONT06: '교육용(갑)',
    CONT07: '교육용(을)',
    CONT08: '산업용(갑)Ⅰ',
    CONT09: '산업용(갑)Ⅱ',
    CONT10: '산업용(을)',
    CONT11: '임시(갑)',
    CONT12: '임시(을)',
    CONT13: '가로등(을)',
    CONT14: '심야전력(갑)',
    CONT15: '농사용(갑)',
    CONT16: '농사용(을)',
  },
  en: {
    CONT00: 'Residential (Low Voltage)',
    CONT01: 'Residential (High Voltage)',
    CONT02: 'General (Type I)',
    CONT03: 'General (Type II)',
    CONT04: 'General (Type III)',
    CONT05: 'Single-Family House',
    CONT06: 'Educational (Type I)',
    CONT07: 'Educational (Type II)',
    CONT08: 'Industrial (Type I)',
    CONT09: 'Industrial (Type II)',
    CONT10: 'Industrial (Type III)',
    CONT11: 'Temporary (Type I)',
    CONT12: 'Temporary (Type II)',
    CONT13: 'Street Lighting (Type II)',
    CONT14: 'Night Power (Type I)',
    CONT15: 'Agricultural (Type I)',
    CONT16: 'Agricultural (Type II)',
  },
  ja: {
    CONT00: '住宅用(低圧)',
    CONT01: '住宅用(高圧)',
    CONT02: '一般用(甲)Ⅰ',
    CONT03: '一般用(甲)Ⅱ',
    CONT04: '一般用(乙)',
    CONT05: '一戸建て住宅',
    CONT06: '教育用(甲)',
    CONT07: '教育用(乙)',
    CONT08: '産業用(甲)Ⅰ',
    CONT09: '産業用(甲)Ⅱ',
    CONT10: '産業用(乙)',
    CONT11: '仮設(甲)',
    CONT12: '仮設(乙)',
    CONT13: '街路灯(乙)',
    CONT14: '深夜電力(甲)',
    CONT15: '農業用(甲)',
    CONT16: '農業用(乙)',
  },
  zh: {
    CONT00: '住宅用（低压）',
    CONT01: '住宅用（高压）',
    CONT02: '一般用（甲类）Ⅰ',
    CONT03: '一般用（甲类）Ⅱ',
    CONT04: '一般用（乙类）',
    CONT05: '单户住宅',
    CONT06: '教育用（甲类）',
    CONT07: '教育用（乙类）',
    CONT08: '工业用（甲类）Ⅰ',
    CONT09: '工业用（甲类）Ⅱ',
    CONT10: '工业用（乙类）',
    CONT11: '临时用电（甲类）',
    CONT12: '临时用电（乙类）',
    CONT13: '路灯（乙类）',
    CONT14: '夜间电力（甲类）',
    CONT15: '农业用电（甲类）',
    CONT16: '农业用电（乙类）',
  },
};

export const KEPCO_FEE_SEASON = {
  '01': '겨울',
  '02': '겨울',
  '03': '봄',
  '04': '봄',
  '05': '봄',
  '06': '여름',
  '07': '여름',
  '08': '여름',
  '09': '가을',
  '10': '가을',
  '11': '겨울',
  '12': '겨울',
};

export const KEPCO_FEE = {
  '2023': {
    기후환경요금: 9,
    연료비조정액: 5,
  },
};

export const KEPCO_FEE_TABLE = {
  CONT08: {
    저압전력: {
      기본요금: 5550,
      봄: 85.9,
      여름: 107.7,
      가을: 85.9,
      겨울: 106.0,
    },
    고압A_1: {
      기본요금: 6490,
      봄: 92.6,
      여름: 116.3,
      가을: 92.6,
      겨울: 116.2,
    },
    고압A_2: {
      기본요금: 7470,
      봄: 88.0,
      여름: 111.5,
      가을: 88.0,
      겨울: 109.7,
    },
    고압B_1: {
      기본요금: 6000,
      봄: 91.5,
      여름: 115.1,
      가을: 91.5,
      겨울: 114.7,
    },
    고압B_2: {
      기본요금: 6900,
      봄: 86.9,
      여름: 110.4,
      가을: 86.9,
      겨울: 108.6,
    },
  },
  CONT09: {
    고압A_1: {
      기본요금: 6490,
      경부하: {
        봄: 87.2,
        여름: 87.2,
        가을: 87.2,
        겨울: 94.6,
      },
      중간부하: {
        봄: 92.0,
        여름: 113.0,
        가을: 92.0,
        겨울: 111.5,
      },
      최대부하: {
        봄: 111.2,
        여름: 146.5,
        가을: 111.2,
        겨울: 140.9,
      },
    },
    고압A_2: {
      기본요금: 7470,
      경부하: {
        봄: 82.3,
        여름: 82.3,
        가을: 82.3,
        겨울: 89.7,
      },
      중간부하: {
        봄: 87.1,
        여름: 108.1,
        가을: 87.1,
        겨울: 106.6,
      },
      최대부하: {
        봄: 106.3,
        여름: 141.6,
        가을: 106.3,
        겨울: 136.0,
      },
    },
    고압B_1: {
      기본요금: 6000,
      경부하: {
        봄: 84.0,
        여름: 84.0,
        가을: 84.0,
        겨울: 91.2,
      },
      중간부하: {
        봄: 90.6,
        여름: 111.6,
        가을: 90.6,
        겨울: 109.2,
      },
      최대부하: {
        봄: 109.4,
        여름: 145.4,
        가을: 109.4,
        겨울: 137.9,
      },
    },
    고압B_2: {
      기본요금: 6900,
      경부하: {
        봄: 79.5,
        여름: 79.5,
        가을: 79.5,
        겨울: 86.7,
      },
      중간부하: {
        봄: 86.1,
        여름: 107.1,
        가을: 86.1,
        겨울: 104.7,
      },
      최대부하: {
        봄: 104.9,
        여름: 140.9,
        가을: 104.9,
        겨울: 133.4,
      },
    },
  },
};

export const KEPCO_CALCULATOR = {
  CONT08: {
    기본요금: '{계약전력} * {기본요금단가} * {사용일}/{전체일}',
    역률요금:
      '({기본요금} * ( {지상기준역률} - {지상역률} ) * 0.002) + ({기본요금} * ( {진상기준역률} - {진상역률} ) * 0.002)',
    전력량요금: '{전력량} * {전력량기본요금단가}',
    기후환경요금: '{전력량} * {기후환경요금단가}',
    연료비조정액: '{전력량} * {연료비조정단가}',
    전기요금:
      '{기본요금} + {전력량요금} + {기후환경요금} + {연료비조정요금} + {역률요금}',
    부가가치세: '{전기요금} * 0.1',
    전력산업기반기금: '{전기요금} * 0.037',
    청구금액: '{전기요금} + {부가가치세} + {전력산업기반기금}',
  },
  CONT09: {
    기본요금: '{계약전력} * {기본요금단가} * {사용일}/{전체일}',
    역률요금:
      '({기본요금} * ( {지상기준역률} - {지상역률} ) * 0.002) + ({기본요금} * ( {진상기준역률} - {진상역률} ) * 0.002)',
    전력량요금: '{전력량} * {전력량기본요금단가}',
    기후환경요금: '{전력량} * {기후환경요금단가}',
    연료비조정액: '{전력량} * {연료비조정단가}',
    전기요금:
      '{기본요금} + {전력량요금} + {기후환경요금} + {연료비조정요금} + {역률요금}',
    부가가치세: '{전기요금} * 0.1',
    전력산업기반기금: '{전기요금} * 0.037',
    청구금액: '{전기요금} + {부가가치세} + {전력산업기반기금}',
  },
};

export const CARBON_POINT_STATUS = {
  ko: {
    add: '적립',
    remove: '사용',
    remove_expired: '기간만료차감',
    available: '사용가능',
    expired: '기간만료',
    used: '사용완료',
  },
  en: {
    add: 'Accumulate',
    remove: 'Use',
    remove_expired: 'Expiration Deduction',
    available: 'Available',
    expired: 'Expired',
    used: 'Used',
  },
  zh: {
    add: '累积',
    remove: '使用',
    remove_expired: '过期扣减',
    available: '可用',
    expired: '已过期',
    used: '已使用',
  },
  ja: {
    add: '積立',
    remove: '使用',
    remove_expired: '期限切れ減算',
    available: '使用可能',
    expired: '期限切れ',
    used: '使用済み',
  },
};

const kepcoOpenApi = 'https://opm.kepco.co.kr:11080/OpenAPI';
export const KEPCO_API_URL = {
  getCustJoinInfoData: `${kepcoOpenApi}/getCustJoinInfoData.do`, // 고객가입여부확인
  getCustInfoData: `${kepcoOpenApi}/getCustInfoData.do`, // 고객정보
  getCustMeterList: `${kepcoOpenApi}/getCustMeterList.do`, // 고객번호, 계기번호
  getCustBillData: `${kepcoOpenApi}/getCustBillData.do`, // 청구정보
  getCustNoList: `${kepcoOpenApi}/getCustNoList.do`, // 고객번호
  getMinuteLpData: `${kepcoOpenApi}/getMinuteLpData.do`, // 15분단위 전력소비 데이터
  getDayLpData: `${kepcoOpenApi}/getDayLpData.do`, // 일단위 전력소비 데이터
  getPeriodData: `${kepcoOpenApi}/getPeriodData.do`, // 특정고객의 특정시간 전력소비 데이터
};

// 탄소중립포인트 계산식
export const CPOINT_CALCULATOR = {
  greenGasEmission: '{kwh} * 424',
  reductionRate:
    '({기준전년반기별합계} - {기준년반기별합계})/{기준전년반기별합계} * 100',
};

// 탄소중립포인트 인센티브 테이블
export const CPOINT_TABLE = {
  personal: {
    reductionIncentive: {
      '5,10': 5000,
      '10,15': 10000,
      '15,': 15000,
    },
    maintenanceIncentive: {
      '0,5': 3000,
    },
    standardUsageIncentive: {
      ',50': 5000,
    },
  },
  corporate: {
    reductionIncentive: {
      '5,10': 20000,
      '10,15': 40000,
      '15,': 60000,
    },
    maintenanceIncentive: {
      '0~5': 12000,
    },
  },
};

// 탄소포인트에서 지급액 계산
export const CPOINT_TO_WON = {
  paymentAmount: '{carbonPoint} * 2',
};
