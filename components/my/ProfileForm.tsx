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
import { profileSchema, ProfileType } from '@/actions/auth/profile/schema';
import { authProfileAction } from '@/actions/auth/profile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { UserRole } from '@prisma/client';
import { toast } from 'sonner';
import useFormUtils from '@/hooks/useFormUtils';
import { useAuth } from '../context/AuthContext';
import { formatMessage } from '@/lib/util';
import FileUploadPreview, { FileUploadPreviewRef } from './FileUploadPreview';
import { IUserProfile } from '@/types/user';

const ProfileForm = () => {
  const { dictionary, locale } = useLanguage();
  const router = useRouter();

  const { user, refreshUser, userProfiles, updateUserProfiles } = useAuth();
  const fileUploadRef = useRef<FileUploadPreviewRef>(null);

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
  } = useForm<ProfileType>({
    mode: 'onChange',
    resolver: zodResolver(profileSchema(dictionary.common.form)),
  });

  useEffect(() => {
    if (user) {
      setValue('id', user.id, { shouldValidate: true });
      setValue('email', user.email, { shouldValidate: true });
      setValue('name', user.name, { shouldValidate: true });
      setValue('nick', user.nick, { shouldValidate: true });
      setValue('phone', user.phone, { shouldValidate: true });
      setValue('role', user.role, { shouldValidate: true });
      setValue('isUse', user.isUse === true);
      setValue('isVisible', user.isVisible === true);
    }
  }, [user, setValue]);

  const { handleInputChange, getInputClass } = useFormUtils<ProfileType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const formAction: SubmitHandler<ProfileType> = (data) => {
    startTransition(async () => {
      try {
        const response = await authProfileAction(data, locale);
        if (response.status == 'success') {
          toast.success(response.message);
          refreshUser();

          if (fileUploadRef.current) {
            fileUploadRef.current.resetUploadState();
          }
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

    if (fileUploadRef.current) {
      fileUploadRef.current.resetUploadState();
    }
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
                    {dictionary.columns.user.name}
                  </label>
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
                        {dictionary.common.form.valid}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    {dictionary.columns.user.nick}
                  </label>
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
                        {dictionary.common.form.valid}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    {dictionary.columns.user.phone}
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
                        {dictionary.common.form.valid}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-3 ">
                  <label className="form-label">
                    {dictionary.columns.user.role}
                  </label>

                  <select
                    className={`form-select ${getInputClass('role')}`}
                    defaultValue=""
                    {...register('role', {
                      onChange: () => handleInputChange('role'),
                      onBlur: () => handleInputChange('role'),
                    })}
                  >
                    <option value="">{dictionary.common.choose}</option>
                    <option value={UserRole.ADMIN}>
                      {dictionary.common.userRole.admin}
                    </option>
                    <option value={UserRole.EXTRA}>
                      {dictionary.common.userRole.extra}
                    </option>
                    <option value={UserRole.COMPANY}>
                      {dictionary.common.userRole.company}
                    </option>
                    <option value={UserRole.USER}>
                      {dictionary.common.userRole.user}
                    </option>
                  </select>
                  {errors.role?.message && (
                    <div className="invalid-feedback">
                      {errors.role?.message}
                    </div>
                  )}
                  {!errors.role && (
                    <div className="valid-feedback">
                      {dictionary.common.form.valid}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-12 col-lg-6">
                <div className="mb-3">
                  <label className="form-label" htmlFor="isUse">
                    {dictionary.columns.user.isUse}
                  </label>
                  <div className="input-group ">
                    <div className="form-check form-switch">
                      <input
                        className={`form-check-input`}
                        type="checkbox"
                        role="switch"
                        id="isUse"
                        {...register('isUse')}
                      />
                      <label className="form-check-label" htmlFor={`isUse`}>
                        {dictionary.common.usage}
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="isVisible">
                    {dictionary.columns.user.isVisible}
                  </label>
                  <div className="input-group">
                    <div className="form-check form-switch">
                      <input
                        className={`form-check-input`}
                        type="checkbox"
                        role="switch"
                        id="isVisible"
                        {...register('isVisible')}
                      />
                      <label className="form-check-label" htmlFor={`isVisible`}>
                        {dictionary.common.visible}
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="profile">
                    {dictionary.columns.user.profile}
                    <small className="text-muted ms-1">
                      {formatMessage(dictionary.common.upload.info_message, {
                        count: '4',
                        size: '20',
                      })}
                    </small>
                  </label>
                  <FileUploadPreview
                    accept="image/*"
                    label="userProfile"
                    maxFiles={4}
                    maxSize={20}
                    watch={watch}
                    register={register}
                    errors={errors}
                    initialImages={userProfiles}
                  />
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

export default ProfileForm;
