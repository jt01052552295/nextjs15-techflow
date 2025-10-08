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
import { toast } from 'sonner';
import Link from 'next/link';
import { getRouteUrl } from '@/utils/routes';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faSave, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { UpdateType, UpdateSchema } from '@/actions/board/update/schema';
import { updateAction } from '@/actions/board/update';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/board/modal/ResultConfirm';
import { IBoard } from '@/types/board';
import { useSearchParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { boardQK } from '@/lib/queryKeys/board';
import { showAction } from '@/actions/board/show';

type Props = {
  uid: string;
  baseParamsKey?: string;
};
export default function EditForm({ uid }: Props) {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isDataFetched, setIsDataFetched] = useState<boolean | undefined>(
    false,
  );

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);

  const { data, isLoading, error } = useQuery({
    queryKey: boardQK.detail(uid),
    queryFn: () => showAction(uid),
    staleTime: 30_000,
  });

  const seededRef = useRef(false);
  const staticUrl = useMemo(() => process.env.NEXT_PUBLIC_STATIC_URL ?? '', []);

  const methods = useForm<UpdateType>({
    mode: 'onChange',
    resolver: zodResolver(UpdateSchema(dictionary.common.form)),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    getValues,
    trigger,
    watch,
    reset,
    setError,
  } = methods;

  const { handleInputChange, getInputClass } = useFormUtils<UpdateType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const seedFormFromData = useCallback(async () => {
    if (!data) return;
    if (seededRef.current) return;
    // console.log('edit form', props.uid)
    // console.log(props.rs)

    setValue('uid', data.uid ?? '', { shouldValidate: true });
    setValue('cid', data.cid ?? '', { shouldValidate: true });
    setValue('bdTable', data.bdTable ?? '', { shouldValidate: true });
    setValue('bdName', data.bdName ?? '');
    setValue('bdNameEn', data.bdNameEn ?? '');
    setValue('bdNameJa', data.bdNameJa ?? '');
    setValue('bdNameZh', data.bdNameZh ?? '');
    setValue('bdSkin', data.bdSkin ?? '');
    setValue('bdListSize', data.bdListSize ?? '');
    setValue('bdFileCount', data.bdFileCount ?? '');
    setValue('bdNewTime', data.bdNewTime ?? '');
    setValue('bdSecret', data.bdSecret ?? false);
    setValue('bdPrivate', data.bdPrivate ?? false);
    setValue('bdBusiness', data.bdBusiness ?? false);
    setValue('bdUseCategory', data.bdUseCategory ?? false);
    setValue('bdCategoryList', data.bdCategoryList ?? '');
    setValue('bdFixTitle', data.bdFixTitle ?? '');
    setValue('bdListLevel', data.bdListLevel ?? '');
    setValue('bdReadLevel', data.bdReadLevel ?? '');
    setValue('bdWriteLevel', data.bdWriteLevel ?? '');
    setValue('bdReplyLevel', data.bdReplyLevel ?? '');
    setValue('bdCommentLevel', data.bdCommentLevel ?? '');
    setValue('bdUploadLevel', data.bdUploadLevel ?? '');
    setValue('bdDownloadLevel', data.bdDownloadLevel ?? '');

    setValue('isUse', !!(data as any).isUse);
    setValue('isVisible', !!(data as any).isVisible);

    seededRef.current = true;
  }, [data, setValue, staticUrl]);

  useEffect(() => {
    if (data) seedFormFromData();
  }, [data, seedFormFromData]);

  useEffect(() => {
    if (errors) {
      // console.error(errors);
      Object.keys(errors).forEach((field) => {
        const errorMessage = errors[field as keyof typeof errors]?.message;
        if (errorMessage) {
          toast.error(errorMessage);
        }
      });
    }
  }, [errors]);

  const formAction: SubmitHandler<UpdateType> = (data) => {
    startTransition(async () => {
      try {
        const finalData = {
          ...data,
        };
        console.log(finalData);
        const response = await updateAction(finalData);
        console.log(response);
        if (response.status == 'success') {
          const updatedItem = response.data as IBoard;

          toast.success(response.message);
          // reset();
          setIsResultOpen(true);

          queryClient.setQueryData(
            boardQK.detail(updatedItem.uid),
            updatedItem,
          );
          queryClient.invalidateQueries({ queryKey: ['board', 'list'] });
        } else {
          throw new Error(`${response.message}:: ${response.error}`);
        }
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          toast.error(err.message);
        } else if (typeof err === 'string') {
          toast.error(err);
        } else {
          // toast.error(t('common.unknown_error'));
          toast.error(JSON.stringify(err));
        }
      }
    });
  };

  const formReset = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    seedFormFromData();
    setIsDataFetched(false);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error || !data) return <p>{dictionary.common.failed_data}</p>;

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(formAction)}>
          <input type="hidden" {...register('uid')} />
          <input type="hidden" {...register('cid')} />
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
                        <label className="form-label" htmlFor="bdTable">
                          {t('columns.board.bdTable')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('bdTable')}`}
                          {...register('bdTable', {
                            onChange: () => handleInputChange('bdTable'),
                            onBlur: () => handleInputChange('bdTable'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.bdTable?.message && (
                          <div className="invalid-feedback">
                            {errors.bdTable?.message}
                          </div>
                        )}
                        {!errors.bdTable && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdName">
                          {t('columns.board.bdName')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('bdName')}`}
                          {...register('bdName', {
                            onChange: () => handleInputChange('bdName'),
                            onBlur: () => handleInputChange('bdName'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.bdName?.message && (
                          <div className="invalid-feedback">
                            {errors.bdName?.message}
                          </div>
                        )}
                        {!errors.bdName && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdNameEn">
                          {t('columns.board.bdNameEn')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('bdNameEn')}`}
                          {...register('bdNameEn', {
                            onChange: () => handleInputChange('bdNameEn'),
                            onBlur: () => handleInputChange('bdNameEn'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.bdNameEn?.message && (
                          <div className="invalid-feedback">
                            {errors.bdNameEn?.message}
                          </div>
                        )}
                        {!errors.bdNameEn && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdNameJa">
                          {t('columns.board.bdNameJa')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('bdNameJa')}`}
                          {...register('bdNameJa', {
                            onChange: () => handleInputChange('bdNameJa'),
                            onBlur: () => handleInputChange('bdNameJa'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.bdNameJa?.message && (
                          <div className="invalid-feedback">
                            {errors.bdNameJa?.message}
                          </div>
                        )}
                        {!errors.bdNameJa && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdNameZh">
                          {t('columns.board.bdNameZh')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('bdNameZh')}`}
                          {...register('bdNameZh', {
                            onChange: () => handleInputChange('bdNameZh'),
                            onBlur: () => handleInputChange('bdNameZh'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.bdNameZh?.message && (
                          <div className="invalid-feedback">
                            {errors.bdNameZh?.message}
                          </div>
                        )}
                        {!errors.bdNameZh && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdSkin">
                          {t('columns.board.bdSkin')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('bdSkin')}`}
                          {...register('bdSkin', {
                            onChange: () => handleInputChange('bdSkin'),
                            onBlur: () => handleInputChange('bdSkin'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.bdSkin?.message && (
                          <div className="invalid-feedback">
                            {errors.bdSkin?.message}
                          </div>
                        )}
                        {!errors.bdSkin && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdListSize">
                          {t('columns.board.bdListSize')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('bdListSize')}`}
                          defaultValue=""
                          {...register('bdListSize', {
                            onChange: () => handleInputChange('bdListSize'),
                            onBlur: () => handleInputChange('bdListSize'),
                          })}
                        >
                          <option value="">{t('common.choose')}</option>
                          {[10, 20, 50, 100].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        {errors.bdListSize?.message && (
                          <div className="invalid-feedback">
                            {errors.bdListSize?.message}
                          </div>
                        )}
                        {!errors.bdListSize && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdFileCount">
                          {t('columns.board.bdFileCount')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('bdFileCount')}`}
                          defaultValue=""
                          {...register('bdFileCount', {
                            onChange: () => handleInputChange('bdFileCount'),
                            onBlur: () => handleInputChange('bdFileCount'),
                          })}
                        >
                          <option value="">{t('common.choose')}</option>
                          {[1, 2, 5, 10].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        {errors.bdFileCount?.message && (
                          <div className="invalid-feedback">
                            {errors.bdFileCount?.message}
                          </div>
                        )}
                        {!errors.bdFileCount && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdNewTime">
                          {t('columns.board.bdNewTime')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('bdNewTime')}`}
                          {...register('bdNewTime', {
                            onChange: () => handleInputChange('bdNewTime'),
                            onBlur: () => handleInputChange('bdNewTime'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.bdNewTime?.message && (
                          <div className="invalid-feedback">
                            {errors.bdNewTime?.message}
                          </div>
                        )}
                        {!errors.bdNewTime && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdSecret">
                          {t('columns.board.bdSecret')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('bdSecret')}`}
                            type="checkbox"
                            role="switch"
                            id="bdSecret"
                            {...register('bdSecret', {
                              onChange: () => handleInputChange('bdSecret'),
                              onBlur: () => handleInputChange('bdSecret'),
                            })}
                            readOnly={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isVisible"
                          >
                            {t('common.usage')}
                          </label>
                        </div>

                        {errors.bdSecret?.message && (
                          <div className="invalid-feedback">
                            {errors.bdSecret?.message}
                          </div>
                        )}
                        {!errors.bdSecret && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdPrivate">
                          {t('columns.board.bdPrivate')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('bdPrivate')}`}
                            type="checkbox"
                            role="switch"
                            id="bdPrivate"
                            {...register('bdPrivate', {
                              onChange: () => handleInputChange('bdPrivate'),
                              onBlur: () => handleInputChange('bdPrivate'),
                            })}
                            readOnly={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isVisible"
                          >
                            {t('common.usage')}
                          </label>
                        </div>

                        {errors.bdPrivate?.message && (
                          <div className="invalid-feedback">
                            {errors.bdPrivate?.message}
                          </div>
                        )}
                        {!errors.bdPrivate && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdBusiness">
                          {t('columns.board.bdBusiness')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('bdBusiness')}`}
                            type="checkbox"
                            role="switch"
                            id="bdBusiness"
                            {...register('bdBusiness', {
                              onChange: () => handleInputChange('bdBusiness'),
                              onBlur: () => handleInputChange('bdBusiness'),
                            })}
                            readOnly={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isVisible"
                          >
                            {t('common.usage')}
                          </label>
                        </div>

                        {errors.bdBusiness?.message && (
                          <div className="invalid-feedback">
                            {errors.bdBusiness?.message}
                          </div>
                        )}
                        {!errors.bdBusiness && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdUseCategory">
                          {t('columns.board.bdUseCategory')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('bdUseCategory')}`}
                            type="checkbox"
                            role="switch"
                            id="bdUseCategory"
                            {...register('bdUseCategory', {
                              onChange: () =>
                                handleInputChange('bdUseCategory'),
                              onBlur: () => handleInputChange('bdUseCategory'),
                            })}
                            readOnly={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isVisible"
                          >
                            {t('common.usage')}
                          </label>
                        </div>

                        {errors.bdUseCategory?.message && (
                          <div className="invalid-feedback">
                            {errors.bdUseCategory?.message}
                          </div>
                        )}
                        {!errors.bdUseCategory && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdCategoryList">
                          {t('columns.board.bdCategoryList')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('bdCategoryList')}`}
                          {...register('bdCategoryList', {
                            onChange: () => handleInputChange('bdCategoryList'),
                            onBlur: () => handleInputChange('bdCategoryList'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.bdCategoryList?.message && (
                          <div className="invalid-feedback">
                            {errors.bdCategoryList?.message}
                          </div>
                        )}
                        {!errors.bdCategoryList && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="bdFixTitle">
                          {t('columns.board.bdFixTitle')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('bdFixTitle')}`}
                          {...register('bdFixTitle', {
                            onChange: () => handleInputChange('bdFixTitle'),
                            onBlur: () => handleInputChange('bdFixTitle'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.bdFixTitle?.message && (
                          <div className="invalid-feedback">
                            {errors.bdFixTitle?.message}
                          </div>
                        )}
                        {!errors.bdFixTitle && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
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
                        <label className="form-label">
                          {t('columns.board.bdListLevel')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('bdListLevel')}`}
                          defaultValue=""
                          {...register('bdListLevel', {
                            onChange: () => handleInputChange('bdListLevel'),
                            onBlur: () => handleInputChange('bdListLevel'),
                          })}
                        >
                          <option value="">{t('common.choose')}</option>
                          {[1, 2, 3, 99].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        {errors.bdListLevel?.message && (
                          <div className="invalid-feedback">
                            {errors.bdListLevel?.message}
                          </div>
                        )}
                        {!errors.bdListLevel && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label">
                          {t('columns.board.bdReadLevel')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('bdReadLevel')}`}
                          defaultValue=""
                          {...register('bdReadLevel', {
                            onChange: () => handleInputChange('bdReadLevel'),
                            onBlur: () => handleInputChange('bdReadLevel'),
                          })}
                        >
                          <option value="">{t('common.choose')}</option>
                          {[1, 2, 3, 99].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        {errors.bdReadLevel?.message && (
                          <div className="invalid-feedback">
                            {errors.bdReadLevel?.message}
                          </div>
                        )}
                        {!errors.bdReadLevel && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label">
                          {t('columns.board.bdWriteLevel')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('bdWriteLevel')}`}
                          defaultValue=""
                          {...register('bdWriteLevel', {
                            onChange: () => handleInputChange('bdWriteLevel'),
                            onBlur: () => handleInputChange('bdWriteLevel'),
                          })}
                        >
                          <option value="">{t('common.choose')}</option>
                          {[1, 2, 3, 99].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        {errors.bdWriteLevel?.message && (
                          <div className="invalid-feedback">
                            {errors.bdWriteLevel?.message}
                          </div>
                        )}
                        {!errors.bdWriteLevel && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label">
                          {t('columns.board.bdReplyLevel')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('bdReplyLevel')}`}
                          defaultValue=""
                          {...register('bdReplyLevel', {
                            onChange: () => handleInputChange('bdReplyLevel'),
                            onBlur: () => handleInputChange('bdReplyLevel'),
                          })}
                        >
                          <option value="">{t('common.choose')}</option>
                          {[1, 2, 3, 99].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        {errors.bdReplyLevel?.message && (
                          <div className="invalid-feedback">
                            {errors.bdReplyLevel?.message}
                          </div>
                        )}
                        {!errors.bdReplyLevel && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label">
                          {t('columns.board.bdCommentLevel')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('bdCommentLevel')}`}
                          defaultValue=""
                          {...register('bdCommentLevel', {
                            onChange: () => handleInputChange('bdCommentLevel'),
                            onBlur: () => handleInputChange('bdCommentLevel'),
                          })}
                        >
                          <option value="">{t('common.choose')}</option>
                          {[1, 2, 3, 99].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        {errors.bdCommentLevel?.message && (
                          <div className="invalid-feedback">
                            {errors.bdCommentLevel?.message}
                          </div>
                        )}
                        {!errors.bdCommentLevel && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label">
                          {t('columns.board.bdUploadLevel')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('bdUploadLevel')}`}
                          defaultValue=""
                          {...register('bdUploadLevel', {
                            onChange: () => handleInputChange('bdUploadLevel'),
                            onBlur: () => handleInputChange('bdUploadLevel'),
                          })}
                        >
                          <option value="">{t('common.choose')}</option>
                          {[1, 2, 3, 99].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        {errors.bdUploadLevel?.message && (
                          <div className="invalid-feedback">
                            {errors.bdUploadLevel?.message}
                          </div>
                        )}
                        {!errors.bdUploadLevel && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label">
                          {t('columns.board.bdDownloadLevel')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('bdDownloadLevel')}`}
                          defaultValue=""
                          {...register('bdDownloadLevel', {
                            onChange: () =>
                              handleInputChange('bdDownloadLevel'),
                            onBlur: () => handleInputChange('bdDownloadLevel'),
                          })}
                        >
                          <option value="">{t('common.choose')}</option>
                          {[1, 2, 3, 99].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        {errors.bdDownloadLevel?.message && (
                          <div className="invalid-feedback">
                            {errors.bdDownloadLevel?.message}
                          </div>
                        )}
                        {!errors.bdDownloadLevel && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="isUse">
                          {t('columns.board.isUse')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('isUse')}`}
                            type="checkbox"
                            role="switch"
                            id="isUse"
                            {...register('isUse', {
                              onChange: () => handleInputChange('isUse'),
                              onBlur: () => handleInputChange('isUse'),
                            })}
                            readOnly={isPending}
                          />
                          <label className="form-check-label" htmlFor="isUse">
                            {t('common.usage')}
                          </label>
                        </div>

                        {errors.isUse?.message && (
                          <div className="invalid-feedback">
                            {errors.isUse?.message}
                          </div>
                        )}
                        {!errors.isUse && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="isVisible">
                          {t('columns.board.isVisible')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('isVisible')}`}
                            type="checkbox"
                            role="switch"
                            id="isVisible"
                            {...register('isVisible', {
                              onChange: () => handleInputChange('isVisible'),
                              onBlur: () => handleInputChange('isVisible'),
                            })}
                            readOnly={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isVisible"
                          >
                            {t('common.visible')}
                          </label>
                        </div>

                        {errors.isVisible?.message && (
                          <div className="invalid-feedback">
                            {errors.isVisible?.message}
                          </div>
                        )}
                        {!errors.isVisible && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="row justify-content-between align-items-center mt-3 mb-3">
                <div className="col-auto">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isPending || !isValid}
                  >
                    <FontAwesomeIcon icon={faSave} />
                    &nbsp;{isPending ? t('common.loading') : t('common.save')}
                  </button>
                </div>
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm m-1"
                    onClick={formReset}
                  >
                    <FontAwesomeIcon icon={faRefresh} />
                    &nbsp;{t('common.reset')}
                  </button>
                  <Link
                    className="btn btn-outline-primary btn-sm"
                    href={`${getRouteUrl('board.index', locale)}?${searchParams.toString()}`}
                  >
                    <FontAwesomeIcon icon={faList} />
                    &nbsp;{t('common.list')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
      <ResultConfirm isOpen={isResultOpen} setIsOpen={setIsResultOpen} />
    </>
  );
}
