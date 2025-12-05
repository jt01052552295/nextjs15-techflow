'use client';
import styles from './Auth.module.scss';
import { ChangeEventHandler, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginType } from '@/actions/auth/login/schema';
import { authLoginAction } from '@/actions/auth/login';
import Link from 'next/link';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { toast } from 'sonner';
import useFormUtils from '@/hooks/useFormUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { LanguageSwitcher } from '@/components/locale/LanguageSwitcher';
import SocialButton from './SocialButton';

const LoginForm = () => {
  const { dictionary, locale, t } = useLanguage();

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
  } = useForm<LoginType>({
    resolver: zodResolver(loginSchema(dictionary.common.form)),
    defaultValues: {
      email: '',
      password: '',
      rememberEmail: false,
    },
    mode: 'onChange',
  });

  const { handleInputChange, getInputClass } = useFormUtils<LoginType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const formAction: SubmitHandler<LoginType> = (data) => {
    startTransition(async () => {
      try {
        const response = await authLoginAction(data, callbackUrl);
        if (response.status == 'error') {
          toast.error(response.message);
        }
        toast.success(response.message);

        if (response.expiresAt) {
          localStorage.setItem('session_expires_at', response.expiresAt);
        }

        setTimeout(() => {
          const url = getRouteUrl('main.index', locale);
          window.location.href = url;
        }, 500);
      } catch (error) {
        console.error(error);
        toast.error(t('common.unknown_error'));
      }
    });
  };

  const handleRememberEmailChange: ChangeEventHandler<HTMLInputElement> = (
    e,
  ) => {
    const isChecked = e.target.checked;
    const email = getValues('email');

    if (isChecked && emailIsValid) {
      localStorage.setItem('rememberedEmail', email);
      setValue('rememberEmail', true);
    } else {
      localStorage.removeItem('rememberedEmail');
      setValue('rememberEmail', false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setValue('rememberEmail', true);
    }
  }, [setValue]);

  const watchedEmail = watch('email');
  useEffect(() => {
    if (watchedEmail && !errors.email) {
      setEmailIsValid(true);
    } else {
      setEmailIsValid(false);
    }
  }, [errors.email, watchedEmail]);

  return (
    <div className={styles['register-page']}>
      <div className={styles['register-box']}>
        <div className={styles['register-logo']}>
          <h1 className="fs-5 m-0">{t('common.AppName')}</h1>
          <LanguageSwitcher />
        </div>

        <div className="card">
          <div className="card-body login-card-body">
            <form onSubmit={handleSubmit(formAction)} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="email">
                  {t('columns.user.email')}
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
                  <div className="valid-feedback">{t('common.form.valid')}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="password">
                  {t('columns.user.password')}
                </label>
                <div className="input-group has-validation">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${getInputClass('password')}`}
                    {...register('password', {
                      onChange: () => handleInputChange('password'),
                      onBlur: () => handleInputChange('password'),
                    })}
                    readOnly={isPending}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <FontAwesomeIcon icon={faEye} />
                    ) : (
                      <FontAwesomeIcon icon={faEyeSlash} />
                    )}
                  </button>
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
              </div>
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  id="rememberEmail"
                  className="form-check-input"
                  disabled={!emailIsValid}
                  {...register('rememberEmail', {
                    onChange: handleRememberEmailChange,
                  })}
                />
                <label className="form-check-label" htmlFor="rememberEmail">
                  {t('common.auth.login.remember')}
                </label>
              </div>
              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isPending || !isValid}
                >
                  {isPending
                    ? t('common.loading')
                    : t('common.auth.login.loginButton')}
                </button>
                {errorMessage && (
                  <div className="alert alert-danger mt-2 p-2" role="alert">
                    {errorMessage}
                  </div>
                )}
              </div>
            </form>
            <div className="mt-3">
              <SocialButton />
            </div>
            <div className="mt-3 text-end">
              <Link
                href={getRouteUrl('auth.account', locale)}
                className="text-muted"
              >
                {t('common.auth.login.forgotAccount')}
              </Link>
            </div>
            <div className="mt-1 text-end">
              <Link
                href={getRouteUrl('auth.password', locale)}
                className="text-muted"
              >
                {t('common.auth.login.forgotPassword')}
              </Link>
            </div>
            <div className="mt-1 text-end">
              <Link
                href={getRouteUrl('auth.register', locale)}
                className="text-muted"
              >
                {t('common.auth.login.register')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
