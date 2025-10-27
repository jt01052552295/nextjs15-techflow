'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

export default function NaverMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const isMapInitialized = useRef(false);
  const [address, setAddress] = useState('');

  const makeAddress = (item: any) => {
    if (!item) return;

    const name = item.name;
    const region = item.region;
    const land = item.land;
    const isRoadAddress = name === 'roadaddr';

    let sido = '',
      sigugun = '',
      dongmyun = '',
      ri = '',
      rest = '';

    const hasArea = (area: any) => !!(area && area.name && area.name !== '');
    const hasData = (data: any) => !!(data && data !== '');
    const checkLastString = (word: string, lastString: string) =>
      new RegExp(lastString + '$').test(word);
    const hasAddition = (addition: any) => !!(addition && addition.value);

    if (hasArea(region.area1)) sido = region.area1.name;
    if (hasArea(region.area2)) sigugun = region.area2.name;
    if (hasArea(region.area3)) dongmyun = region.area3.name;
    if (hasArea(region.area4)) ri = region.area4.name;

    if (land) {
      if (hasData(land.number1)) {
        if (hasData(land.type) && land.type === '2') {
          rest += '산';
        }
        rest += land.number1;
        if (hasData(land.number2)) {
          rest += '-' + land.number2;
        }
      }

      if (isRoadAddress === true) {
        if (checkLastString(dongmyun, '면')) {
          ri = land.name;
        } else {
          dongmyun = land.name;
          ri = '';
        }
        if (hasAddition(land.addition0)) {
          rest += ' ' + land.addition0.value;
        }
      }
    }

    return [sido, sigugun, dongmyun, ri, rest].join(' ');
  };

  const searchCoordinateToAddress = (latlng: any) => {
    const { naver } = window;
    if (!infoWindowRef.current || !naver?.maps?.Service) return;

    infoWindowRef.current.close();

    naver.maps.Service.reverseGeocode(
      {
        coords: latlng,
        orders: [
          naver.maps.Service.OrderType.ADDR,
          naver.maps.Service.OrderType.ROAD_ADDR,
        ].join(','),
      },
      function (status: any, response: any) {
        if (status === naver.maps.Service.Status.ERROR) {
          return alert('Something Wrong!');
        }

        const items = response.v2.results;
        const htmlAddresses = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const address = makeAddress(item) || '';
          const addrType =
            item.name === 'roadaddr' ? '[도로명 주소]' : '[지번 주소]';
          htmlAddresses.push(i + 1 + '. ' + addrType + ' ' + address);
        }

        infoWindowRef.current.setContent(
          [
            '<div style="padding:10px;min-width:200px;line-height:150%;">',
            '<h4 style="margin-top:5px;">검색 좌표</h4><br />',
            htmlAddresses.join('<br />'),
            '</div>',
          ].join('\n'),
        );

        infoWindowRef.current.open(mapInstanceRef.current, latlng);
      },
    );
  };

  const searchAddressToCoordinate = (searchAddress: string) => {
    const { naver } = window;
    if (!naver?.maps?.Service) {
      console.warn('Naver Maps Service is not loaded yet');
      return;
    }

    if (!searchAddress.trim()) {
      alert('주소를 입력해주세요.');
      return;
    }

    naver.maps.Service.geocode(
      {
        query: searchAddress,
      },
      function (status: any, response: any) {
        if (status === naver.maps.Service.Status.ERROR) {
          return alert('Something Wrong!');
        }

        if (response.v2.meta.totalCount === 0) {
          return alert('검색 결과가 없습니다. totalCount: 0');
        }

        const htmlAddresses = [];
        const item = response.v2.addresses[0];
        const point = new naver.maps.Point(item.x, item.y);

        if (item.roadAddress) {
          htmlAddresses.push('[도로명 주소] ' + item.roadAddress);
        }
        if (item.jibunAddress) {
          htmlAddresses.push('[지번 주소] ' + item.jibunAddress);
        }
        if (item.englishAddress) {
          htmlAddresses.push('[영문명 주소] ' + item.englishAddress);
        }

        infoWindowRef.current.setContent(
          [
            '<div style="padding:10px;min-width:200px;line-height:150%;">',
            '<h4 style="margin-top:5px;">검색 주소 : ' +
              searchAddress +
              '</h4><br />',
            htmlAddresses.join('<br />'),
            '</div>',
          ].join('\n'),
        );

        mapInstanceRef.current.setCenter(point);
        infoWindowRef.current.open(mapInstanceRef.current, point);
      },
    );
  };

  const initMap = () => {
    if (!mapRef.current || isMapInitialized.current) return;

    const { naver } = window;
    if (!naver?.maps) return;

    const map = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(37.3595316, 127.1052133),
      zoom: 15,
      mapTypeControl: true,
    });

    const infoWindow = new naver.maps.InfoWindow({
      anchorSkew: true,
    });

    map.setCursor('pointer');

    // 지도 클릭 이벤트
    map.addListener('click', function (e: any) {
      searchCoordinateToAddress(e.coord);
    });

    mapInstanceRef.current = map;
    infoWindowRef.current = infoWindow;
    isMapInitialized.current = true;

    // 초기 주소 검색
    setTimeout(() => {
      if (window.naver?.maps?.Service) {
        searchAddressToCoordinate('정자동 178-1');
      }
    }, 100);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchAddressToCoordinate(address);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchAddressToCoordinate(address);
    }
  };

  useEffect(() => {
    if (window.naver && window.naver.maps) {
      initMap();
    }
  }, []);

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=panorama,geocoder,drawing,visualization`}
        strategy="afterInteractive"
        onLoad={initMap}
      />

      <div style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="주소를 입력하세요 (예: 정자동 178-1)"
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <button
            type="submit"
            id="submit"
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: '#03c75a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            검색
          </button>
        </form>
      </div>

      <div ref={mapRef} id="map" style={{ width: '100%', height: '600px' }} />
    </>
  );
}
