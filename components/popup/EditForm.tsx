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
import TextareaAutosize from 'react-textarea-autosize';
import { UpdateType, UpdateSchema } from '@/actions/popup/update/schema';
import { updateAction } from '@/actions/popup/update';
import {
  FormProvider,
  SubmitHandler,
  useForm,
  Controller,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/popup/modal/ResultConfirm';
import { IPopup } from '@/types/popup';
import QEditor from '@/components/editor/QEditor';
import { useSearchParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { popupQK } from '@/lib/queryKeys/popup';
import { showAction } from '@/actions/popup/show';
import { formatToDateTimeLocal } from '@/lib/util';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: IPopupPart;
};
export default function EditForm({ uid }: Props) {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);

  const { data, isLoading, error } = useQuery({
    queryKey: popupQK.detail(uid),
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

    setValue('title', data.title ?? '', { shouldValidate: true });
    setValue('content', (data as any).content ?? null);
    setValue('posX', (data as any).posX ?? '');
    setValue('posY', (data as any).posY ?? '');

    if (data.startTime) {
      setValue('startTime', formatToDateTimeLocal(data.startTime));
    }
    if (data.endTime) {
      setValue('endTime', formatToDateTimeLocal(data.endTime));
    }

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
          const updatedItem = response.data as IPopup;

          toast.success(response.message);
          // reset();
          setIsResultOpen(true);

          queryClient.setQueryData(
            popupQK.detail(updatedItem.uid),
            updatedItem,
          );
          queryClient.invalidateQueries({ queryKey: ['popup', 'list'] });
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
                        <label className="form-label" htmlFor="title">
                          {t('columns.popup.title')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('title')}`}
                          {...register('title', {
                            onChange: () => handleInputChange('title'),
                            onBlur: () => handleInputChange('title'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.title?.message && (
                          <div className="invalid-feedback">
                            {errors.title?.message}
                          </div>
                        )}
                        {!errors.title && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="posX">
                          {t('columns.popup.posX')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('posX')}`}
                          {...register('posX', {
                            onChange: () => handleInputChange('posX'),
                            onBlur: () => handleInputChange('posX'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.posX?.message && (
                          <div className="invalid-feedback">
                            {errors.posX?.message}
                          </div>
                        )}
                        {!errors.posX && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="posY">
                          {t('columns.popup.posY')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('posY')}`}
                          {...register('posY', {
                            onChange: () => handleInputChange('posY'),
                            onBlur: () => handleInputChange('posY'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.posY?.message && (
                          <div className="invalid-feedback">
                            {errors.posY?.message}
                          </div>
                        )}
                        {!errors.posY && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="startTime">
                          {t('columns.popup.startTime')}
                        </label>

                        <input
                          type="datetime-local"
                          className={`form-control ${getInputClass('startTime')}`}
                          {...register('startTime', {
                            onChange: () => handleInputChange('startTime'),
                            onBlur: () => handleInputChange('startTime'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.startTime?.message && (
                          <div className="invalid-feedback">
                            {errors.startTime?.message}
                          </div>
                        )}
                        {!errors.startTime && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="endTime">
                          {t('columns.popup.endTime')}
                        </label>

                        <input
                          type="datetime-local"
                          className={`form-control ${getInputClass('endTime')}`}
                          {...register('endTime', {
                            onChange: () => handleInputChange('endTime'),
                            onBlur: () => handleInputChange('endTime'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.endTime?.message && (
                          <div className="invalid-feedback">
                            {errors.endTime?.message}
                          </div>
                        )}
                        {!errors.endTime && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="content">
                          {t('columns.popup.content')}
                        </label>
                        <Controller
                          name="content"
                          control={control}
                          render={({ field, fieldState }) => (
                            <>
                              <QEditor
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                              />
                              {fieldState.error?.message && (
                                <div className="invalid-feedback d-block">
                                  {fieldState.error.message}
                                </div>
                              )}
                            </>
                          )}
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
                          {t('columns.popup.isUse')}
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
                          {t('columns.popup.isVisible')}
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

                      <div className="mb-2">
                        <label className="form-label" htmlFor="todoFile">
                          {t('columns.popup.TodosFile')}
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
                    href={`${getRouteUrl('popup.index', locale)}?${searchParams.toString()}`}
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
