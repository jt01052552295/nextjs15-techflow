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
import { UpdateType, UpdateSchema } from '@/actions/setup/update/schema';
import { updateAction } from '@/actions/setup/update';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/setup/modal/ResultConfirm';
import { IAddress } from '@/types/setup';
import { useSearchParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { setupQK } from '@/lib/queryKeys/setup';
import { showAction } from '@/actions/setup/show';
import UserSelect from '../common/UserSelect';
import {
  getDeliveryMemoOptions,
  getDeliveryMemoLabel,
  DeliveryMemoCode,
} from '@/constants';
import AddressInput from '@/components/daum/AddressInput';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: IAddressPart;
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
    queryKey: setupQK.detail(uid),
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

  const options = getDeliveryMemoOptions(locale);

  const seedFormFromData = useCallback(async () => {
    if (!data) return;
    if (seededRef.current) return;

    setValue('uid', data.uid ?? '', { shouldValidate: true });
    setValue('userId', data.userId ?? '', { shouldValidate: true });

    setValue('title', data.title ?? '', { shouldValidate: true });
    setValue('name', data.name ?? '', { shouldValidate: true });
    setValue('zipcode', data.zipcode ?? '', { shouldValidate: true });
    setValue('addr1', data.addr1 ?? '', { shouldValidate: true });
    setValue('addr2', data.addr2 ?? '', { shouldValidate: true });
    setValue('addrJibeon', data.addrJibeon ?? '', { shouldValidate: true });
    setValue('sido', data.sido ?? '', { shouldValidate: true });
    setValue('gugun', data.gugun ?? '', { shouldValidate: true });
    setValue('dong', data.dong ?? '', { shouldValidate: true });
    setValue('latNum', data.latNum ?? null, { shouldValidate: true });
    setValue('lngNum', data.lngNum ?? null, { shouldValidate: true });
    setValue('hp', data.hp ?? '', { shouldValidate: true });
    setValue('tel', data.tel ?? '', { shouldValidate: true });
    setValue('isDefault', !!data.isDefault);
    setValue('rmemo', data.rmemo ?? 'CALL_BEFORE', { shouldValidate: true });
    setValue('rmemoTxt', data.rmemoTxt ?? null, { shouldValidate: true });
    setValue('doorPwd', data.doorPwd ?? null, { shouldValidate: true });

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
          const updatedItem = response.data as IAddress;

          toast.success(response.message);
          // reset();
          setIsResultOpen(true);

          queryClient.setQueryData(
            setupQK.detail(updatedItem.uid),
            updatedItem,
          );
          queryClient.invalidateQueries({ queryKey: ['setup', 'list'] });
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
                          {t('columns.setup.userId')}
                        </label>

                        <UserSelect
                          name="userId"
                          control={control}
                          label={t('columns.setup.userId')}
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
                        <label className="form-label" htmlFor="title">
                          {t('columns.setup.title')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('title')}`}
                          {...register('title', {
                            onChange: () => handleInputChange('title'),
                            onBlur: () => handleInputChange('title'),
                          })}
                          readOnly={isPending}
                          placeholder="배송지명"
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
                        <label className="form-label" htmlFor="name">
                          {t('columns.setup.name')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('name')}`}
                          {...register('name', {
                            onChange: () => handleInputChange('name'),
                            onBlur: () => handleInputChange('name'),
                          })}
                          readOnly={isPending}
                          placeholder="수령인명"
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
                      <div>
                        <AddressInput
                          zipcodeValue={watch('zipcode') || ''}
                          addr1Value={watch('addr1') || ''}
                          addr2Value={watch('addr2') || ''}
                          addrJibeonValue={watch('addrJibeon') || ''}
                          sidoValue={watch('sido') || ''}
                          gugunValue={watch('gugun') || ''}
                          dongValue={watch('dong') || ''}
                          onZipcodeChange={(value) => {
                            setValue('zipcode', value, {
                              shouldValidate: true,
                            });
                            handleInputChange('zipcode');
                          }}
                          onAddr1Change={(value) => {
                            setValue('addr1', value, { shouldValidate: true });
                            handleInputChange('addr1');
                          }}
                          onAddr2Change={(value) => {
                            setValue('addr2', value, { shouldValidate: true });
                            handleInputChange('addr2');
                          }}
                          onAddrJibeonChange={(value) => {
                            setValue('addrJibeon', value);
                            handleInputChange('addrJibeon');
                          }}
                          onSidoChange={(value) => {
                            setValue('sido', value);
                            handleInputChange('sido');
                          }}
                          onGugunChange={(value) => {
                            setValue('gugun', value);
                            handleInputChange('gugun');
                          }}
                          onDongChange={(value) => {
                            setValue('dong', value);
                            handleInputChange('dong');
                          }}
                          disabled={isPending}
                          zipcodeError={errors.zipcode?.message}
                          addr1Error={errors.addr1?.message}
                          addr2Error={errors.addr2?.message}
                          t={t}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="hp">
                          {t('columns.setup.hp')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('hp')}`}
                          {...register('hp', {
                            onChange: () => handleInputChange('hp'),
                            onBlur: () => handleInputChange('hp'),
                          })}
                          readOnly={isPending}
                          placeholder="휴대폰번호"
                        />
                        {errors.hp?.message && (
                          <div className="invalid-feedback">
                            {errors.hp?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="tel">
                          {t('columns.setup.tel')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('tel')}`}
                          {...register('tel', {
                            onChange: () => handleInputChange('tel'),
                            onBlur: () => handleInputChange('tel'),
                          })}
                          readOnly={isPending}
                          placeholder="전화번호"
                        />
                        {errors.tel?.message && (
                          <div className="invalid-feedback">
                            {errors.tel?.message}
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
                        <label className="form-label" htmlFor="rmemo">
                          {t('columns.setup.rmemo')}
                        </label>
                        <select
                          className={`form-select ${getInputClass('rmemo')}`}
                          {...register('rmemo', {
                            onChange: () => handleInputChange('rmemo'),
                          })}
                          disabled={isPending}
                        >
                          {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {errors.rmemo?.message && (
                          <div className="invalid-feedback">
                            {errors.rmemo?.message}
                          </div>
                        )}
                      </div>
                      {watch('rmemo') === 'CUSTOM' && (
                        <div className="mb-2">
                          <label className="form-label" htmlFor="rmemoTxt">
                            {t('columns.setup.rmemoTxt')}
                          </label>
                          <input
                            type="text"
                            className={`form-control ${getInputClass('rmemoTxt')}`}
                            {...register('rmemoTxt', {
                              onChange: () => handleInputChange('rmemoTxt'),
                              onBlur: () => handleInputChange('rmemoTxt'),
                            })}
                            readOnly={isPending}
                          />
                          {errors.rmemoTxt?.message && (
                            <div className="invalid-feedback">
                              {errors.rmemoTxt?.message}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="mb-2">
                        <label className="form-label" htmlFor="doorPwd">
                          {t('columns.setup.doorPwd')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('doorPwd')}`}
                          {...register('doorPwd', {
                            onChange: () => handleInputChange('doorPwd'),
                            onBlur: () => handleInputChange('doorPwd'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.doorPwd?.message && (
                          <div className="invalid-feedback">
                            {errors.doorPwd?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="isDefault"
                            {...register('isDefault')}
                            disabled={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isDefault"
                          >
                            {t('columns.setup.isDefault')}
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
                    href={`${getRouteUrl('setup.index', locale)}?${searchParams.toString()}`}
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
