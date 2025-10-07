'use client';
import {
  useEffect,
  useState,
  useTransition,
  useCallback,
  MouseEvent,
  useRef,
  useMemo,
} from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { getRouteUrl } from '@/utils/routes';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faList,
  faSave,
  faRefresh,
  faUnlink,
} from '@fortawesome/free-solid-svg-icons';
import { UserRole } from '@prisma/client';
import { UpdateType, UpdateSchema } from '@/actions/user/update/schema';
import { updateAction } from '@/actions/user/update';
import { deleteAccountAction } from '@/actions/user/delete/account';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/user/modal/ResultConfirm';
import { IUser } from '@/types/user';
import { useSearchParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { userQK } from '@/lib/queryKeys/user';
import { showAction } from '@/actions/user/show';
import ImageUploader from './ImageUploader';
import { useConfirm } from '@/hooks/useConfirm';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: IUserPart;
};
export default function EditForm({ uid }: Props) {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isDataFetched, setIsDataFetched] = useState<boolean | undefined>(
    false,
  );
  const [uploadedImages, setUploadedImages] = useState<any[]>([]); // ✅ 업로드된 이미지 상태
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);

  const { confirm } = useConfirm();

  const { data, isLoading, error } = useQuery({
    queryKey: userQK.detail(uid),
    queryFn: () => showAction(uid),
    staleTime: 30_000,
  });

  const seededRef = useRef(false);
  const staticUrl = useMemo(() => process.env.NEXT_PUBLIC_STATIC_URL ?? '', []);

  const methods = useForm<UpdateType>({
    mode: 'onChange',
    resolver: zodResolver(UpdateSchema(dictionary.common.form)),
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

  const { handleInputChange, getInputClass } = useFormUtils<UpdateType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const seedFormFromData = useCallback(async () => {
    if (!data) return;
    if (seededRef.current) return;
    // console.log('edit form', props.uid)
    // console.log(props.rs)

    setValue('id', data.id, { shouldValidate: true });
    setValue('email', data.email, { shouldValidate: true });
    setValue('name', data.name, { shouldValidate: true });
    setValue('nick', data.nick, { shouldValidate: true });
    setValue('phone', data.phone, { shouldValidate: true });
    setValue('role', data.role, { shouldValidate: true });
    setValue('level', String(data.level), { shouldValidate: true });
    setValue('isUse', data.isUse === true);
    setValue('isVisible', data.isVisible === true);

    if (data.profile) {
      const initialImages =
        data.profile.map((file: any) => ({
          preview: staticUrl + file.url,
          name: file.name,
          url: file.url,
        })) ?? [];
      setUploadedImages(initialImages);
    }

    console.log(data.accounts);

    seededRef.current = true;
  }, [data, setValue, staticUrl]);

  useEffect(() => {
    if (data) seedFormFromData();
  }, [data, seedFormFromData]);

  useEffect(() => {
    if (errors) {
      // console.error(errors);
      Object.keys(errors).forEach((field) => {
        const errorMessage = errors[field as keyof typeof errors]?.message;
        if (errorMessage) {
          toast.error(errorMessage);
        }
      });
    }
  }, [errors]);

  const formAction: SubmitHandler<UpdateType> = (data) => {
    startTransition(async () => {
      try {
        const finalData = {
          ...data,
          profile: uploadedImages,
          deleteFileUrls: deletedImages, // ✅ 삭제된 이미지들
        };
        console.log(finalData);
        const response = await updateAction(finalData);
        console.log(response);
        if (response.status == 'success') {
          const updatedItem = response.data as IUser;

          toast.success(response.message);
          // reset();
          setIsResultOpen(true);

          queryClient.setQueryData(userQK.detail(updatedItem.id), updatedItem);
          queryClient.invalidateQueries({ queryKey: ['user', 'list'] });
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
    seedFormFromData();
    setIsDataFetched(false);
  };

  const unlinkAccountAction = async (
    userId: string,
    idx: number,
    provider: string,
  ) => {
    const isConfirmed = await confirm(t('common.confirm_delete'));
    if (!isConfirmed) {
      return false;
    }

    startTransition(async () => {
      try {
        const finalData = {
          userId,
          idx,
          provider,
        };
        console.log(finalData);

        const response = await deleteAccountAction(finalData);
        console.log(response);

        // const result = await response.json();
        // if (result.status === 'success') {
        //   toast.success(t('common.oauth.unlink.success', { provider }));
        //   queryClient.invalidateQueries({ queryKey: userQK.detail(userId) });
        //   queryClient.invalidateQueries({ queryKey: ['user', 'list'] });
        // } else {
        //   throw new Error(
        //     result.message || `${t('common.oauth.unlink.error')}`,
        //   );
        // }
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          toast.error(err.message);
        } else if (typeof err === 'string') {
          toast.error(err);
        } else {
          toast.error(t('common.unknown_error'));
        }
      }
    });
  };

  if (isLoading) return <p>Loading...</p>;
  if (error || !data) return <p>{dictionary.common.failed_data}</p>;

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
                      <div className="mb-3">
                        <label className="form-label" htmlFor="isUse">
                          {t('columns.user.isUse')}
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
                            <label
                              className="form-check-label"
                              htmlFor={`isUse`}
                            >
                              {t('common.usage')}
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="isVisible">
                          {t('columns.user.isVisible')}
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
                            <label
                              className="form-check-label"
                              htmlFor={`isVisible`}
                            >
                              {t('common.visible')}
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="profile">
                          {dictionary.columns.user.profile}
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
                          onChange={(images, removed) => {
                            setUploadedImages(images); // ✅ 남아있는 이미지들
                            setDeletedImages(removed ?? []); // ✅ 삭제된 이미지들
                          }}
                          initialImages={uploadedImages}
                          mode="edit"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-12 mb-2">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title m-0">
                    {t('columns.user.accounts')}
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col">
                      {data.accounts && data.accounts.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-bordered table-striped">
                            <thead>
                              <tr>
                                <th>{t('columns.account.provider')}</th>
                                <th>
                                  {t('columns.account.providerAccountId')}
                                </th>
                                <th>{t('columns.account.createdAt')}</th>
                                <th>{t('common.actions')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.accounts.map((account) => (
                                <tr key={account.idx}>
                                  <td>
                                    <span className="badge bg-secondary">
                                      {account.provider}
                                    </span>
                                  </td>
                                  <td>{account.providerAccountId}</td>
                                  <td>
                                    {account.createdAt
                                      ? new Date(
                                          account.createdAt,
                                        ).toLocaleDateString()
                                      : '-'}
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      onClick={() =>
                                        unlinkAccountAction(
                                          account.userId,
                                          account.idx,
                                          account.provider,
                                        )
                                      }
                                    >
                                      <FontAwesomeIcon icon={faUnlink} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          {t('common.oauth.error.noAccount')}
                        </div>
                      )}
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
      </FormProvider>

      <ResultConfirm isOpen={isResultOpen} setIsOpen={setIsResultOpen} />
    </>
  );
}
