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
import {
  faList,
  faSave,
  faRefresh,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { CreateType, CreateSchema } from '@/actions/user/create/schema';
import { createAction } from '@/actions/user/create';
import {
  SubmitHandler,
  useForm,
  FormProvider,
  Controller,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/user/modal/ResultConfirm';
import { UserRole } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import ImageUploader from './ImageUploader';

export default function CreateForm() {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]); // ✅ 업로드된 이미지 상태

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPassword2, setShowPassword2] = useState<boolean>(false);

  const methods = useForm<CreateType>({
    mode: 'onChange',
    resolver: zodResolver(CreateSchema(dictionary.common.form)),
    defaultValues: {
      id: uuidv4(),
      email: 'user@user.com',
      name: 'jtm',
      nick: 'niccc',
      phone: '09012',
      level: '1',
      role: UserRole.COMPANY,
      password: 'a1111!',
      re_password: 'a1111!',
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
          todoFile: uploadedImages,
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
          setUploadedImages([]); // ✅ 이미지 초기화
          setIsResultOpen(true);

          queryClient.invalidateQueries({ queryKey: ['user', 'list'] });

          // 상세로 이동
          // const qs = searchParams.toString();
          // queryClient.setQueryData(userQK.detail(newItem.uid), newItem);
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
    setUploadedImages([]); // ✅ 이미지 초기화
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(formAction)}>
          <input type="hidden" {...register('id')} />
          <div className="row">
            <div className="col-md-6 mb-2">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title m-0">{t('common.basic_info')}</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col">
                      <div className="mb-3">
                        <label className="form-label">
                          {t('columns.user.email')}
                        </label>
                        <div className="input-group has-validation">
                          <input
                            type="text"
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

                      <div className="mb-3">
                        <label className="form-label">
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

                      <div className="mb-3">
                        <label className="form-label">
                          {t('columns.user.passwordRe')}
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
                              {errors.password?.message}
                            </div>
                          )}
                          {!errors.re_password && (
                            <div className="valid-feedback">
                              {t('common.form.valid')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          {t('columns.user.name')}
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
                              {t('common.form.valid')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          {t('columns.user.nick')}
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

                      <div className="mb-3">
                        <label className="form-label">
                          {t('columns.user.level')}
                        </label>
                        <div className="input-group has-validation">
                          <input
                            type="text"
                            className={`form-control ${getInputClass('level')}`}
                            {...register('level', {
                              onChange: () => handleInputChange('level'),
                              onBlur: () => handleInputChange('level'),
                            })}
                            readOnly={isPending}
                          />
                          {errors.level?.message && (
                            <div className="invalid-feedback">
                              {errors.level?.message}
                            </div>
                          )}
                          {!errors.level && (
                            <div className="valid-feedback">
                              {t('common.form.valid')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3 ">
                        <label className="form-label">
                          {t('columns.user.role')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('role')}`}
                          defaultValue=""
                          {...register('role', {
                            onChange: () => handleInputChange('role'),
                            onBlur: () => handleInputChange('role'),
                          })}
                        >
                          <option value="">{t('common.choose')}</option>
                          <option value={UserRole.ADMIN}>
                            {t('common.userRole.admin')}
                          </option>
                          <option value={UserRole.EXTRA}>
                            {t('common.userRole.extra')}
                          </option>
                          <option value={UserRole.COMPANY}>
                            {t('common.userRole.company')}
                          </option>
                          <option value={UserRole.USER}>
                            {t('common.userRole.user')}
                          </option>
                        </select>
                        {errors.role?.message && (
                          <div className="invalid-feedback">
                            {errors.role?.message}
                          </div>
                        )}
                        {!errors.role && (
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
                        <label className="form-label" htmlFor="todoFile">
                          {t('columns.user.profile')}
                          <small className="text-muted ms-1">
                            {t('common.upload.info_message', {
                              count: '1',
                              size: '20',
                            })}
                          </small>
                        </label>
                        <ImageUploader
                          dir={'user'}
                          pid={watch('id')}
                          onChange={setUploadedImages} // ✅ 작성폼은 업로드된 이미지만 관리
                          mode="create"
                        />
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
                    href={`${getRouteUrl('user.index', locale)}?${searchParams.toString()}`}
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
