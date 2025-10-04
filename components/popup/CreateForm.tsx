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
import TextareaAutosize from 'react-textarea-autosize';
import { CreateType, CreateSchema } from '@/actions/popup/create/schema';
import { createAction } from '@/actions/popup/create';
import {
  SubmitHandler,
  useForm,
  FormProvider,
  Controller,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import QEditor from '@/components/editor/QEditor';
import ResultConfirm from '@/components/popup/modal/ResultConfirm';
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
      title: 'tttiiitile',
      content: '',
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

          queryClient.invalidateQueries({ queryKey: ['popup', 'list'] });

          // 상세로 이동
          // const qs = searchParams.toString();
          // queryClient.setQueryData(popupQK.detail(newItem.uid), newItem);
          // const showUrl = getRouteUrl('popup.show', locale, { id: newItem.uid });
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
                    <div className="col"></div>
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
        <ResultConfirm isOpen={isResultOpen} setIsOpen={setIsResultOpen} />
      </FormProvider>
    </>
  );
}
