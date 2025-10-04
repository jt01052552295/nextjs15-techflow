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
import { CreateType, CreateSchema } from '@/actions/banner/create/schema';
import { createAction } from '@/actions/banner/create';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/banner/modal/ResultConfirm';
import ImageUploader from './ImageUploader';
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
      gubun: 'main',
      title: 'test1',
      url: '',
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
          bannerFile: uploadedImages,
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

          queryClient.invalidateQueries({ queryKey: ['banner', 'list'] });

          // 상세로 이동
          // const qs = searchParams.toString();
          // queryClient.setQueryData(bannerQK.detail(newItem.uid), newItem);
          // const showUrl = getRouteUrl('banner.show', locale, { id: newItem.uid });
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
                        <label className="form-label" htmlFor="gubun">
                          {t('columns.banner.gubun')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('gubun')}`}
                          {...register('gubun', {
                            onChange: () => handleInputChange('gubun'),
                            onBlur: () => handleInputChange('gubun'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.gubun?.message && (
                          <div className="invalid-feedback">
                            {errors.gubun?.message}
                          </div>
                        )}
                        {!errors.gubun && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="title">
                          {t('columns.banner.title')}
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
                          {t('columns.banner.deviceType')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('deviceType')}`}
                          defaultValue=""
                          {...register('deviceType', {
                            onChange: () => handleInputChange('deviceType'),
                            onBlur: () => handleInputChange('deviceType'),
                          })}
                        >
                          <option value="all">all</option>
                          <option value="pc">pc</option>
                          <option value="mobile">mobile</option>
                        </select>
                        {errors.deviceType?.message && (
                          <div className="invalid-feedback">
                            {errors.deviceType?.message}
                          </div>
                        )}
                        {!errors.deviceType && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="url">
                          {t('columns.banner.url')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('url')}`}
                          {...register('url', {
                            onChange: () => handleInputChange('url'),
                            onBlur: () => handleInputChange('url'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.url?.message && (
                          <div className="invalid-feedback">
                            {errors.url?.message}
                          </div>
                        )}
                        {!errors.url && (
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

            <div className="col-md-12 mb-2">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title m-0">
                    {t('common.additional_info')}
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col">
                      <div className="mb-2">
                        <ImageUploader
                          dir={'banner'}
                          pid={watch('uid')}
                          onChange={setUploadedImages} // ✅ 작성폼은 업로드된 이미지만 관리
                          mode="create"
                        />
                        <small className="text-muted ms-1">
                          {t('common.upload.info_message', {
                            count: '1',
                            size: '20',
                          })}
                        </small>
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
                    href={`${getRouteUrl('banner.index', locale)}?${searchParams.toString()}`}
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
