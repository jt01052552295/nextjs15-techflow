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
import { VerificationPurpose } from '@prisma/client';
import Countdown, { CountdownRendererFn } from 'react-countdown';
import {
  generateVerificationUserPhoneToken,
  verifyPhoneToken,
} from '@/actions/auth/register/token';
import { accountSchema, AccountType } from '@/actions/auth/account/schema';
import { findAccountAction } from '@/actions/auth/account';

const AccountForm = () => {
  const { dictionary, locale, t } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState<number>(1);

  const [phoneSent, setPhoneSent] = useState<boolean>(false);
  const [isPhoneSentLoading, setIsPhoneSentLoading] = useState<boolean>(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState<boolean>(false);
  const [isPhoneTimerExpired, setIsPhoneTimerExpired] =
    useState<boolean>(false);
  const startPhoneTimerRef = useRef(Date.now());

  const [showEmail, setShowEmail] = useState<boolean>(false);
  const [showName, setShowName] = useState<boolean>(false);

  const [showEmailValue, setShowEmailValue] = useState<string | undefined>('');
  const [showNameValue, setShowNameValue] = useState<string | undefined>('');

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
  } = useForm<AccountType>({
    mode: 'onChange',
    resolver: zodResolver(accountSchema(dictionary.common.form)),
  });

  const { handleInputChange, getInputClass } = useFormUtils<AccountType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const formAction: SubmitHandler<AccountType> = (data) => {
    startTransition(async () => {
      try {
        const response = await findAccountAction(data);
        if (response.status == 'success') {
          reset();
          setStep(2);
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

    const send = await generateVerificationUserPhoneToken(
      watch('hp'),
      VerificationPurpose.FIND_ACCOUNT,
    );
    if (send.success) {
      setPhoneSent(true);
      setPhoneCodeSent(false);
      setIsPhoneTimerExpired(false);
      startPhoneTimerRef.current = Date.now();

      setShowEmailValue(send.user?.email);
      setShowNameValue(send.user?.name);
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

    const send = await verifyPhoneToken(
      watch('hp'),
      watch('hpCode'),
      VerificationPurpose.FIND_ACCOUNT,
    );
    if (send.success) {
      setPhoneSent(true);
      setIsPhoneTimerExpired(true);
      setStep(2);
      setShowEmail(true);
      setShowName(true);
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
          <h1 className="fs-5 m-0">{t('common.auth.register.findAccount')}</h1>
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
              {step === 1 && (
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
                <div className="text-center">
                  {showEmail && <p className="mt-2 mb-0">{showEmailValue}</p>}
                  {showName && <p className="mt-2 mb-0">{showNameValue}</p>}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      const path = getRouteUrl('auth.login', locale);
                      window.location.replace(`${path}`);
                    }}
                  >
                    {t('common.auth.login.loginButton')}
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

export default AccountForm;
