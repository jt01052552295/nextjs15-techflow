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
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { formatMessage } from '@/lib/util';
import { VerificationPurpose } from '@prisma/client';
import Countdown, { CountdownRendererFn } from 'react-countdown';
import {
  generateVerificationUserToken,
  verifyEmailToken,
} from '@/actions/auth/register/token';
import {
  passwordSchema,
  PasswordType,
} from '@/actions/auth/find-password/schema';
import { findNewPasswordAction } from '@/actions/auth/find-password';

const PasswordForm = () => {
  const { dictionary, locale } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [isEmailSentLoading, setIsEmailSentLoading] = useState<boolean>(false);
  const [emailCodeSent, setEmailCodeSent] = useState<boolean>(false);
  const [isEmailTimerExpired, setIsEmailTimerExpired] =
    useState<boolean>(false);
  const startEmailTimerRef = useRef(Date.now());

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
  } = useForm<PasswordType>({
    mode: 'onChange',
    resolver: zodResolver(passwordSchema(dictionary.common.form)),
  });

  const { handleInputChange, getInputClass } = useFormUtils<PasswordType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const formAction: SubmitHandler<PasswordType> = (data) => {
    startTransition(async () => {
      try {
        const response = await findNewPasswordAction(data);
        if (response.status == 'success') {
          reset();
          setStep(3);
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

    const send = await generateVerificationUserToken(
      watch('email'),
      VerificationPurpose.PASSWORD_RESET,
    );
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
      VerificationPurpose.PASSWORD_RESET,
    );
    if (send.success) {
      setEmailCodeSent(true);
      setIsEmailTimerExpired(true);
      setStep(2);
    }
    setIsEmailSentLoading(false);
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
          <h1 className="fs-5 m-0">
            {dictionary.common.auth.register.changedPassword}
          </h1>
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

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isPending || !isValid}
                    >
                      {isPending
                        ? dictionary.common.loading
                        : dictionary.common.auth.register.modify}
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
                    {formatMessage(dictionary.common.form.resultComplete, {
                      result: dictionary.common.auth.register.changedPassword,
                    })}
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      const path = getRouteUrl('auth.login', locale);
                      window.location.replace(`${path}`);
                    }}
                  >
                    {dictionary.common.auth.login.loginButton}
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

export default PasswordForm;
