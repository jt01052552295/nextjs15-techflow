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
import { UpdateType, UpdateSchema } from '@/actions/blog/comment/update/schema';
import { updateAction } from '@/actions/blog/comment/update';
import {
  FormProvider,
  SubmitHandler,
  useForm,
  Controller,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/blog/comment/modal/ResultConfirm';
import { IBlogPostComment } from '@/types/blog/comment';
import { useSearchParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { blogPostCommentQK } from '@/lib/queryKeys/blog/comment';
import { showAction } from '@/actions/blog/comment/show';
import FormSelect, { SelectOption } from '@/components/common/form/FormSelect';
import FormTextarea from '@/components/common/form/FormTextarea';
import FormTextField from '@/components/common/form/FormTextField';
import FormSwitch from '@/components/common/form/FormSwitch';
import UserSelect from '@/components/common/UserSelect';
import { getPostCommentStatusOptions } from '@/constants';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: IBlogPostCommentPart;
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

  const statusOptions = getPostCommentStatusOptions(locale);

  const { data, isLoading, error } = useQuery({
    queryKey: blogPostCommentQK.detail(uid),
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
    formState: { errors, isValid, dirtyFields },
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
    setValue('userId', data.userId ?? '', { shouldValidate: true });
    setValue('content', data.content ?? '', { shouldValidate: true });
    setValue('author', data.author ?? '', { shouldValidate: true });
    setValue('postId', data.postId ?? '', { shouldValidate: true });
    setValue('status', data.status ?? '', { shouldValidate: true });
    setValue('ipAddress', data.ipAddress ?? '', { shouldValidate: true });
    setValue('parentIdx', (data as any).parentIdx ?? null, {
      shouldValidate: true,
    });
    setValue('depth', (data as any).depth ?? 1, { shouldValidate: true });

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
          const updatedItem = response.data as IBlogPostComment;

          toast.success(response.message);
          // reset();
          setIsResultOpen(true);

          queryClient.setQueryData(
            blogPostCommentQK.detail(updatedItem.uid),
            updatedItem,
          );
          queryClient.invalidateQueries({
            queryKey: ['blogPostComment', 'list'],
          });
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
                        <UserSelect
                          name="userId"
                          control={control}
                          label={t('columns.shopReview.userId')}
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
                        <FormTextarea
                          label={t('columns.blogPostComment.content')}
                          name="content"
                          register={register}
                          error={errors?.content}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.content}
                          readOnly={isPending}
                          minRows={1}
                          maxRows={10}
                          onChange={() => handleInputChange('content')}
                          onBlur={() => handleInputChange('content')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.blogPostComment.author')}
                          name="author"
                          register={register}
                          error={errors?.author}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.author}
                          readOnly={isPending}
                          onChange={() => handleInputChange('author')}
                          onBlur={() => handleInputChange('author')}
                        />
                      </div>

                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.blogPostComment.postId')}
                          name="postId"
                          register={register}
                          error={errors?.postId}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.postId}
                          readOnly={isPending}
                          onChange={() => handleInputChange('postId')}
                          onBlur={() => handleInputChange('postId')}
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
                        <FormSelect
                          label={t('columns.blogPostComment.status')}
                          name="status"
                          register={register}
                          options={statusOptions}
                          error={errors?.status}
                          validMessage={t('common.form.valid')}
                          placeholder={t('common.choose')}
                          onChange={() => handleInputChange('status')}
                          onBlur={() => handleInputChange('status')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormSwitch
                          label={t('columns.blogPostComment.isUse')}
                          name={`isUse` as any}
                          register={register}
                          error={errors?.isUse}
                          isDirty={!!dirtyFields.isUse}
                          switchLabel={t('common.yes')}
                          disabled={isPending}
                          onChange={() => handleInputChange(`isUse`)}
                          onBlur={() => handleInputChange(`isUse`)}
                        />
                      </div>
                      <div className="mb-2">
                        <FormSwitch
                          label={t('columns.blogPostComment.isVisible')}
                          name={`isVisible` as any}
                          register={register}
                          error={errors?.isVisible}
                          isDirty={!!dirtyFields.isVisible}
                          switchLabel={t('common.yes')}
                          disabled={isPending}
                          onChange={() => handleInputChange(`isVisible`)}
                          onBlur={() => handleInputChange(`isVisible`)}
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
                    href={`${getRouteUrl('blogComment.index', locale)}?${searchParams.toString()}`}
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
