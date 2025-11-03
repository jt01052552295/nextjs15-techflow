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
import { CreateType, CreateSchema } from '@/actions/fcm/token/create/schema';
import { createAction } from '@/actions/fcm/token/create';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/fcm/token/modal/ResultConfirm';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

export default function CreateForm() {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);

  const methods = useForm<CreateType>({
    mode: 'onChange',
    resolver: zodResolver(CreateSchema(dictionary.common.form)),
    defaultValues: {
      uid: uuidv4(),
      userId: '',
      token: '',
      platform: 'android',
      deviceId: '',
      appVersion: '',
      deviceInfo: '',
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

          queryClient.invalidateQueries({ queryKey: ['fcmToken', 'list'] });
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
                          {t('columns.fcmToken.userId')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('userId')}`}
                          {...register('userId', {
                            onChange: () => handleInputChange('userId'),
                            onBlur: () => handleInputChange('userId'),
                          })}
                          readOnly={isPending}
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
                        <label className="form-label" htmlFor="token">
                          {t('columns.fcmToken.token')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('token')}`}
                          {...register('token', {
                            onChange: () => handleInputChange('token'),
                            onBlur: () => handleInputChange('token'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.token?.message && (
                          <div className="invalid-feedback">
                            {errors.token?.message}
                          </div>
                        )}
                        {!errors.token && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="platform">
                          {t('columns.fcmToken.platform')}
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
                        <label className="form-label" htmlFor="deviceId">
                          {t('columns.fcmToken.deviceId')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('deviceId')}`}
                          {...register('deviceId', {
                            onChange: () => handleInputChange('deviceId'),
                            onBlur: () => handleInputChange('deviceId'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.deviceId?.message && (
                          <div className="invalid-feedback">
                            {errors.deviceId?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="appVersion">
                          {t('columns.fcmToken.appVersion')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('appVersion')}`}
                          {...register('appVersion', {
                            onChange: () => handleInputChange('appVersion'),
                            onBlur: () => handleInputChange('appVersion'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.appVersion?.message && (
                          <div className="invalid-feedback">
                            {errors.appVersion?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="deviceInfo">
                          {t('columns.fcmToken.deviceInfo')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('deviceInfo')}`}
                          {...register('deviceInfo', {
                            onChange: () => handleInputChange('deviceInfo'),
                            onBlur: () => handleInputChange('deviceInfo'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.deviceInfo?.message && (
                          <div className="invalid-feedback">
                            {errors.deviceInfo?.message}
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
                    href={`${getRouteUrl('fcmTokens.index', locale)}?${searchParams.toString()}`}
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
