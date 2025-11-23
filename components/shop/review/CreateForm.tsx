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
import { CreateType, CreateSchema } from '@/actions/shop/review/create/schema';
import { createAction } from '@/actions/shop/review/create';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/shop/review/modal/ResultConfirm';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import FormSelect, { SelectOption } from '@/components/common/form/FormSelect';
import FormTextField from '@/components/common/form/FormTextField';
import FormTextarea from '@/components/common/form/FormTextarea';
import FormEditor from '@/components/common/form/FormEditor';
import FormSwitch from '@/components/common/form/FormSwitch';
import UserSelect from '@/components/common/UserSelect';

export default function CreateForm() {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);

  const cntOptions: SelectOption[] = [
    { value: '1', label: '1점' },
    { value: '2', label: '2점' },
    { value: '3', label: '3점' },
    { value: '4', label: '4점' },
    { value: '5', label: '5점' },
  ];

  const methods = useForm<CreateType>({
    mode: 'onChange',
    resolver: zodResolver(CreateSchema(dictionary.common.form)),
    defaultValues: {
      uid: uuidv4(),
      name: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    reset,
    control,
    trigger,
    watch,
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

          queryClient.invalidateQueries({ queryKey: ['shopReview', 'list'] });

          // 상세로 이동
          // const qs = searchParams.toString();
          // queryClient.setQueryData(shopReviewQK.detail(newItem.uid), newItem);
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
                        <FormTextField
                          label={t('columns.shopReview.orderId')}
                          name="orderId"
                          register={register}
                          error={errors?.orderId}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.orderId}
                          readOnly={isPending}
                          onChange={() => handleInputChange('orderId')}
                          onBlur={() => handleInputChange('orderId')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopReview.itemId')}
                          name="itemId"
                          register={register}
                          error={errors?.itemId}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.itemId}
                          readOnly={isPending}
                          onChange={() => handleInputChange('itemId')}
                          onBlur={() => handleInputChange('itemId')}
                        />
                      </div>

                      <div className="mb-2">
                        <UserSelect
                          name="userId"
                          control={control}
                          label={t('columns.shopReview.userId')}
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
                        <FormTextField
                          label={t('columns.shopReview.subject')}
                          name="subject"
                          register={register}
                          error={errors?.subject}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.subject}
                          readOnly={isPending}
                          onChange={() => handleInputChange('subject')}
                          onBlur={() => handleInputChange('subject')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextarea
                          label={t('columns.shopReview.content')}
                          name="content"
                          register={register}
                          error={errors.content}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.content}
                          readOnly={isPending}
                          minRows={3}
                          maxRows={10}
                          onChange={() => handleInputChange('content')}
                          onBlur={() => handleInputChange('content')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormSelect
                          label={t('columns.shopReview.score')}
                          name="score"
                          register={register}
                          options={cntOptions}
                          error={errors.score}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.score}
                          placeholder={t('common.choose')}
                          onChange={() => handleInputChange('score')}
                          onBlur={() => handleInputChange('score')}
                        />
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
                        <FormTextField
                          label={t('columns.shopReview.name')}
                          name="name"
                          register={register}
                          error={errors?.name}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.name}
                          readOnly={isPending}
                          onChange={() => handleInputChange('name')}
                          onBlur={() => handleInputChange('name')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopReview.email')}
                          name="email"
                          register={register}
                          error={errors?.email}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.email}
                          readOnly={isPending}
                          onChange={() => handleInputChange('email')}
                          onBlur={() => handleInputChange('email')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormSwitch
                          label={t('columns.shopReview.isSecret')}
                          name={`isSecret` as any}
                          register={register}
                          error={errors?.isSecret}
                          isDirty={!!dirtyFields.isSecret}
                          switchLabel={t('common.yes')}
                          disabled={isPending}
                          onChange={() => handleInputChange(`isSecret`)}
                          onBlur={() => handleInputChange(`isSecret`)}
                        />
                      </div>
                      <div className="mb-2">
                        <FormSwitch
                          label={t('columns.shopReview.isAdmin')}
                          name={`isAdmin` as any}
                          register={register}
                          error={errors?.isAdmin}
                          isDirty={!!dirtyFields.isAdmin}
                          switchLabel={t('common.yes')}
                          disabled={isPending}
                          onChange={() => handleInputChange(`isAdmin`)}
                          onBlur={() => handleInputChange(`isAdmin`)}
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
                    href={`${getRouteUrl('shopReview.index', locale)}?${searchParams.toString()}`}
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
