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
import { UpdateType, UpdateSchema } from '@/actions/setting/update/schema';
import { updateAction } from '@/actions/setting/update';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/setting/modal/ResultConfirm';
import { ISetting } from '@/types/setting';
import { useSearchParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { settingQK } from '@/lib/queryKeys/setting';
import { showAction } from '@/actions/setting/show';
import { KEPCO_CONTRACTS } from '@/constants';
import UserSelect from '../common/UserSelect';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: ISettingPart;
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
    queryKey: settingQK.detail(uid),
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

  const CONTRACTS = KEPCO_CONTRACTS[locale];

  const seedFormFromData = useCallback(async () => {
    if (!data) return;
    if (seededRef.current) return;
    // console.log('edit form', props.uid)
    // console.log(props.rs)

    setValue('uid', data.uid ?? '', { shouldValidate: true });
    setValue('cid', data.cid ?? '', { shouldValidate: true });
    setValue('userId', data.userId ?? '', { shouldValidate: true });
    setValue('gubun', data.gubun ?? '', { shouldValidate: true });
    setValue('kepcoContract', data.kepcoContract ?? '', {
      shouldValidate: true,
    });
    setValue('kw', (data as any).kw ?? '');
    setValue('powerFactor', (data as any).powerFactor ?? '');
    setValue('readingDate', (data as any).readingDate ?? '');
    setValue('efficiency', (data as any).efficiency ?? '');

    setValue('pushPoint', !!(data as any).pushPoint);
    setValue('pushBill', !!(data as any).pushBill);
    setValue('kepcoApi', !!(data as any).kepcoApi);
    setValue('kepcoMonthApi', !!(data as any).kepcoMonthApi);

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
          const updatedItem = response.data as ISetting;

          toast.success(response.message);
          // reset();
          setIsResultOpen(true);

          queryClient.setQueryData(
            settingQK.detail(updatedItem.uid),
            updatedItem,
          );
          queryClient.invalidateQueries({ queryKey: ['setting', 'list'] });
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
                        <label className="form-label" htmlFor="userId">
                          {t('columns.setting.userId')}
                        </label>

                        <UserSelect
                          name="userId"
                          control={control}
                          label={t('columns.setting.userId')}
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
                        <label className="form-label" htmlFor="gubun">
                          {t('columns.setting.gubun')}
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
                        <label className="form-label" htmlFor="kepcoContract">
                          {t('columns.setting.kepcoContract')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('kepcoContract')}`}
                          defaultValue=""
                          {...register('kepcoContract', {
                            onChange: () => handleInputChange('kepcoContract'),
                            onBlur: () => handleInputChange('kepcoContract'),
                          })}
                        >
                          <option value="">{t('common.choose')}</option>
                          {Object.entries(CONTRACTS).map(
                            ([key, value]: any) => (
                              <option key={key} value={key}>
                                {value}
                              </option>
                            ),
                          )}
                        </select>

                        {errors.kepcoContract?.message && (
                          <div className="invalid-feedback">
                            {errors.kepcoContract?.message}
                          </div>
                        )}
                        {!errors.kepcoContract && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="kw">
                          {t('columns.setting.kw')}
                        </label>

                        <input
                          type="number"
                          className={`form-control ${getInputClass('kw')}`}
                          {...register('kw', {
                            onChange: () => handleInputChange('kw'),
                            onBlur: () => handleInputChange('kw'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.kw?.message && (
                          <div className="invalid-feedback">
                            {errors.kw?.message}
                          </div>
                        )}
                        {!errors.kw && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="powerFactor">
                          {t('columns.setting.powerFactor')}
                        </label>

                        <input
                          type="number"
                          className={`form-control ${getInputClass('powerFactor')}`}
                          {...register('powerFactor', {
                            onChange: () => handleInputChange('powerFactor'),
                            onBlur: () => handleInputChange('powerFactor'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.powerFactor?.message && (
                          <div className="invalid-feedback">
                            {errors.powerFactor?.message}
                          </div>
                        )}
                        {!errors.powerFactor && (
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
                          {t('columns.setting.readingDate')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('readingDate')}`}
                          defaultValue=""
                          {...register('readingDate', {
                            onChange: () => handleInputChange('readingDate'),
                            onBlur: () => handleInputChange('readingDate'),
                          })}
                        >
                          <option value="">{t('common.choose')}</option>
                          {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                        {errors.readingDate?.message && (
                          <div className="invalid-feedback">
                            {errors.readingDate?.message}
                          </div>
                        )}
                        {!errors.readingDate && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="efficiency">
                          {t('columns.setting.efficiency')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('efficiency')}`}
                          {...register('efficiency', {
                            onChange: () => handleInputChange('efficiency'),
                            onBlur: () => handleInputChange('efficiency'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.efficiency?.message && (
                          <div className="invalid-feedback">
                            {errors.efficiency?.message}
                          </div>
                        )}
                        {!errors.efficiency && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="pushPoint">
                          {t('columns.setting.pushPoint')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('pushPoint')}`}
                            type="checkbox"
                            role="switch"
                            id="pushPoint"
                            {...register('pushPoint', {
                              onChange: () => handleInputChange('pushPoint'),
                              onBlur: () => handleInputChange('pushPoint'),
                            })}
                            readOnly={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="pushPoint"
                          >
                            {t('common.usage')}
                          </label>
                        </div>

                        {errors.pushPoint?.message && (
                          <div className="invalid-feedback">
                            {errors.pushPoint?.message}
                          </div>
                        )}
                        {!errors.pushPoint && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="pushBill">
                          {t('columns.setting.pushBill')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('pushBill')}`}
                            type="checkbox"
                            role="switch"
                            id="pushBill"
                            {...register('pushBill', {
                              onChange: () => handleInputChange('pushBill'),
                              onBlur: () => handleInputChange('pushBill'),
                            })}
                            readOnly={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="pushBill"
                          >
                            {t('common.usage')}
                          </label>
                        </div>

                        {errors.pushBill?.message && (
                          <div className="invalid-feedback">
                            {errors.pushBill?.message}
                          </div>
                        )}
                        {!errors.pushBill && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="kepcoApi">
                          {t('columns.setting.kepcoApi')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('kepcoApi')}`}
                            type="checkbox"
                            role="switch"
                            id="kepcoApi"
                            {...register('kepcoApi', {
                              onChange: () => handleInputChange('kepcoApi'),
                              onBlur: () => handleInputChange('kepcoApi'),
                            })}
                            readOnly={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="kepcoApi"
                          >
                            {t('common.usage')}
                          </label>
                        </div>

                        {errors.kepcoApi?.message && (
                          <div className="invalid-feedback">
                            {errors.kepcoApi?.message}
                          </div>
                        )}
                        {!errors.kepcoApi && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="kepcoMonthApi">
                          {t('columns.setting.kepcoMonthApi')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('kepcoMonthApi')}`}
                            type="checkbox"
                            role="switch"
                            id="kepcoMonthApi"
                            {...register('kepcoMonthApi', {
                              onChange: () =>
                                handleInputChange('kepcoMonthApi'),
                              onBlur: () => handleInputChange('kepcoMonthApi'),
                            })}
                            readOnly={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="kepcoMonthApi"
                          >
                            {t('common.usage')}
                          </label>
                        </div>

                        {errors.kepcoMonthApi?.message && (
                          <div className="invalid-feedback">
                            {errors.kepcoMonthApi?.message}
                          </div>
                        )}
                        {!errors.kepcoMonthApi && (
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
                    href={`${getRouteUrl('setting.index', locale)}?${searchParams.toString()}`}
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
