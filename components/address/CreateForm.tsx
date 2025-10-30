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
import { faList, faSave, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { CreateType, CreateSchema } from '@/actions/address/create/schema';
import { createAction } from '@/actions/address/create';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/address/modal/ResultConfirm';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import UserSelect from '@/components/common/UserSelect';

export default function CreateForm() {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);

  const methods = useForm<CreateType>({
    mode: 'onChange',
    resolver: zodResolver(CreateSchema(dictionary.common.form)),
    defaultValues: {
      uid: uuidv4(),
      userId: '',
      title: '',
      name: '',
      zipcode: '',
      addr1: '',
      addr2: '',
      addrJibeon: '',
      sido: '',
      gugun: '',
      dong: '',
      latNum: null,
      lngNum: null,
      hp: '',
      tel: '',
      isDefault: false,
      rmemo: 'CALL_BEFORE',
      rmemoTxt: null,
      doorPwd: null,
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
          setIsResultOpen(true);

          queryClient.invalidateQueries({ queryKey: ['address', 'list'] });

          // 상세로 이동
          // const qs = searchParams.toString();
          // queryClient.setQueryData(addressQK.detail(newItem.uid), newItem);
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
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(formAction)}>
          <input type="hidden" {...register('uid')} />
          <div className="row">
            <div className="col-md-6 mb-2">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title m-0">{t('common.basic_info')}</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col">
                      <div className="mb-2">
                        <label className="form-label" htmlFor="userId">
                          {t('columns.address.userId')}
                        </label>

                        <UserSelect
                          name="userId"
                          control={control}
                          label={t('columns.address.userId')}
                          required
                          error={errors.userId?.message}
                          feedbackMessages={{ valid: t('common.form.valid') }}
                          disabled={isPending}
                          onChange={() => handleInputChange('userId')}
                        />

                        {errors.userId?.message && (
                          <div className="invalid-feedback">
                            {errors.userId?.message}
                          </div>
                        )}
                        {!errors.userId && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="title">
                          {t('columns.address.title')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('title')}`}
                          {...register('title', {
                            onChange: () => handleInputChange('title'),
                            onBlur: () => handleInputChange('title'),
                          })}
                          readOnly={isPending}
                          placeholder="배송지명"
                        />
                        {errors.title?.message && (
                          <div className="invalid-feedback">
                            {errors.title?.message}
                          </div>
                        )}
                        {!errors.title && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="name">
                          {t('columns.address.name')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('name')}`}
                          {...register('name', {
                            onChange: () => handleInputChange('name'),
                            onBlur: () => handleInputChange('name'),
                          })}
                          readOnly={isPending}
                          placeholder="수령인명"
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
                      <div className="mb-2">
                        <label className="form-label" htmlFor="zipcode">
                          {t('columns.address.zipcode')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('zipcode')}`}
                          {...register('zipcode', {
                            onChange: () => handleInputChange('zipcode'),
                            onBlur: () => handleInputChange('zipcode'),
                          })}
                          readOnly={isPending}
                          placeholder="우편번호"
                        />
                        {errors.zipcode?.message && (
                          <div className="invalid-feedback">
                            {errors.zipcode?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="addr1">
                          {t('columns.address.addr1')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('addr1')}`}
                          {...register('addr1', {
                            onChange: () => handleInputChange('addr1'),
                            onBlur: () => handleInputChange('addr1'),
                          })}
                          readOnly={isPending}
                          placeholder="주소"
                        />
                        {errors.addr1?.message && (
                          <div className="invalid-feedback">
                            {errors.addr1?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="addr2">
                          {t('columns.address.addr2')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('addr2')}`}
                          {...register('addr2', {
                            onChange: () => handleInputChange('addr2'),
                            onBlur: () => handleInputChange('addr2'),
                          })}
                          readOnly={isPending}
                          placeholder="상세주소"
                        />
                        {errors.addr2?.message && (
                          <div className="invalid-feedback">
                            {errors.addr2?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="hp">
                          {t('columns.address.hp')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('hp')}`}
                          {...register('hp', {
                            onChange: () => handleInputChange('hp'),
                            onBlur: () => handleInputChange('hp'),
                          })}
                          readOnly={isPending}
                          placeholder="휴대폰번호"
                        />
                        {errors.hp?.message && (
                          <div className="invalid-feedback">
                            {errors.hp?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="tel">
                          {t('columns.address.tel')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('tel')}`}
                          {...register('tel', {
                            onChange: () => handleInputChange('tel'),
                            onBlur: () => handleInputChange('tel'),
                          })}
                          readOnly={isPending}
                          placeholder="전화번호"
                        />
                        {errors.tel?.message && (
                          <div className="invalid-feedback">
                            {errors.tel?.message}
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
                        <label className="form-label" htmlFor="rmemo">
                          {t('columns.address.rmemo')}
                        </label>
                        <select
                          className={`form-select ${getInputClass('rmemo')}`}
                          {...register('rmemo', {
                            onChange: () => handleInputChange('rmemo'),
                          })}
                          disabled={isPending}
                        >
                          <option value="CALL_BEFORE">
                            오기 전, 연락주세요
                          </option>
                          <option value="KNOCK">노크해주세요</option>
                          <option value="MEET_OUTSIDE">
                            전화주시면 마중 나갈게요
                          </option>
                          <option value="CUSTOM">직접 입력</option>
                        </select>
                        {errors.rmemo?.message && (
                          <div className="invalid-feedback">
                            {errors.rmemo?.message}
                          </div>
                        )}
                      </div>
                      {watch('rmemo') === 'CUSTOM' && (
                        <div className="mb-2">
                          <label className="form-label" htmlFor="rmemoTxt">
                            {t('columns.address.rmemoTxt')}
                          </label>
                          <input
                            type="text"
                            className={`form-control ${getInputClass('rmemoTxt')}`}
                            {...register('rmemoTxt', {
                              onChange: () => handleInputChange('rmemoTxt'),
                              onBlur: () => handleInputChange('rmemoTxt'),
                            })}
                            readOnly={isPending}
                            placeholder="배송 메모를 입력하세요"
                          />
                          {errors.rmemoTxt?.message && (
                            <div className="invalid-feedback">
                              {errors.rmemoTxt?.message}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="mb-2">
                        <label className="form-label" htmlFor="doorPwd">
                          {t('columns.address.doorPwd')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('doorPwd')}`}
                          {...register('doorPwd', {
                            onChange: () => handleInputChange('doorPwd'),
                            onBlur: () => handleInputChange('doorPwd'),
                          })}
                          readOnly={isPending}
                          placeholder="현관 출입번호"
                        />
                        {errors.doorPwd?.message && (
                          <div className="invalid-feedback">
                            {errors.doorPwd?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="isDefault"
                            {...register('isDefault')}
                            disabled={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isDefault"
                          >
                            {t('columns.address.isDefault')}
                          </label>
                        </div>
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
                    href={`${getRouteUrl('address.index', locale)}?${searchParams.toString()}`}
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
