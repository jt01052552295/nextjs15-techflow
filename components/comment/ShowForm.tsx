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
import TextareaAutosize from 'react-textarea-autosize';
import { UpdateType, UpdateSchema } from '@/actions/comment/update/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { commentQK } from '@/lib/queryKeys/comment';
import { showAction } from '@/actions/comment/show';
import { useSearchParams } from 'next/navigation';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: ITodosPart;
};

export default function ShowForm({ uid }: Props) {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const { data, isLoading, error } = useQuery({
    queryKey: commentQK.detail(uid),
    queryFn: () => showAction(uid),
    staleTime: 30_000,
  });

  const { register, setValue, getValues } = useForm<UpdateType>({
    mode: 'onChange',
    resolver: zodResolver(UpdateSchema(dictionary.common.form)),
  });

  const seededRef = useRef(false);
  const staticUrl = useMemo(() => process.env.NEXT_PUBLIC_STATIC_URL ?? '', []);

  const seedFormFromData = useCallback(async () => {
    if (!data) return;
    if (seededRef.current) return;
    // console.log('edit form', props.uid)
    // console.log(props.rs)

    setValue('uid', data.uid ?? '', { shouldValidate: true });
    setValue('bdTable', data.bdTable ?? '', { shouldValidate: true });
    setValue('author', data.author ?? '', { shouldValidate: true });
    setValue('pid', data.pid ?? '', { shouldValidate: true });
    setValue('parentIdx', (data as any).parentIdx ?? '');
    setValue('content', (data as any).content ?? null);
    setValue('isUse', !!(data as any).isUse);
    setValue('isVisible', !!(data as any).isVisible);

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
        <input type="hidden" {...register('bdTable')} />
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
                      <label className="form-label" htmlFor="author">
                        {t('columns.bbsComment.author')}
                      </label>
                      <input
                        type="text"
                        className={`form-control`}
                        {...register('author')}
                        disabled={true}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label" htmlFor="pid">
                        {t('columns.bbsComment.pid')}
                      </label>

                      <input
                        type="text"
                        className={`form-control`}
                        {...register('pid')}
                        disabled={true}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label" htmlFor="parentIdx">
                        {t('columns.bbsComment.parentIdx')}
                      </label>

                      <input
                        type="text"
                        className={`form-control`}
                        {...register('parentIdx')}
                        disabled={true}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label" htmlFor="content">
                        {t('columns.bbsComment.content')}
                      </label>
                      <TextareaAutosize
                        className={`form-control`}
                        maxRows={10}
                        {...register('content')}
                        disabled={true}
                      ></TextareaAutosize>
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
                        {t('columns.bbsComment.isUse')}
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
                        {t('columns.bbsComment.isVisible')}
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

                    <div className="mb-2">
                      <label className="form-label" htmlFor="todoFile">
                        {t('columns.bbsComment.TodosFile')}
                        <small className="text-muted ms-1">
                          {t('common.upload.info_message', {
                            count: '4',
                            size: '20',
                          })}
                        </small>
                      </label>
                    </div>
                  </div>
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
                  href={`${getRouteUrl('comment.index', locale)}?${searchParams.toString()}`}
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
