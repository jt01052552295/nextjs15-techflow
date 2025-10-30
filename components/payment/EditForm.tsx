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
import { UpdateType, UpdateSchema } from '@/actions/payment/update/schema';
import { updateAction } from '@/actions/payment/update';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/payment/modal/ResultConfirm';
import { IPayment } from '@/types/payment';
import { useSearchParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { paymentQK } from '@/lib/queryKeys/payment';
import { showAction } from '@/actions/payment/show';
import UserSelect from '../common/UserSelect';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: IPaymentPart;
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
    queryKey: paymentQK.detail(uid),
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
    setValue('userId', data.userId ?? '', { shouldValidate: true });

    setValue('name', data.name ?? '', { shouldValidate: true });
    setValue('customerUid', data.customerUid ?? '', { shouldValidate: true });
    setValue('billingKey', data.billingKey ?? '', { shouldValidate: true });
    setValue('method', data.method ?? 'card', { shouldValidate: true });
    setValue('name', data.name ?? '', { shouldValidate: true });
    setValue('cardName', data.cardName ?? '', { shouldValidate: true });
    setValue('cardNumber1', data.cardNumber1 ?? '', { shouldValidate: true });
    setValue('cardNumber2', data.cardNumber2 ?? '', { shouldValidate: true });
    setValue('cardNumber3', data.cardNumber3 ?? '', { shouldValidate: true });
    setValue('cardNumber4', data.cardNumber4 ?? '', { shouldValidate: true });
    setValue('cardMM', data.cardMM ?? '', { shouldValidate: true });
    setValue('cardYY', data.cardYY ?? '', { shouldValidate: true });
    setValue('cardPwd', data.cardPwd ?? '', { shouldValidate: true });
    setValue('cardCvc', data.cardCvc ?? '', { shouldValidate: true });
    setValue('juminOrCorp', data.juminOrCorp ?? '', { shouldValidate: true });
    setValue('isRepresent', !!data.isRepresent);

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
          const updatedItem = response.data as IPayment;

          toast.success(response.message);
          // reset();
          setIsResultOpen(true);

          queryClient.setQueryData(
            paymentQK.detail(updatedItem.uid),
            updatedItem,
          );
          queryClient.invalidateQueries({ queryKey: ['payment', 'list'] });
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
                          {t('columns.payment.userId')}
                        </label>

                        <UserSelect
                          name="userId"
                          control={control}
                          label={t('columns.payment.userId')}
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
                          {t('columns.payment.name')}
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
                        <label className="form-label" htmlFor="method">
                          {t('columns.payment.method')}
                        </label>
                        <select
                          className={`form-select ${getInputClass('method')}`}
                          {...register('method', {
                            onChange: () => handleInputChange('method'),
                          })}
                          disabled={isPending}
                        >
                          <option value="card">카드</option>
                          <option value="vbank">가상계좌</option>
                          <option value="trans">계좌이체</option>
                        </select>
                        {errors.method?.message && (
                          <div className="invalid-feedback">
                            {errors.method?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="customerUid">
                          {t('columns.payment.customerUid')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('customerUid')}`}
                          {...register('customerUid', {
                            onChange: () => handleInputChange('customerUid'),
                            onBlur: () => handleInputChange('customerUid'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.customerUid?.message && (
                          <div className="invalid-feedback">
                            {errors.customerUid?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="billingKey">
                          {t('columns.payment.billingKey')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('billingKey')}`}
                          {...register('billingKey', {
                            onChange: () => handleInputChange('billingKey'),
                            onBlur: () => handleInputChange('billingKey'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.billingKey?.message && (
                          <div className="invalid-feedback">
                            {errors.billingKey?.message}
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
                        <label className="form-label" htmlFor="cardName">
                          {t('columns.payment.cardName')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('cardName')}`}
                          {...register('cardName', {
                            onChange: () => handleInputChange('cardName'),
                            onBlur: () => handleInputChange('cardName'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.cardName?.message && (
                          <div className="invalid-feedback">
                            {errors.cardName?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label">
                          {t('columns.payment.cardNumber1')}
                        </label>
                        <div className="row g-2">
                          <div className="col-3">
                            <input
                              type="text"
                              className={`form-control ${getInputClass('cardNumber1')}`}
                              {...register('cardNumber1', {
                                onChange: () =>
                                  handleInputChange('cardNumber1'),
                                onBlur: () => handleInputChange('cardNumber1'),
                              })}
                              readOnly={isPending}
                              maxLength={4}
                            />
                          </div>
                          <div className="col-3">
                            <input
                              type="text"
                              className={`form-control ${getInputClass('cardNumber2')}`}
                              {...register('cardNumber2', {
                                onChange: () =>
                                  handleInputChange('cardNumber2'),
                                onBlur: () => handleInputChange('cardNumber2'),
                              })}
                              readOnly={isPending}
                              maxLength={4}
                            />
                          </div>
                          <div className="col-3">
                            <input
                              type="text"
                              className={`form-control ${getInputClass('cardNumber3')}`}
                              {...register('cardNumber3', {
                                onChange: () =>
                                  handleInputChange('cardNumber3'),
                                onBlur: () => handleInputChange('cardNumber3'),
                              })}
                              readOnly={isPending}
                              maxLength={4}
                            />
                          </div>
                          <div className="col-3">
                            <input
                              type="text"
                              className={`form-control ${getInputClass('cardNumber4')}`}
                              {...register('cardNumber4', {
                                onChange: () =>
                                  handleInputChange('cardNumber4'),
                                onBlur: () => handleInputChange('cardNumber4'),
                              })}
                              readOnly={isPending}
                              placeholder="****"
                              maxLength={4}
                            />
                          </div>
                        </div>
                        {(errors.cardNumber1 ||
                          errors.cardNumber2 ||
                          errors.cardNumber3 ||
                          errors.cardNumber4) && (
                          <div className="invalid-feedback d-block">
                            {errors.cardNumber1?.message ||
                              errors.cardNumber2?.message ||
                              errors.cardNumber3?.message ||
                              errors.cardNumber4?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label">
                          {t('columns.payment.cardMM')} /{' '}
                          {t('columns.payment.cardYY')}
                        </label>
                        <div className="row g-2">
                          <div className="col-6">
                            <input
                              type="text"
                              className={`form-control ${getInputClass('cardMM')}`}
                              {...register('cardMM', {
                                onChange: () => handleInputChange('cardMM'),
                                onBlur: () => handleInputChange('cardMM'),
                              })}
                              readOnly={isPending}
                              maxLength={2}
                            />
                            {errors.cardMM?.message && (
                              <div className="invalid-feedback d-block">
                                {errors.cardMM?.message}
                              </div>
                            )}
                          </div>
                          <div className="col-6">
                            <input
                              type="text"
                              className={`form-control ${getInputClass('cardYY')}`}
                              {...register('cardYY', {
                                onChange: () => handleInputChange('cardYY'),
                                onBlur: () => handleInputChange('cardYY'),
                              })}
                              readOnly={isPending}
                              maxLength={4}
                            />
                            {errors.cardYY?.message && (
                              <div className="invalid-feedback d-block">
                                {errors.cardYY?.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="cardPwd">
                          {t('columns.payment.cardPwd')}
                        </label>
                        <input
                          type="password"
                          className={`form-control ${getInputClass('cardPwd')}`}
                          {...register('cardPwd', {
                            onChange: () => handleInputChange('cardPwd'),
                            onBlur: () => handleInputChange('cardPwd'),
                          })}
                          readOnly={isPending}
                          maxLength={2}
                        />
                        {errors.cardPwd?.message && (
                          <div className="invalid-feedback">
                            {errors.cardPwd?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="cardCvc">
                          {t('columns.payment.cardCvc')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('cardCvc')}`}
                          {...register('cardCvc', {
                            onChange: () => handleInputChange('cardCvc'),
                            onBlur: () => handleInputChange('cardCvc'),
                          })}
                          readOnly={isPending}
                          maxLength={4}
                        />
                        {errors.cardCvc?.message && (
                          <div className="invalid-feedback">
                            {errors.cardCvc?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="juminOrCorp">
                          {t('columns.payment.juminOrCorp')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('juminOrCorp')}`}
                          {...register('juminOrCorp', {
                            onChange: () => handleInputChange('juminOrCorp'),
                            onBlur: () => handleInputChange('juminOrCorp'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.juminOrCorp?.message && (
                          <div className="invalid-feedback">
                            {errors.juminOrCorp?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="isRepresent"
                            {...register('isRepresent')}
                            disabled={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isRepresent"
                          >
                            {t('columns.payment.isRepresent')}
                          </label>
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="isUse">
                          {t('columns.todos.isUse')}
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
                          {t('columns.todos.isVisible')}
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
                    href={`${getRouteUrl('payment.index', locale)}?${searchParams.toString()}`}
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
