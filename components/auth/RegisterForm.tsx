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
import { faEye, faEyeSlash, faHome } from '@fortawesome/free-solid-svg-icons';
import { formatMessage } from '@/lib/util';
import { VerificationPurpose } from '@prisma/client';
import Countdown, { CountdownRendererFn } from 'react-countdown';
import {
  generateVerificationToken,
  verifyEmailToken,
  generateVerificationPhoneToken,
  verifyPhoneToken,
} from '@/actions/auth/register/token';
import { registerSchema, RegisterType } from '@/actions/auth/register/schema';
import { authRegisterAction } from '@/actions/auth/register';

const RegisterForm = () => {
  const { dictionary, locale } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [isEmailSentLoading, setIsEmailSentLoading] = useState<boolean>(false);
  const [emailCodeSent, setEmailCodeSent] = useState<boolean>(false);
  const [isEmailTimerExpired, setIsEmailTimerExpired] =
    useState<boolean>(false);
  const startEmailTimerRef = useRef(Date.now());

  const [phoneSent, setPhoneSent] = useState<boolean>(false);
  const [isPhoneSentLoading, setIsPhoneSentLoading] = useState<boolean>(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState<boolean>(false);
  const [isPhoneTimerExpired, setIsPhoneTimerExpired] =
    useState<boolean>(false);
  const startPhoneTimerRef = useRef(Date.now());

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPassword2, setShowPassword2] = useState<boolean>(false);

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
  } = useForm<RegisterType>({
    mode: 'onChange',
    resolver: zodResolver(registerSchema(dictionary.common.form)),
  });

  const { handleInputChange, getInputClass } = useFormUtils<RegisterType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const formAction: SubmitHandler<RegisterType> = (data) => {
    startTransition(async () => {
      try {
        const response = await authRegisterAction(data, locale);
        if (response.status == 'success') {
          reset();
          setStep(4);
        } else if (response.status == 'error') {
          // toast.error(response.message);
          setErrorMessage(response.message);
        }
        // toast.success(`로그인성공`);
      } catch (error) {
        console.error(error);
        toast.error(dictionary.common.unknown_error);
      }
    });
  };

  const showVerificationEmail = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsEmailSentLoading(true);
    const isEmailValid = await trigger('email');
    if (!isEmailValid) {
      setIsEmailSentLoading(false);
      return;
    }

    const send = await generateVerificationToken(watch('email'), 'SIGNUP');
    if (send.success) {
      setEmailSent(true);
      setEmailCodeSent(false);
      setIsEmailTimerExpired(false);
      startEmailTimerRef.current = Date.now();
    } else {
      // console.log(send);
      setError('email', { message: send.message }, { shouldFocus: true });
    }

    setIsEmailSentLoading(false);
  };

  const reVerificationEmail = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();

    setEmailSent(false);
    setIsEmailTimerExpired(false);
    startEmailTimerRef.current = Date.now();
  };

  const handleVerificationEmail = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsEmailSentLoading(true);
    const result = await trigger('emailCode');
    if (!result) {
      setIsEmailSentLoading(false);
      return;
    }
    const send = await verifyEmailToken(
      watch('email'),
      watch('emailCode'),
      'SIGNUP',
    );
    if (send.success) {
      setEmailCodeSent(true);
      setIsEmailTimerExpired(true);
      setStep(2);
    }
    setIsEmailSentLoading(false);
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

  useEffect(() => {
    if (dictionary) {
      // console.log(locale)
      // console.log(dictionary)
    }
  }, [dictionary, locale]);

  return (
    <div className={styles['register-page']}>
      <div className={styles['register-box']}>
        <div className={styles['register-logo']}>
          <h1 className="fs-5 m-0">{dictionary.common.auth.login.register}</h1>
          <div className="text-center">
            <Link
              href={getRouteUrl('auth.login', locale)}
              className="text-muted"
            >
              {dictionary.common.auth.login.loginButton}
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-body login-card-body">
            <form onSubmit={handleSubmit(formAction)}>
              {step === 1 && (
                <div>
                  {!emailSent && (
                    <div className="mb-3">
                      <label className="form-label">
                        {dictionary.columns.user.email}
                      </label>

                      <div className="input-group has-validation">
                        <input
                          type="email"
                          className={`form-control ${getInputClass('email')}`}
                          {...register('email', {
                            onChange: () => handleInputChange('email'),
                            onBlur: () => handleInputChange('email'),
                          })}
                          readOnly={isPending}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={showVerificationEmail}
                        >
                          {isEmailSentLoading
                            ? dictionary.common.auth.register.sendButtonLoading
                            : dictionary.common.auth.register.sendButton}
                        </button>
                        {errors.email?.message && (
                          <div className="invalid-feedback">
                            {errors.email?.message}
                          </div>
                        )}
                        {!errors.email && (
                          <div className="valid-feedback">
                            {dictionary.common.form.valid}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {emailSent && (
                    <div className="mb-3">
                      <label className="form-label">
                        {dictionary.common.auth.register.verifyCode}
                      </label>
                      <div className="input-group has-validation">
                        <input
                          type="text"
                          className={`form-control ${getInputClass('emailCode')}`}
                          {...register('emailCode', {
                            onChange: () => handleInputChange('emailCode'),
                            onBlur: () => handleInputChange('emailCode'),
                          })}
                          disabled={isEmailTimerExpired || emailCodeSent}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleVerificationEmail}
                          disabled={isEmailTimerExpired || emailCodeSent}
                        >
                          {isEmailSentLoading
                            ? dictionary.common.auth.register
                                .verifyButtonLoading
                            : dictionary.common.auth.register.verifyButton}
                        </button>
                        {errors.emailCode?.message && (
                          <div className="invalid-feedback">
                            {errors.emailCode?.message}
                          </div>
                        )}
                        {!errors.emailCode && (
                          <div className="valid-feedback">
                            {dictionary.common.form.valid}
                          </div>
                        )}
                      </div>

                      {!isEmailTimerExpired && !emailCodeSent && (
                        <div>
                          <Countdown
                            date={startEmailTimerRef.current + 300000}
                            renderer={renderer}
                            onComplete={() => setIsEmailTimerExpired(true)}
                          />
                        </div>
                      )}
                      {isEmailTimerExpired && !emailCodeSent && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <p className="m-0">
                            {dictionary.common.auth.register.timeIsUp}
                          </p>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={reVerificationEmail}
                          >
                            {dictionary.common.auth.register.resendButton}
                          </button>
                        </div>
                      )}

                      {emailCodeSent && (
                        <div
                          className="alert alert-success mt-2 p-2"
                          role="alert"
                        >
                          {dictionary.common.auth.register.codeSent}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div>
                  {!phoneSent && (
                    <div className="mb-3">
                      <label className="form-label">
                        {dictionary.columns.user.phone}
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
                            ? dictionary.common.auth.register.sendButtonLoading
                            : dictionary.common.auth.register.sendButton}
                        </button>
                        {errors.hp?.message && (
                          <div className="invalid-feedback">
                            {errors.hp?.message}
                          </div>
                        )}
                        {!errors.hp && (
                          <div className="valid-feedback">
                            {dictionary.common.form.valid}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {phoneSent && (
                    <div className="mb-3">
                      <label className="form-label">
                        {dictionary.common.auth.register.verifyCode}
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
                            ? dictionary.common.auth.register
                                .verifyButtonLoading
                            : dictionary.common.auth.register.verifyButton}
                        </button>
                        {errors.hpCode?.message && (
                          <div className="invalid-feedback">
                            {errors.hpCode?.message}
                          </div>
                        )}
                        {!errors.hpCode && (
                          <div className="valid-feedback">
                            {dictionary.common.form.valid}
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
                              {dictionary.common.auth.register.timeIsUp}
                            </p>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={reVerificationPhone}
                            >
                              {dictionary.common.auth.register.resendButton}
                            </button>
                          </div>
                        )}

                        {phoneCodeSent && (
                          <div
                            className="alert alert-success mt-2 p-2"
                            role="alert"
                          >
                            {dictionary.common.auth.register.codeSent}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="mb-2">
                    <label className="form-label" htmlFor="name">
                      {dictionary.columns.user.name}
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
                        {dictionary.common.form.valid}
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <label className="form-label" htmlFor="password">
                      {dictionary.columns.user.password}
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
                          {dictionary.common.form.valid}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label" htmlFor="passwordRe">
                      {dictionary.columns.user.passwordRe}
                    </label>
                    <div className="input-group has-validation">
                      <input
                        type={showPassword2 ? 'text' : 'password'}
                        className={`form-control ${getInputClass('re_password')}`}
                        {...register('re_password', {
                          onChange: () => handleInputChange('re_password'),
                          onBlur: () => handleInputChange('re_password'),
                        })}
                        readOnly={isPending}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword2((prev) => !prev)}
                      >
                        {showPassword2 ? (
                          <FontAwesomeIcon icon={faEye} />
                        ) : (
                          <FontAwesomeIcon icon={faEyeSlash} />
                        )}
                      </button>
                      {errors.re_password?.message && (
                        <div className="invalid-feedback">
                          {errors.re_password?.message}
                        </div>
                      )}
                      {!errors.re_password && (
                        <div className="valid-feedback">
                          {dictionary.common.form.valid}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      className="form-check-input"
                      {...register('privacy')}
                    />
                    <label className="form-check-label" htmlFor="privacy">
                      {dictionary.columns.user.privacyLabel}
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
                        ? dictionary.common.loading
                        : dictionary.common.auth.register.registerButton}
                    </button>
                    {errorMessage && (
                      <div className="alert alert-danger mt-2 p-2" role="alert">
                        {errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center">
                  <p>
                    {formatMessage(dictionary.common.form.resultComplete, {
                      result: dictionary.common.auth.register.registerButton,
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

export default RegisterForm;
