'use client';
import styles from './Auth.module.scss';
import {
  ChangeEventHandler,
  useEffect,
  useState,
  useTransition,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { toast } from 'sonner';
import useFormUtils from '@/hooks/useFormUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import Countdown, { CountdownRendererFn } from 'react-countdown';
import {
  generateVerificationPhoneToken,
  verifyPhoneToken,
} from '@/actions/auth/register/token';
import {
  registerSchema,
  RegisterType,
} from '@/actions/auth/register/social-schema';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

import { getOauthDataAction } from '@/actions/auth/register/oauth';
import { oauthSocialRegisterAction } from '@/actions/auth/register/social';

const SocialRegisterForm = () => {
  const router = useRouter();
  const { dictionary, locale, t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [step, setStep] = useState<number>(1);
  const [oauthData, setOauthData] = useState<any>(null);
  const [hasPhoneFromOAuth, setHasPhoneFromOAuth] = useState<boolean>(false);

  const [phoneSent, setPhoneSent] = useState<boolean>(false);
  const [isPhoneSentLoading, setIsPhoneSentLoading] = useState<boolean>(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState<boolean>(false);
  const [isPhoneTimerExpired, setIsPhoneTimerExpired] =
    useState<boolean>(false);
  const startPhoneTimerRef = useRef(Date.now());

  useEffect(() => {
    // 쿠키에서 OAuth 데이터 가져오기
    const fetchOAuthData = async () => {
      try {
        startTransition(async () => {
          const result = await getOauthDataAction();
          console.log(result);

          if (result.status == 'error') {
            toast.error(result.message);
            router.push(getRouteUrl('auth.login', locale));
            return;
          }

          const issuedAt = dayjs
            .unix(result.userData.iat)
            .format('YYYY-MM-DD HH:mm:ss');
          const expiresAt = dayjs
            .unix(result.userData.exp)
            .format('YYYY-MM-DD HH:mm:ss');

          console.log(issuedAt, expiresAt);

          // OAuth 데이터 저장
          setOauthData(result.userData);

          // 폼에 데이터 자동 설정
          if (result.userData.name) {
            setValue('name', result.userData.name);
            handleInputChange('name');
          }

          if (result.userData.email) {
            setValue('email', result.userData.email);
            handleInputChange('email');
          }

          if (result.userData.phone) {
            setValue('hp', result.userData.phone);
            handleInputChange('hp');
            setValue('hpCode', '123456');
            setHasPhoneFromOAuth(true);
            setStep(2);
          }

          // 모든 필드 유효성 검사 트리거
          setTimeout(() => {
            trigger();
          }, 100);
        });
      } catch (error) {
        console.error('OAuth 데이터 처리 오류:', error);
        // router.push('/login');
      }
    };

    fetchOAuthData();
  }, [router]);

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
  } = useForm<RegisterType>({
    mode: 'onChange',
    resolver: zodResolver(registerSchema(dictionary.common.form)),
  });

  // 유효성 상태 디버깅을 위한 useEffect 추가
  useEffect(() => {
    console.log('Form validation state:', {
      isValid,
      errors,
      values: {
        name: watch('name'),
        email: watch('email'),
        hp: watch('hp'),
        privacy: watch('privacy'),
      },
    });
  }, [isValid, errors, watch]);

  const { handleInputChange, getInputClass } = useFormUtils<RegisterType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const formAction: SubmitHandler<RegisterType> = (data) => {
    startTransition(async () => {
      try {
        const mergedData = {
          ...data,
          provider: oauthData?.provider,
          providerAccountId: oauthData?.providerAccountId,
          accessToken: oauthData?.accessToken,
          refreshToken: oauthData?.refreshToken,
          expiresAt: oauthData?.expiresAt,
          phoneVerified: hasPhoneFromOAuth,
        };

        const response = await oauthSocialRegisterAction(mergedData, locale);
        console.log(response);
        if (response.status == 'success') {
          reset();
          setStep(3);
          // router.push(getPathWithParams(AdminRoute.auth.login.path))
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

  const showVerificationPhone = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsPhoneSentLoading(true);
    const result = await trigger('hp');
    if (!result) {
      setIsPhoneSentLoading(false);
      return;
    }

    const send = await generateVerificationPhoneToken(watch('hp'), 'SIGNUP');
    if (send.success) {
      setPhoneSent(true);
      setPhoneCodeSent(false);
      setIsPhoneTimerExpired(false);
      startPhoneTimerRef.current = Date.now();
    } else {
      setError('hp', { message: send.message }, { shouldFocus: true });
    }
    setIsPhoneSentLoading(false);
  };

  const reVerificationPhone = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();

    setPhoneSent(false);
    setIsPhoneTimerExpired(false);
    startPhoneTimerRef.current = Date.now();
  };

  const handleVerificationPhone = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsPhoneSentLoading(true);
    const result = await trigger('hpCode');
    if (!result) {
      setIsPhoneSentLoading(false);
      return;
    }

    const send = await verifyPhoneToken(watch('hp'), watch('hpCode'), 'SIGNUP');
    if (send.success) {
      setPhoneSent(true);
      setIsPhoneTimerExpired(true);
      setStep(3);
      setHasPhoneFromOAuth(true);
    }
    setIsPhoneSentLoading(false);
  };

  const renderer: CountdownRendererFn = ({ minutes, seconds, completed }) => {
    return (
      <span>
        {minutes < 10 ? `0${minutes}` : minutes}:
        {seconds < 10 ? `0${seconds}` : seconds}
      </span>
    );
  };

  return (
    <div className={styles['register-page']}>
      <div className={styles['register-box']}>
        <div className={styles['register-logo']}>
          <h1 className="fs-5 m-0">{t('common.auth.login.register')}</h1>
          <div className="text-center">
            <Link
              href={getRouteUrl('auth.login', locale)}
              className="text-muted"
            >
              {t('common.auth.login.loginButton')}
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-body login-card-body">
            <form onSubmit={handleSubmit(formAction)}>
              <input type="hidden" {...register('email')} />

              {step === 1 && !hasPhoneFromOAuth && (
                <div>
                  {!phoneSent && (
                    <div className="mb-3">
                      <label className="form-label">
                        {t('columns.user.phone')}
                      </label>
                      <div className="input-group has-validation">
                        <input
                          type="text"
                          className={`form-control ${getInputClass('hp')}`}
                          {...register('hp', {
                            onChange: () => handleInputChange('hp'),
                            onBlur: () => handleInputChange('hp'),
                          })}
                          readOnly={isPending}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={showVerificationPhone}
                        >
                          {isPhoneSentLoading
                            ? t('common.auth.register.sendButtonLoading')
                            : t('common.auth.register.sendButton')}
                        </button>
                        {errors.hp?.message && (
                          <div className="invalid-feedback">
                            {errors.hp?.message}
                          </div>
                        )}
                        {!errors.hp && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {phoneSent && (
                    <div className="mb-3">
                      <label className="form-label">
                        {t('common.auth.register.verifyCode')}
                      </label>
                      <div className="input-group has-validation">
                        <input
                          type="text"
                          className={`form-control ${getInputClass('hpCode')}`}
                          {...register('hpCode', {
                            onChange: () => handleInputChange('hpCode'),
                            onBlur: () => handleInputChange('hpCode'),
                          })}
                          disabled={isPhoneTimerExpired || phoneCodeSent}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleVerificationPhone}
                          disabled={isPhoneTimerExpired || phoneCodeSent}
                        >
                          {isPhoneSentLoading
                            ? t('common.auth.register.verifyButtonLoading')
                            : t('common.auth.register.verifyButton')}
                        </button>
                        {errors.hpCode?.message && (
                          <div className="invalid-feedback">
                            {errors.hpCode?.message}
                          </div>
                        )}
                        {!errors.hpCode && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div>
                        {!isPhoneTimerExpired && !phoneCodeSent && (
                          <div>
                            <Countdown
                              date={startPhoneTimerRef.current + 300000}
                              renderer={renderer}
                              onComplete={() => setIsPhoneTimerExpired(true)}
                            />
                          </div>
                        )}
                        {isPhoneTimerExpired && !phoneCodeSent && (
                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <p className="m-0">
                              {t('common.auth.register.timeIsUp')}
                            </p>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={reVerificationPhone}
                            >
                              {t('common.auth.register.resendButton')}
                            </button>
                          </div>
                        )}

                        {phoneCodeSent && (
                          <div
                            className="alert alert-success mt-2 p-2"
                            role="alert"
                          >
                            {t('common.auth.register.codeSent')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div>
                  {hasPhoneFromOAuth && (
                    <div className="mb-3">
                      <label className="form-label">
                        {t('columns.user.phone')}
                      </label>
                      <input type="hidden" {...register('hp')} />
                      <input type="hidden" {...register('hpCode')} />
                      <input
                        type="text"
                        className="form-control"
                        value={watch('hp')}
                        readOnly
                      />
                      <small className="text-success">
                        {t('common.auth.register.phoneVerified')}
                      </small>
                    </div>
                  )}
                  <div className="mb-2">
                    <label className="form-label" htmlFor="name">
                      {t('columns.user.name')}
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

                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      className="form-check-input"
                      {...register('privacy')}
                    />
                    <label className="form-check-label" htmlFor="privacy">
                      {t('columns.user.privacyLabel')}
                    </label>
                    {errors.privacy?.message && (
                      <div className="invalid-feedback">
                        {errors.privacy?.message}
                      </div>
                    )}
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isPending || !isValid}
                    >
                      {isPending
                        ? t('common.loading')
                        : t('common.auth.register.registerButton')}
                    </button>
                    {errorMessage && (
                      <div className="alert alert-danger mt-2 p-2" role="alert">
                        {errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center">
                  <p>
                    {t('common.form.resultComplete', {
                      result: t('common.auth.register.registerButton'),
                    })}
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      const path = getRouteUrl('main.index', locale);
                      window.location.href = `${path}`;
                    }}
                  >
                    <FontAwesomeIcon icon={faHome} />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialRegisterForm;
