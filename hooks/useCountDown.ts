'use client';
import { useState, useEffect, useRef } from 'react';
import dayjs, { ManipulateType } from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';
// import 'dayjs/locale/ko';
// dayjs.extend(relativeTime);

function calculateTimeParts(time: number) {
  const hour = Math.floor(time / 1000 / 60 / 60);
  const minute = Math.floor((time / 1000 / 60) % 60);
  const second = Math.floor((time / 1000) % 60);

  const hourString = hour > 0 ? `${hour}` : '';
  const minuteString = minute >= 0 ? `:${minute}` : '';
  const secondString = second >= 0 ? `:${second}` : '';

  return `${hourString} ${minuteString} ${secondString}`;
}

function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const tick = setInterval(() => {
        return savedCallback.current && savedCallback.current();
      }, delay);

      return () => clearInterval(tick);
    }
  }, [delay]);
}

export function useCountDown(
  targetTime: string,
  addTime: number,
  addTimeType: ManipulateType,
  expiredMsg: string,
) {
  const targetDate = dayjs(targetTime).add(addTime, addTimeType);
  const [isExpired, setIsExpired] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useInterval(() => {
    const timeDifference = targetDate.diff(dayjs());

    if (timeDifference <= 0) {
      setIsExpired(true);
    } else {
      setRemainingTime(timeDifference);
    }
  }, 10);

  if (isExpired) {
    return expiredMsg;
  } else {
    return calculateTimeParts(remainingTime);
  }
}
