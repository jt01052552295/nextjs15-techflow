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
import { UpdateType, UpdateSchema } from '@/actions/bbs/update/schema';
import { updateAction } from '@/actions/bbs/update';
import {
  FormProvider,
  SubmitHandler,
  useForm,
  Controller,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/bbs/modal/ResultConfirm';
import { IBBS, IBBSListRow } from '@/types/bbs';
import QEditor from '@/components/editor/QEditor';
import FileUploader from './FileUploader';
import { useSearchParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { bbsQK } from '@/lib/queryKeys/bbs';
import { showAction } from '@/actions/bbs/show';
import UserSelect from '../common/UserSelect';
import BoardSelect from '../common/BoardSelect';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: ITodosPart;
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
    queryKey: bbsQK.detail(uid),
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
    setValue('userId', data.userId ?? '');
    setValue('name', data.name ?? '', { shouldValidate: true });
    setValue('password', '', { shouldValidate: true });
    setValue('notice', data.notice ?? false);
    setValue('secret', data.secret ?? false);
    setValue('category', data.category ?? '');
    setValue('subject', data.subject ?? '', { shouldValidate: true });
    setValue('content', data.content ?? '', { shouldValidate: true });
    setValue('contentA', data.contentA ?? null);
    setValue('ipAddress', data.ipAddress ?? '');
    setValue('link1', data.link1 ?? '');
    setValue('link2', data.link2 ?? '');

    setValue('isUse', !!(data as any).isUse);
    setValue('isVisible', !!(data as any).isVisible);

    // console.log(data);

    if (data.files) {
      const initialImages =
        data.files.map((file: any) => ({
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
          files: uploadedImages,
          deleteFileUrls: deletedImages, // ✅ 삭제된 이미지들
        };
        console.log(finalData);
        const response = await updateAction(finalData);
        console.log(response);
        if (response.status == 'success') {
          const updatedItem = response.data as IBBSListRow;

          toast.success(response.message);
          // reset();
          setIsResultOpen(true);

          queryClient.setQueryData(bbsQK.detail(updatedItem.uid), updatedItem);
          queryClient.invalidateQueries({ queryKey: ['bbs', 'list'] });
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
                          {t('columns.bbs.bdTable')}
                        </label>

                        <BoardSelect
                          name="bdTable"
                          control={control}
                          required
                          error={errors.bdTable?.message}
                          feedbackMessages={{ valid: t('common.form.valid') }}
                          disabled={isPending}
                          onChange={() => handleInputChange('bdTable')}
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
                        <label className="form-label" htmlFor="userId">
                          {t('columns.bbs.userId')}
                        </label>

                        <UserSelect
                          name="userId"
                          control={control}
                          required
                          error={errors.userId?.message}
                          feedbackMessages={{ valid: t('common.form.valid') }}
                          disabled={isPending}
                          onChange={() => handleInputChange('userId')}
                        />

                        {errors.userId?.message && (
                          <div className="invalid-feedback">
                            {errors.userId?.message}
                          </div>
                        )}
                        {!errors.userId && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="name">
                          {t('columns.bbs.name')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('name')}`}
                          {...register('name', {
                            onChange: () => handleInputChange('name'),
                            onBlur: () => handleInputChange('name'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.name?.message && (
                          <div className="invalid-feedback">
                            {errors.name?.message}
                          </div>
                        )}
                        {!errors.name && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="password">
                          {t('columns.bbs.password')}
                        </label>

                        <input
                          type="password"
                          className={`form-control ${getInputClass('password')}`}
                          {...register('password', {
                            onChange: () => handleInputChange('password'),
                            onBlur: () => handleInputChange('password'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.password?.message && (
                          <div className="invalid-feedback">
                            {errors.password?.message}
                          </div>
                        )}
                        {!errors.password && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="subject">
                          {t('columns.bbs.subject')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('subject')}`}
                          {...register('subject', {
                            onChange: () => handleInputChange('subject'),
                            onBlur: () => handleInputChange('subject'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.subject?.message && (
                          <div className="invalid-feedback">
                            {errors.subject?.message}
                          </div>
                        )}
                        {!errors.subject && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="content">
                          {t('columns.bbs.content')}
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
                        <label className="form-label" htmlFor="notice">
                          {t('columns.bbs.notice')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('notice')}`}
                            type="checkbox"
                            role="switch"
                            id="notice"
                            {...register('notice', {
                              onChange: () => handleInputChange('notice'),
                              onBlur: () => handleInputChange('notice'),
                            })}
                            readOnly={isPending}
                          />
                          <label className="form-check-label" htmlFor="notice">
                            {t('common.usage')}
                          </label>
                        </div>

                        {errors.notice?.message && (
                          <div className="invalid-feedback">
                            {errors.notice?.message}
                          </div>
                        )}
                        {!errors.notice && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="secret">
                          {t('columns.bbs.secret')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('secret')}`}
                            type="checkbox"
                            role="switch"
                            id="secret"
                            {...register('secret', {
                              onChange: () => handleInputChange('secret'),
                              onBlur: () => handleInputChange('secret'),
                            })}
                            readOnly={isPending}
                          />
                          <label className="form-check-label" htmlFor="secret">
                            {t('common.usage')}
                          </label>
                        </div>

                        {errors.secret?.message && (
                          <div className="invalid-feedback">
                            {errors.secret?.message}
                          </div>
                        )}
                        {!errors.secret && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="category">
                          {t('columns.bbs.category')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('category')}`}
                          {...register('category', {
                            onChange: () => handleInputChange('category'),
                            onBlur: () => handleInputChange('category'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.category?.message && (
                          <div className="invalid-feedback">
                            {errors.category?.message}
                          </div>
                        )}
                        {!errors.category && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="link1">
                          {t('columns.bbs.link1')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('link1')}`}
                          {...register('link1', {
                            onChange: () => handleInputChange('link1'),
                            onBlur: () => handleInputChange('link1'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.link1?.message && (
                          <div className="invalid-feedback">
                            {errors.link1?.message}
                          </div>
                        )}
                        {!errors.link1 && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="link2">
                          {t('columns.bbs.link2')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('link2')}`}
                          {...register('link2', {
                            onChange: () => handleInputChange('link2'),
                            onBlur: () => handleInputChange('link2'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.link2?.message && (
                          <div className="invalid-feedback">
                            {errors.link2?.message}
                          </div>
                        )}
                        {!errors.link2 && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="isUse">
                          {t('columns.bbs.isUse')}
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
                          {t('columns.bbs.isVisible')}
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
                        <FileUploader
                          dir={'bbs'}
                          pid={watch('uid')}
                          onChange={(images, removed) => {
                            setUploadedImages(images); // ✅ 남아있는 이미지들
                            setDeletedImages(removed ?? []); // ✅ 삭제된 이미지들
                          }}
                          initialFiles={uploadedImages}
                          mode="edit"
                        />
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
                    href={`${getRouteUrl('bbs.index', locale)}?${searchParams.toString()}`}
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
