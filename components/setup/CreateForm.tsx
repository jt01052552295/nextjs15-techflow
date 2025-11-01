'use client';
import { useEffect, useState, useTransition, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { CreateType, CreateSchema } from '@/actions/setup/create/schema';
import { createAction } from '@/actions/setup/create';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/setup/modal/ResultConfirm';
import { useSearchParams } from 'next/navigation';
import TextareaAutosize from 'react-textarea-autosize';
import type { ISetup } from '@/types/setup';

type Props = {
  initialValues?: Partial<ISetup>;
};

const makeBaseDefaults = (uid: string): CreateType => ({
  uid,
  isDefault: false,
  snsFacebook: '',
  snsTwitter: '',
  snsInstagram: '',
  snsYoutube: '',
  snsLinkedin: '',
  snsKakao: '',
  snsNaver: '',
  idFilter: '',
  wordFilter: '',
  possibleIp: '',
  interceptIp: '',
  aosVersion: '',
  aosUpdate: '1',
  aosStoreApp: '',
  aosStoreWeb: '',
  iosVersion: '',
  iosUpdate: '1',
  iosStoreApp: '',
  iosStoreWeb: '',
  jsCssVer: '',
  isUse: true,
  isVisible: true,
});

function mapToForm(v?: Partial<ISetup>): CreateType {
  return {
    uid: '', // 자리표시자
    isDefault: !!v?.isDefault,
    snsFacebook: v?.snsFacebook ?? '',
    snsTwitter: v?.snsTwitter ?? '',
    snsInstagram: v?.snsInstagram ?? '',
    snsYoutube: v?.snsYoutube ?? '',
    snsLinkedin: v?.snsLinkedin ?? '',
    snsKakao: v?.snsKakao ?? '',
    snsNaver: v?.snsNaver ?? '',
    idFilter: v?.idFilter ?? '',
    wordFilter: v?.wordFilter ?? '',
    possibleIp: v?.possibleIp ?? '',
    interceptIp: v?.interceptIp ?? '',
    aosVersion: v?.aosVersion ?? '',
    aosUpdate: (v?.aosUpdate as '1' | '2' | undefined) ?? '1',
    aosStoreApp: v?.aosStoreApp ?? '',
    aosStoreWeb: v?.aosStoreWeb ?? '',
    iosVersion: v?.iosVersion ?? '',
    iosUpdate: (v?.iosUpdate as '1' | '2' | undefined) ?? '1',
    iosStoreApp: v?.iosStoreApp ?? '',
    iosStoreWeb: v?.iosStoreWeb ?? '',
    jsCssVer: v?.jsCssVer ?? '',
    isUse: v?.isUse ?? true,
    isVisible: v?.isVisible ?? true,
  };
}

export default function CreateForm({ initialValues }: Props) {
  const { dictionary, t } = useLanguage();

  const uidRef = useRef<string>(uuidv4());

  const mergedDefaults = useMemo<CreateType>(() => {
    const base = makeBaseDefaults(uidRef.current);
    if (!initialValues) return base;
    const mapped = mapToForm(initialValues);
    return { ...base, ...mapped, uid: initialValues.uid ?? base.uid };
  }, [initialValues]);

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);

  const methods = useForm<CreateType>({
    mode: 'onChange',
    resolver: zodResolver(CreateSchema(dictionary.common.form)),
    defaultValues: mergedDefaults,
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

  useEffect(() => {
    reset(mergedDefaults, { keepDirty: false, keepErrors: true });
  }, [mergedDefaults, reset]);

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
                        <label className="form-label" htmlFor="snsFacebook">
                          {t('columns.setup.snsFacebook')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('snsFacebook')}`}
                          {...register('snsFacebook', {
                            onChange: () => handleInputChange('snsFacebook'),
                            onBlur: () => handleInputChange('snsFacebook'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.snsFacebook?.message && (
                          <div className="invalid-feedback">
                            {errors.snsFacebook?.message}
                          </div>
                        )}
                        {!errors.snsFacebook && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="snsTwitter">
                          {t('columns.setup.snsTwitter')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('snsTwitter')}`}
                          {...register('snsTwitter', {
                            onChange: () => handleInputChange('snsTwitter'),
                            onBlur: () => handleInputChange('snsTwitter'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.snsTwitter?.message && (
                          <div className="invalid-feedback">
                            {errors.snsTwitter?.message}
                          </div>
                        )}
                        {!errors.snsTwitter && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="snsInstagram">
                          {t('columns.setup.snsInstagram')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('snsInstagram')}`}
                          {...register('snsInstagram', {
                            onChange: () => handleInputChange('snsInstagram'),
                            onBlur: () => handleInputChange('snsInstagram'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.snsInstagram?.message && (
                          <div className="invalid-feedback">
                            {errors.snsInstagram?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="snsYoutube">
                          {t('columns.setup.snsYoutube')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('snsYoutube')}`}
                          {...register('snsYoutube', {
                            onChange: () => handleInputChange('snsYoutube'),
                            onBlur: () => handleInputChange('snsYoutube'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.snsYoutube?.message && (
                          <div className="invalid-feedback">
                            {errors.snsYoutube?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="snsLinkedin">
                          {t('columns.setup.snsLinkedin')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('snsLinkedin')}`}
                          {...register('snsLinkedin', {
                            onChange: () => handleInputChange('snsLinkedin'),
                            onBlur: () => handleInputChange('snsLinkedin'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.snsLinkedin?.message && (
                          <div className="invalid-feedback">
                            {errors.snsLinkedin?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="snsKakao">
                          {t('columns.setup.snsKakao')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('snsKakao')}`}
                          {...register('snsKakao', {
                            onChange: () => handleInputChange('snsKakao'),
                            onBlur: () => handleInputChange('snsKakao'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.snsKakao?.message && (
                          <div className="invalid-feedback">
                            {errors.snsKakao?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="snsNaver">
                          {t('columns.setup.snsNaver')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('snsNaver')}`}
                          {...register('snsNaver', {
                            onChange: () => handleInputChange('snsNaver'),
                            onBlur: () => handleInputChange('snsNaver'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.snsNaver?.message && (
                          <div className="invalid-feedback">
                            {errors.snsNaver?.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="jsCssVer">
                          {t('columns.setup.jsCssVer')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('jsCssVer')}`}
                          {...register('jsCssVer', {
                            onChange: () => handleInputChange('jsCssVer'),
                            onBlur: () => handleInputChange('jsCssVer'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.jsCssVer?.message && (
                          <div className="invalid-feedback">
                            {errors.jsCssVer?.message}
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
                        <label className="form-label" htmlFor="idFilter">
                          {t('columns.setup.idFilter')}
                        </label>
                        <TextareaAutosize
                          className={`form-control ${getInputClass('idFilter')}`}
                          maxRows={10}
                          {...register('idFilter', {
                            onChange: () => handleInputChange('idFilter'),
                            onBlur: () => handleInputChange('idFilter'),
                          })}
                          readOnly={isPending}
                        ></TextareaAutosize>
                        {errors.idFilter?.message && (
                          <div className="invalid-feedback">
                            {errors.idFilter?.message}
                          </div>
                        )}
                        {!errors.idFilter && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="wordFilter">
                          {t('columns.setup.wordFilter')}
                        </label>
                        <TextareaAutosize
                          className={`form-control ${getInputClass('wordFilter')}`}
                          maxRows={10}
                          {...register('wordFilter', {
                            onChange: () => handleInputChange('wordFilter'),
                            onBlur: () => handleInputChange('wordFilter'),
                          })}
                          readOnly={isPending}
                        ></TextareaAutosize>
                        {errors.wordFilter?.message && (
                          <div className="invalid-feedback">
                            {errors.wordFilter?.message}
                          </div>
                        )}
                        {!errors.wordFilter && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="possibleIp">
                          {t('columns.setup.possibleIp')}
                        </label>
                        <TextareaAutosize
                          className={`form-control ${getInputClass('possibleIp')}`}
                          maxRows={10}
                          {...register('possibleIp', {
                            onChange: () => handleInputChange('possibleIp'),
                            onBlur: () => handleInputChange('possibleIp'),
                          })}
                          readOnly={isPending}
                        ></TextareaAutosize>
                        {errors.possibleIp?.message && (
                          <div className="invalid-feedback">
                            {errors.possibleIp?.message}
                          </div>
                        )}
                        {!errors.possibleIp && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="interceptIp">
                          {t('columns.setup.interceptIp')}
                        </label>
                        <TextareaAutosize
                          className={`form-control ${getInputClass('interceptIp')}`}
                          maxRows={10}
                          {...register('interceptIp', {
                            onChange: () => handleInputChange('interceptIp'),
                            onBlur: () => handleInputChange('interceptIp'),
                          })}
                          readOnly={isPending}
                        ></TextareaAutosize>
                        {errors.interceptIp?.message && (
                          <div className="invalid-feedback">
                            {errors.interceptIp?.message}
                          </div>
                        )}
                        {!errors.interceptIp && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
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
                            {t('columns.setup.isDefault')}
                          </label>
                        </div>
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
                    {t('common.additional_info')}
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <div className="mb-2">
                        <label className="form-label" htmlFor="aosVersion">
                          {t('columns.setup.aosVersion')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('aosVersion')}`}
                          {...register('aosVersion', {
                            onChange: () => handleInputChange('aosVersion'),
                            onBlur: () => handleInputChange('aosVersion'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.aosVersion?.message && (
                          <div className="invalid-feedback">
                            {errors.aosVersion?.message}
                          </div>
                        )}
                        {!errors.aosVersion && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label d-block">
                          {t('columns.setup.aosUpdate')}
                        </label>

                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="aosUpdate1"
                            value="1"
                            {...register('aosUpdate', {
                              onChange: () => handleInputChange('aosUpdate'),
                              onBlur: () => handleInputChange('aosUpdate'),
                            })}
                            disabled={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="aosUpdate1"
                          >
                            {t('columns.setup.optional')}
                          </label>
                        </div>

                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="aosUpdate2"
                            value="2"
                            {...register('aosUpdate', {
                              onChange: () => handleInputChange('aosUpdate'),
                              onBlur: () => handleInputChange('aosUpdate'),
                            })}
                            disabled={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="aosUpdate2"
                          >
                            {t('columns.setup.force')}
                          </label>
                        </div>

                        {errors.aosUpdate?.message && (
                          <div className="invalid-feedback d-block">
                            {errors.aosUpdate.message}
                          </div>
                        )}
                        {!errors.aosUpdate && (
                          <div className="valid-feedback d-block">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="aosStoreApp">
                          {t('columns.setup.aosStoreApp')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('aosStoreApp')}`}
                          {...register('aosStoreApp', {
                            onChange: () => handleInputChange('aosStoreApp'),
                            onBlur: () => handleInputChange('aosStoreApp'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.aosStoreApp?.message && (
                          <div className="invalid-feedback">
                            {errors.aosStoreApp?.message}
                          </div>
                        )}
                        {!errors.aosStoreApp && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="aosStoreWeb">
                          {t('columns.setup.aosStoreWeb')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('aosStoreWeb')}`}
                          {...register('aosStoreWeb', {
                            onChange: () => handleInputChange('aosStoreWeb'),
                            onBlur: () => handleInputChange('aosStoreWeb'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.aosStoreWeb?.message && (
                          <div className="invalid-feedback">
                            {errors.aosStoreWeb?.message}
                          </div>
                        )}
                        {!errors.aosStoreWeb && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <div className="mb-2">
                        <label className="form-label" htmlFor="iosVersion">
                          {t('columns.setup.iosVersion')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('iosVersion')}`}
                          {...register('iosVersion', {
                            onChange: () => handleInputChange('iosVersion'),
                            onBlur: () => handleInputChange('iosVersion'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.iosVersion?.message && (
                          <div className="invalid-feedback">
                            {errors.iosVersion?.message}
                          </div>
                        )}
                        {!errors.iosVersion && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label d-block">
                          {t('columns.setup.iosUpdate')}
                        </label>

                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="iosUpdate1"
                            value="1"
                            {...register('iosUpdate', {
                              onChange: () => handleInputChange('iosUpdate'),
                              onBlur: () => handleInputChange('iosUpdate'),
                            })}
                            disabled={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="iosUpdate1"
                          >
                            {t('columns.setup.optional')}
                          </label>
                        </div>

                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="iosUpdate2"
                            value="2"
                            {...register('iosUpdate', {
                              onChange: () => handleInputChange('iosUpdate'),
                              onBlur: () => handleInputChange('iosUpdate'),
                            })}
                            disabled={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="iosUpdate2"
                          >
                            {t('columns.setup.force')}
                          </label>
                        </div>

                        {errors.iosUpdate?.message && (
                          <div className="invalid-feedback d-block">
                            {errors.iosUpdate.message}
                          </div>
                        )}
                        {!errors.iosUpdate && (
                          <div className="valid-feedback d-block">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="iosStoreApp">
                          {t('columns.setup.iosStoreApp')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('iosStoreApp')}`}
                          {...register('iosStoreApp', {
                            onChange: () => handleInputChange('iosStoreApp'),
                            onBlur: () => handleInputChange('iosStoreApp'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.iosStoreApp?.message && (
                          <div className="invalid-feedback">
                            {errors.iosStoreApp?.message}
                          </div>
                        )}
                        {!errors.iosStoreApp && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="iosStoreWeb">
                          {t('columns.setup.iosStoreWeb')}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${getInputClass('iosStoreWeb')}`}
                          {...register('iosStoreWeb', {
                            onChange: () => handleInputChange('iosStoreWeb'),
                            onBlur: () => handleInputChange('iosStoreWeb'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.iosStoreWeb?.message && (
                          <div className="invalid-feedback">
                            {errors.iosStoreWeb?.message}
                          </div>
                        )}
                        {!errors.iosStoreWeb && (
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
              </div>
            </div>
          </div>
        </form>
        <ResultConfirm isOpen={isResultOpen} setIsOpen={setIsResultOpen} />
      </FormProvider>
    </>
  );
}
