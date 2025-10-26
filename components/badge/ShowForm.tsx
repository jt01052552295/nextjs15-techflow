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
import { UpdateType, UpdateSchema } from '@/actions/badge/update/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ImageView from './ImageView';
import { useQuery } from '@tanstack/react-query';
import { badgeQK } from '@/lib/queryKeys/badge';
import { showAction } from '@/actions/badge/show';
import { useSearchParams } from 'next/navigation';

type Props = {
  uid: string;
  baseParamsKey?: string;
};

export default function ShowForm({ uid }: Props) {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const { data, isLoading, error } = useQuery({
    queryKey: badgeQK.detail(uid),
    queryFn: () => showAction(uid),
    staleTime: 30_000,
  });

  const { register, setValue, getValues } = useForm<UpdateType>({
    mode: 'onChange',
    resolver: zodResolver(UpdateSchema(dictionary.common.form)),
  });

  const [uploadedImages, setUploadedImages] = useState<
    { preview: string; name: string }[]
  >([]);

  const seededRef = useRef(false);
  const staticUrl = useMemo(() => process.env.NEXT_PUBLIC_STATIC_URL ?? '', []);

  const seedFormFromData = useCallback(async () => {
    if (!data) return;
    if (seededRef.current) return;
    // console.log('edit form', props.uid)
    // console.log(props.rs)

    setValue('uid', data.uid ?? '', { shouldValidate: true });

    setValue('bmType', data.bmType ?? '', { shouldValidate: true });
    setValue('bmCategory', data.bmCategory ?? '', { shouldValidate: true });
    setValue('bmLevel', data.bmLevel ?? '', { shouldValidate: true });
    setValue('bmThreshold', (data as any).bmThreshold ?? 0);
    setValue('bmName', (data as any).bmName ?? '');

    setValue('isUse', !!(data as any).isUse);
    setValue('isVisible', !!(data as any).isVisible);

    if (data.img1) {
      const initialImages = [
        {
          preview:
            staticUrl + '/uploads/techflow/badge/' + data.uid + '/' + data.img1,
          name: data.img1,
        },
      ];
      setUploadedImages(initialImages);
    }
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
        <input type="hidden" {...register('uid')} />
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
                      <label className="form-label" htmlFor="bmType">
                        {t('columns.badge.bmType')}
                      </label>
                      <input
                        type="text"
                        className={`form-control`}
                        {...register('bmType')}
                        disabled={true}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label" htmlFor="bmCategory">
                        {t('columns.badge.bmCategory')}
                      </label>
                      <input
                        type="text"
                        className={`form-control`}
                        {...register('bmCategory')}
                        disabled={true}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label" htmlFor="bmLevel">
                        {t('columns.badge.bmLevel')}
                      </label>
                      <input
                        type="text"
                        className={`form-control`}
                        {...register('bmLevel')}
                        disabled={true}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label" htmlFor="bmThreshold">
                        {t('columns.badge.bmThreshold')}
                      </label>
                      <input
                        type="text"
                        className={`form-control`}
                        {...register('bmThreshold')}
                        disabled={true}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label" htmlFor="bmName">
                        {t('columns.badge.bmName')}
                      </label>
                      <input
                        type="text"
                        className={`form-control`}
                        {...register('bmName')}
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
                  <div className="col">
                    <div className="mb-2">
                      <label className="form-label" htmlFor="isUse">
                        {t('columns.badge.isUse')}
                      </label>
                      <div className="form-check form-switch">
                        <input
                          className={`form-check-input `}
                          type="checkbox"
                          role="switch"
                          id="isUse"
                          {...register('isUse')}
                          disabled={true}
                        />
                        <label className="form-check-label" htmlFor="isUse">
                          {t('common.usage')}
                        </label>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="form-label" htmlFor="isVisible">
                        {t('columns.badge.isVisible')}
                      </label>
                      <div className="form-check form-switch">
                        <input
                          className={`form-check-input `}
                          type="checkbox"
                          role="switch"
                          id="isVisible"
                          {...register('isVisible')}
                          disabled={true}
                        />
                        <label className="form-check-label" htmlFor="isVisible">
                          {t('common.visible')}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12 mb-2">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title m-0">
                  {t('common.additional_info')}
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <ImageView images={uploadedImages} />
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
                  href={`${getRouteUrl('badge.index', locale)}?${searchParams.toString()}`}
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
