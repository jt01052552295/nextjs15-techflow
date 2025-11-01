import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    daum: any;
  }
}

type AddressData = {
  zonecode: string;
  address: string;
  addressType: 'R' | 'J';
  bname: string;
  buildingName: string;
  autoJibunAddress: string;
  sido: string;
  sigungu: string;
};

type UseDaumPostcodeProps = {
  onComplete: (data: {
    zipcode: string;
    address: string;
    addrJibeon: string;
    sido: string;
    gugun: string;
    dong: string;
  }) => void;
};

export const useDaumPostcode = ({ onComplete }: UseDaumPostcodeProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const open = useCallback(
    (elementId: string) => {
      const element = document.getElementById(elementId);
      if (!element || !window.daum) return;

      new window.daum.Postcode({
        oncomplete: (data: AddressData) => {
          let fullAddr = data.address;
          let extraAddr = '';

          if (data.addressType === 'R') {
            if (data.bname !== '') {
              extraAddr += data.bname;
            }
            if (data.buildingName !== '') {
              extraAddr +=
                extraAddr !== '' ? ', ' + data.buildingName : data.buildingName;
            }
            fullAddr += extraAddr !== '' ? ' (' + extraAddr + ')' : '';
          }

          onComplete({
            zipcode: data.zonecode,
            address: fullAddr,
            addrJibeon: data.autoJibunAddress || '',
            sido: data.sido || '',
            gugun: data.sigungu || '',
            dong: data.bname || '',
          });

          element.style.display = 'none';
        },
        onresize: (size: { height: number }) => {
          element.style.height = size.height + 'px';
        },
        width: '100%',
        height: '100%',
      }).embed(element);

      element.style.display = 'block';
    },
    [onComplete],
  );

  const close = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = 'none';
    }
  }, []);

  return { open, close };
};
