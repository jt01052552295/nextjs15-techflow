'use client';
import {
  useEffect,
  useState,
  useTransition,
  useCallback,
  MouseEvent,
  FormEvent,
  useRef,
  ChangeEventHandler,
} from 'react';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/components/context/LanguageContext';
import { withdrawSchema, WithdrawType } from '@/actions/auth/withdraw/schema';
import { autWithdrawAction } from '@/actions/auth/withdraw';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import useFormUtils from '@/hooks/useFormUtils';
import { useAuth } from '../context/AuthContext';

const WithdrawForm = () => {
  const { dictionary, locale, t } = useLanguage();
  const router = useRouter();

  const { user, refreshUser, userProfiles, updateUserProfiles } = useAuth();

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');

  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    getValues,
    trigger,
    watch,
    reset,
  } = useForm<WithdrawType>({
    mode: 'onChange',
    resolver: zodResolver(withdrawSchema(dictionary.common.form)),
  });

  useEffect(() => {
    if (user) {
      setValue('id', user.id, { shouldValidate: true });
      setValue('email', user.email, { shouldValidate: true });
      setValue('name', user.name, { shouldValidate: true });
      setValue('nick', user.nick, { shouldValidate: true });
      setValue('phone', user.phone, { shouldValidate: true });
      setValue('isSignout', user.isSignout === true);
    }
  }, [user, setValue]);

  const { handleInputChange, getInputClass } = useFormUtils<WithdrawType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const formAction: SubmitHandler<WithdrawType> = (data) => {
    startTransition(async () => {
      try {
        const response = await autWithdrawAction(data, locale);
        if (response.status == 'success') {
          toast.success(response.message);
          refreshUser();
        } else if (response.status == 'error') {
          // toast.error(response.message);
          setErrorMessage(response.message);
        }
        // toast.success(`로그인성공`);
      } catch (error) {
        console.error(error);
        toast.error(t('common.unknown_error'));
      }
    });
  };

  const formReset = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    reset();
  };

  return (
    <div className="row justify-content-center">
      <form className="col-md-12" onSubmit={handleSubmit(formAction)}>
        <input type="hidden" {...register('id')} />
        <input type="hidden" {...register('email')} />
        <div className="card">
          <div className="card-header">
            <h5 className="card-title m-0">{t('common.basic_info')}</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-12 col-lg-6">
                <div className="mb-3">
                  <label className="form-label">{t('columns.user.name')}</label>
                  <div className="input-group has-validation">
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
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('columns.user.nick')}</label>
                  <div className="input-group has-validation">
                    <input
                      type="text"
                      className={`form-control ${getInputClass('nick')}`}
                      {...register('nick', {
                        onChange: () => handleInputChange('nick'),
                        onBlur: () => handleInputChange('nick'),
                      })}
                      readOnly={isPending}
                    />
                    {errors.nick?.message && (
                      <div className="invalid-feedback">
                        {errors.nick?.message}
                      </div>
                    )}
                    {!errors.nick && (
                      <div className="valid-feedback">
                        {t('common.form.valid')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    {t('columns.user.phone')}
                  </label>
                  <div className="input-group has-validation">
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
                </div>
              </div>
              <div className="col-md-12 col-lg-6">
                <div className="mb-3">
                  <label className="form-label" htmlFor="isSignout">
                    {t('columns.user.isSignout')}
                  </label>
                  <div className="input-group ">
                    <div className="form-check form-switch">
                      <input
                        className={`form-check-input`}
                        type="checkbox"
                        role="switch"
                        id="isSignout"
                        {...register('isSignout')}
                      />
                      <label className="form-check-label" htmlFor={`isSignout`}>
                        {t('common.usage')}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer">
            <div className="row justify-content-between">
              <div className="col-auto">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isPending || !isValid}
                >
                  <FontAwesomeIcon icon={faFloppyDisk} />
                  &nbsp;
                  {isPending ? t('common.loading') : t('common.save')}
                </button>
              </div>
              <div className="col-auto">
                <button
                  type="reset"
                  className="btn btn-secondary btn-sm"
                  disabled={isPending || !isValid}
                  onClick={formReset}
                >
                  <FontAwesomeIcon icon={faRotateRight} />
                  &nbsp;
                  {isPending ? t('common.loading') : t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WithdrawForm;
