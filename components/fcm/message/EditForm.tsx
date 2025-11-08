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
import { UpdateType, UpdateSchema } from '@/actions/fcm/message/update/schema';
import { updateAction } from '@/actions/fcm/message/update';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/fcm/message/modal/ResultConfirm';
import { IFcmMessage } from '@/types/fcm/message';
import { useSearchParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { fcmMessageQK } from '@/lib/queryKeys/fcm/message';
import { showAction } from '@/actions/fcm/message/show';
import UserSelect from '@/components/common/UserSelect';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: IFcmMessagePart;
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
    queryKey: fcmMessageQK.detail(uid),
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

    setValue('uid', data.uid ?? '', { shouldValidate: true });

    setValue('userId', data.userId ?? '', { shouldValidate: true });
    setValue('platform', data.platform ?? '', { shouldValidate: true });
    setValue('templateId', data.templateId ?? '', { shouldValidate: true });
    setValue('fcmToken', data.fcmToken ?? '', { shouldValidate: true });
    setValue('title', data.title ?? '', { shouldValidate: true });
    setValue('body', data.body ?? '', { shouldValidate: true });

    setValue('otCode', data.otCode ?? '', { shouldValidate: true });
    setValue('url', data.url ?? '', { shouldValidate: true });

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
          const updatedItem = response.data as IFcmMessage;

          toast.success(response.message);
          // reset();
          setIsResultOpen(true);

          queryClient.setQueryData(
            fcmMessageQK.detail(updatedItem.uid),
            updatedItem,
          );
          queryClient.invalidateQueries({ queryKey: ['fcmMessage', 'list'] });
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
                        <label className="form-label" htmlFor="userId">
                          {t('columns.fcmMessage.userId')}
                        </label>
                        <UserSelect
                          name="userId"
                          control={control}
                          label={t('columns.fcmMessage.userId')}
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
                        <label className="form-label" htmlFor="platform">
                          {t('columns.fcmMessage.platform')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('platform')}`}
                          {...register('platform', {
                            onChange: () => handleInputChange('platform'),
                            onBlur: () => handleInputChange('platform'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.platform?.message && (
                          <div className="invalid-feedback">
                            {errors.platform?.message}
                          </div>
                        )}
                        {!errors.platform && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="templateId">
                          {t('columns.fcmMessage.templateId')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('templateId')}`}
                          {...register('templateId', {
                            onChange: () => handleInputChange('templateId'),
                            onBlur: () => handleInputChange('templateId'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.templateId?.message && (
                          <div className="invalid-feedback">
                            {errors.templateId?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="fcmToken">
                          {t('columns.fcmMessage.fcmToken')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('fcmToken')}`}
                          {...register('fcmToken', {
                            onChange: () => handleInputChange('fcmToken'),
                            onBlur: () => handleInputChange('fcmToken'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.fcmToken?.message && (
                          <div className="invalid-feedback">
                            {errors.fcmToken?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="otCode">
                          {t('columns.fcmMessage.otCode')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('otCode')}`}
                          {...register('otCode', {
                            onChange: () => handleInputChange('otCode'),
                            onBlur: () => handleInputChange('otCode'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.otCode?.message && (
                          <div className="invalid-feedback">
                            {errors.otCode?.message}
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
                        <label className="form-label" htmlFor="title">
                          {t('columns.fcmMessage.title')}
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
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="body">
                          {t('columns.fcmMessage.body')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('body')}`}
                          {...register('body', {
                            onChange: () => handleInputChange('body'),
                            onBlur: () => handleInputChange('body'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.body?.message && (
                          <div className="invalid-feedback">
                            {errors.body?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="url">
                          {t('columns.fcmMessage.url')}
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
                    href={`${getRouteUrl('fcmMessages.index', locale)}?${searchParams.toString()}`}
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
