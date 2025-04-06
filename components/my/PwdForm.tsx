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
import Link from 'next/link';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { passwordSchema, PasswordType } from '@/actions/auth/pwd/schema';
import { resetPasswordAction } from '@/actions/auth/pwd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFloppyDisk,
  faRotateRight,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { Toaster, toast } from 'sonner';
import useFormUtils from '@/hooks/useFormUtils';
import { useAuth } from '../context/AuthContext';

const PwdForm = () => {
  const { dictionary, locale } = useLanguage();
  const router = useRouter();

  const { user } = useAuth();

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

  useEffect(() => {
    if (user) {
      setValue('id', user.id, { shouldValidate: true });
      setValue('email', user.email, { shouldValidate: true });
    }
  }, [user, setValue]);

  const { handleInputChange, getInputClass } = useFormUtils<PasswordType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const formAction: SubmitHandler<PasswordType> = (data) => {
    startTransition(async () => {
      try {
        const response = await resetPasswordAction(data, locale);
        if (response.status == 'success') {
          toast.success(response.message);
          reset();
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
            <h5 className="card-title m-0">{dictionary.common.basic_info}</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-12 col-lg-6">
                <div className="mb-3">
                  <label className="form-label">
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
                <div className="mb-3">
                  <label className="form-label">
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
              </div>
              <div className="col-md-12 col-lg-6"></div>
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
                  {isPending ? dictionary.loading : dictionary.common.save}
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
                  {isPending ? dictionary.loading : dictionary.common.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PwdForm;
