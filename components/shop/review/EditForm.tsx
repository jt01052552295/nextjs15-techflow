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
import { UpdateType, UpdateSchema } from '@/actions/shop/review/update/schema';
import { updateAction } from '@/actions/shop/review/update';
import {
  FormProvider,
  SubmitHandler,
  useForm,
  Controller,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/shop/review/modal/ResultConfirm';
import { IShopReview } from '@/types/shop/review';
import { useSearchParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { shopReviewQK } from '@/lib/queryKeys/shop/review';
import { showAction } from '@/actions/shop/review/show';
import FormTextField from '@/components/common/form/FormTextField';
import FormSwitch from '@/components/common/form/FormSwitch';

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
    queryKey: shopReviewQK.detail(uid),
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

    setValue('name', data.name ?? '', { shouldValidate: true });
    setValue('email', data.email ?? '', { shouldValidate: true });
    setValue('orderId', data.orderId ?? 0, { shouldValidate: true });
    setValue('itemId', data.itemId ?? 0, { shouldValidate: true });
    setValue('userId', data.userId ?? '', { shouldValidate: true });
    setValue('subject', data.subject ?? '', { shouldValidate: true });
    setValue('content', data.content ?? '', { shouldValidate: true });
    setValue('score', data.score ?? 5, { shouldValidate: true });

    setValue('isSecret', !!(data as any).isSecret);
    setValue('isAdmin', !!(data as any).isAdmin);
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
          const updatedItem = response.data as IShopReview;

          toast.success(response.message);
          // reset();
          setIsResultOpen(true);

          queryClient.setQueryData(
            shopReviewQK.detail(updatedItem.uid),
            updatedItem,
          );
          queryClient.invalidateQueries({ queryKey: ['shopReview', 'list'] });
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
                        <FormTextField
                          label={t('columns.shopReview.orderId')}
                          name="orderId"
                          register={register}
                          error={errors?.orderId}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('orderId')}
                          onBlur={() => handleInputChange('orderId')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopReview.itemId')}
                          name="itemId"
                          register={register}
                          error={errors?.itemId}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('itemId')}
                          onBlur={() => handleInputChange('itemId')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopReview.userId')}
                          name="userId"
                          register={register}
                          error={errors?.userId}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('userId')}
                          onBlur={() => handleInputChange('userId')}
                        />
                      </div>

                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopReview.subject')}
                          name="subject"
                          register={register}
                          error={errors?.subject}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('subject')}
                          onBlur={() => handleInputChange('subject')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopReview.content')}
                          name="content"
                          register={register}
                          error={errors?.content}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('content')}
                          onBlur={() => handleInputChange('content')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopReview.score')}
                          name="score"
                          register={register}
                          error={errors?.score}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('score')}
                          onBlur={() => handleInputChange('score')}
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
                        <FormTextField
                          label={t('columns.shopReview.name')}
                          name="name"
                          register={register}
                          error={errors?.name}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('name')}
                          onBlur={() => handleInputChange('name')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopReview.email')}
                          name="email"
                          register={register}
                          error={errors?.email}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('email')}
                          onBlur={() => handleInputChange('email')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormSwitch
                          label={t('columns.shopReview.isSecret')}
                          name={`isSecret` as any}
                          register={register}
                          error={errors?.isSecret}
                          switchLabel={t('common.yes')}
                          disabled={isPending}
                          onChange={() => handleInputChange(`isSecret`)}
                          onBlur={() => handleInputChange(`isSecret`)}
                        />
                      </div>
                      <div className="mb-2">
                        <FormSwitch
                          label={t('columns.shopReview.isAdmin')}
                          name={`isAdmin` as any}
                          register={register}
                          error={errors?.isAdmin}
                          switchLabel={t('common.yes')}
                          disabled={isPending}
                          onChange={() => handleInputChange(`isAdmin`)}
                          onBlur={() => handleInputChange(`isAdmin`)}
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
                    href={`${getRouteUrl('shopReview.index', locale)}?${searchParams.toString()}`}
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
