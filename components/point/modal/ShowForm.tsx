'use client';
import {
  useEffect,
  useState,
  useTransition,
  useCallback,
  MouseEvent,
  useRef,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/context/LanguageContext';
import { CreateType, CreateSchema } from '@/actions/point/create/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { pointQK } from '@/lib/queryKeys/point';
import { showAction } from '@/actions/point/show';
import UserProfileDisplay from '@/components/common/UserProfileDisplay';

type Props = {
  idx: number;
  baseParamsKey?: string;
  //   rs: IPointPart;
};

export default function ShowForm({ idx }: Props) {
  const { dictionary, t } = useLanguage();
  const router = useRouter();
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

  const onClickClose = () => {
    router.back();
  };

  return (
    <>
      <div
        className="modal fade show d-block"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClickClose();
          }
        }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content" style={{ maxHeight: '70vh' }}>
            <div className="modal-header">
              <h3 className="modal-title fs-5">{t('common.view')}</h3>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClickClose}
              ></button>
            </div>
            <div className={`modal-body `}>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title m-0">
                        {t('common.basic_info')}
                      </h5>
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
                      <h5 className="card-title m-0">
                        {t('common.other_info')}
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClickClose}
              >
                {dictionary.common.close}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
