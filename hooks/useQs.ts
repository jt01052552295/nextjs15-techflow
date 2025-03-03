'use client';

import { useEffect, useState } from 'react';

function useQS(searchParams: any) {
  const [queryString, setQueryString] = useState<string | undefined>('');

  useEffect(() => {
    // console.log(searchParams)
    const urlSearchParams = new URLSearchParams(searchParams);
    // console.log(`${urlSearchParams.toString()}`)
    setQueryString(urlSearchParams.toString());
  }, [searchParams]);

  return queryString;
}

export default useQS;
