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
import { CreateType, CreateSchema } from '@/actions/company/create/schema';
import { createAction } from '@/actions/company/create';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/company/modal/ResultConfirm';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { KEPCO_CONTRACTS } from '@/constants';
import UserSelect from '@/components/common/UserSelect';

export default function CreateForm() {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);

  const CONTRACTS = KEPCO_CONTRACTS[locale];

  const methods = useForm<CreateType>({
    mode: 'onChange',
    resolver: zodResolver(CreateSchema(dictionary.common.form)),
    defaultValues: {
      uid: uuidv4(),
      userId: '',
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
          setIsResultOpen(true);

          queryClient.invalidateQueries({ queryKey: ['company', 'list'] });

          // 상세로 이동
          // const qs = searchParams.toString();
          // queryClient.setQueryData(companyQK.detail(newItem.uid), newItem);
          // const showUrl = getRouteUrl('todos.show', locale, { id: newItem.uid });
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
                        <label className="form-label" htmlFor="userId">
                          {t('columns.company.userId')}
                        </label>

                        <UserSelect
                          name="userId"
                          control={control}
                          label={t('columns.company.userId')}
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
                          {t('columns.company.name')}
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
                        <label className="form-label" htmlFor="address">
                          {t('columns.company.address')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('address')}`}
                          {...register('address', {
                            onChange: () => handleInputChange('address'),
                            onBlur: () => handleInputChange('address'),
                          })}
                          readOnly={isPending}
                        />

                        {errors.address?.message && (
                          <div className="invalid-feedback">
                            {errors.address?.message}
                          </div>
                        )}
                        {!errors.address && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="phone">
                          {t('columns.company.phone')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('phone')}`}
                          {...register('phone', {
                            onChange: () => handleInputChange('phone'),
                            onBlur: () => handleInputChange('phone'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.phone?.message && (
                          <div className="invalid-feedback">
                            {errors.phone?.message}
                          </div>
                        )}
                        {!errors.phone && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="email">
                          {t('columns.company.email')}
                        </label>

                        <input
                          type="email"
                          className={`form-control ${getInputClass('email')}`}
                          {...register('email', {
                            onChange: () => handleInputChange('email'),
                            onBlur: () => handleInputChange('email'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.email?.message && (
                          <div className="invalid-feedback">
                            {errors.email?.message}
                          </div>
                        )}
                        {!errors.email && (
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
                          {t('columns.company.custNo')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('custNo')}`}
                          {...register('custNo', {
                            onChange: () => handleInputChange('custNo'),
                            onBlur: () => handleInputChange('custNo'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.custNo?.message && (
                          <div className="invalid-feedback">
                            {errors.custNo?.message}
                          </div>
                        )}
                        {!errors.custNo && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="bizNo">
                          {t('columns.company.bizNo')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('bizNo')}`}
                          {...register('bizNo', {
                            onChange: () => handleInputChange('bizNo'),
                            onBlur: () => handleInputChange('bizNo'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.bizNo?.message && (
                          <div className="invalid-feedback">
                            {errors.bizNo?.message}
                          </div>
                        )}
                        {!errors.bizNo && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="corpNo">
                          {t('columns.company.corpNo')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('corpNo')}`}
                          {...register('corpNo', {
                            onChange: () => handleInputChange('corpNo'),
                            onBlur: () => handleInputChange('corpNo'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.corpNo?.message && (
                          <div className="invalid-feedback">
                            {errors.corpNo?.message}
                          </div>
                        )}
                        {!errors.corpNo && (
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
                    href={`${getRouteUrl('company.index', locale)}?${searchParams.toString()}`}
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
