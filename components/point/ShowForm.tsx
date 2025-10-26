'use client';
import {
  useEffect,
  useState,
  useTransition,
  useCallback,
  MouseEvent,
  useRef,
  ChangeEventHandler,
  useMemo,
} from 'react';

import Link from 'next/link';
import { getRouteUrl } from '@/utils/routes';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { CreateType, CreateSchema } from '@/actions/point/create/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { pointQK } from '@/lib/queryKeys/point';
import { showAction } from '@/actions/point/show';
import { useSearchParams } from 'next/navigation';
import UserProfileDisplay from '../common/UserProfileDisplay';

type Props = {
  idx: number;
  baseParamsKey?: string;
};

export default function ShowForm({ idx }: Props) {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const { data, isLoading, error } = useQuery({
    queryKey: pointQK.detail(idx),
    queryFn: () => showAction(idx),
    staleTime: 30_000,
  });

  const { register, setValue, getValues } = useForm<CreateType>({
    mode: 'onChange',
    resolver: zodResolver(CreateSchema(dictionary.common.form)),
  });

  const seededRef = useRef(false);
  const staticUrl = useMemo(() => process.env.NEXT_PUBLIC_STATIC_URL ?? '', []);

  const seedFormFromData = useCallback(async () => {
    if (!data) return;
    if (seededRef.current) return;
    // console.log('edit form', props.idx)
    // console.log(props.rs)

    // setValue('idx', data.idx ?? '', { shouldValidate: true });

    setValue('userId', data.userId ?? '', { shouldValidate: true });
    setValue('point', data.point ?? 0, { shouldValidate: true });
    setValue('status', (data as any).status ?? '', { shouldValidate: true });

    seededRef.current = true;
  }, [data, setValue, staticUrl]);

  useEffect(() => {
    if (data) seedFormFromData();
  }, [data, seedFormFromData]);

  if (isLoading) return <p>Loading...</p>;
  if (error || !data) return <p>{dictionary.common.failed_data}</p>;

  return (
    <>
      <div>
        {/* <input type="hidden" {...register('idx')} /> */}
        <div className="row">
          <div className="col-md-6 mb-2">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title m-0">{t('common.basic_info')}</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col">
                    <div className="mb-2">
                      <label className="form-label" htmlFor="userId">
                        {t('columns.point.userId')}
                      </label>

                      <UserProfileDisplay user={data.user} />
                      <input
                        type="text"
                        className={`form-control`}
                        {...register('userId')}
                        disabled={true}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label" htmlFor="point">
                        {t('columns.point.point')}
                      </label>
                      <input
                        type="text"
                        className={`form-control`}
                        {...register('point')}
                        disabled={true}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label" htmlFor="status">
                        {t('columns.point.status')}
                      </label>
                      <input
                        type="text"
                        className={`form-control`}
                        {...register('status')}
                        disabled={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-2">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title m-0">{t('common.other_info')}</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="row justify-content-between align-items-center mt-3 mb-3">
              <div className="col-auto"></div>
              <div className="col-auto">
                <Link
                  className="btn btn-outline-primary btn-sm"
                  href={`${getRouteUrl('point.index', locale)}?${searchParams.toString()}`}
                >
                  <FontAwesomeIcon icon={faList} />
                  &nbsp;{t('common.list')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
