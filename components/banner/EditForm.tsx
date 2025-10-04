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

import { UpdateType, UpdateSchema } from '@/actions/banner/update/schema';
import { updateAction } from '@/actions/banner/update';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/banner/modal/ResultConfirm';
import { IBanner } from '@/types/banner';
import ImageUploader from './ImageUploader';
import { useSearchParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { bannerQK } from '@/lib/queryKeys/banner';
import { showAction } from '@/actions/banner/show';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: IBannerPart;
};
export default function EditForm({ uid }: Props) {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isDataFetched, setIsDataFetched] = useState<boolean | undefined>(
    false,
  );

  const [uploadedImages, setUploadedImages] = useState<any[]>([]); // ✅ 업로드된 이미지 상태
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);

  const { data, isLoading, error } = useQuery({
    queryKey: bannerQK.detail(uid),
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
    setValue('gubun', data.gubun ?? '', { shouldValidate: true });
    setValue('title', data.title ?? '', { shouldValidate: true });
    setValue('deviceType', (data as any).deviceType ?? '');
    setValue('url', (data as any).url ?? '');

    setValue('isUse', !!(data as any).isUse);
    setValue('isVisible', !!(data as any).isVisible);

    if (data.BannerFile) {
      const initialImages =
        data.BannerFile.map((file: any) => ({
          preview: staticUrl + file.url,
          name: file.name,
          url: file.url,
          originalName: file.originalName, // ✅ 원본 파일명
          size: file.size, // ✅ 파일 크기
          ext: file.ext, // ✅ 확장자
          type: file.type, // ✅ MIME 타입
        })) ?? [];
      setUploadedImages(initialImages);
    }

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
          bannerFile: uploadedImages,
          deleteFileUrls: deletedImages, // ✅ 삭제된 이미지들
        };
        console.log(finalData);
        const response = await updateAction(finalData);
        console.log(response);
        if (response.status == 'success') {
          const updatedItem = response.data as IBanner;

          toast.success(response.message);
          // reset();
          setIsResultOpen(true);

          queryClient.setQueryData(
            bannerQK.detail(updatedItem.uid),
            updatedItem,
          );
          queryClient.invalidateQueries({ queryKey: ['banner', 'list'] });
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
                      <div className="mb-2">
                        <label className="form-label" htmlFor="isUse">
                          {t('columns.banner.isUse')}
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
                          {t('columns.banner.isVisible')}
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
                          onChange={(images, removed) => {
                            setUploadedImages(images); // ✅ 남아있는 이미지들
                            setDeletedImages(removed ?? []); // ✅ 삭제된 이미지들
                          }}
                          initialImages={uploadedImages}
                          mode="edit"
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
      </FormProvider>
      <ResultConfirm isOpen={isResultOpen} setIsOpen={setIsResultOpen} />
    </>
  );
}
