'use client';
import {
  useEffect,
  useState,
  useTransition,
  useCallback,
  MouseEvent,
  useRef,
  ChangeEventHandler,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import Link from 'next/link';
import { getRouteUrl } from '@/utils/routes';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faSave, faRefresh } from '@fortawesome/free-solid-svg-icons';

import { CreateType, CreateSchema } from '@/actions/board/create/schema';
import { createAction } from '@/actions/board/create';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/board/modal/ResultConfirm';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

export default function CreateForm() {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]); // ✅ 업로드된 이미지 상태

  const methods = useForm<CreateType>({
    mode: 'onChange',
    resolver: zodResolver(CreateSchema(dictionary.common.form)),
    defaultValues: {
      uid: uuidv4(),
    },
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

  const { handleInputChange, getInputClass } = useFormUtils<CreateType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const formAction: SubmitHandler<CreateType> = (data) => {
    startTransition(async () => {
      try {
        const finalData = {
          ...data,
          todoFile: uploadedImages,
        };
        // console.log(finalData);
        const response = await createAction(finalData);
        console.log(response);
        if (response.status == 'success') {
          const newItem = response.data;
          if (!newItem) {
            throw new Error(`${response.message}`);
          }
          toast.success(response.message);

          reset();
          setUploadedImages([]); // ✅ 이미지 초기화
          setIsResultOpen(true);

          queryClient.invalidateQueries({ queryKey: ['board', 'list'] });

          // 상세로 이동
          // const qs = searchParams.toString();
          // queryClient.setQueryData(boardQK.detail(newItem.uid), newItem);
          // const showUrl = getRouteUrl('todos.show', locale, { id: newItem.uid });
          // router.push(qs ? `${showUrl}?${qs}` : showUrl, { scroll: false });
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
    reset(); // update form back to default values
    setUploadedImages([]); // ✅ 이미지 초기화
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(formAction)}>
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
        <ResultConfirm isOpen={isResultOpen} setIsOpen={setIsResultOpen} />
      </FormProvider>
    </>
  );
}
