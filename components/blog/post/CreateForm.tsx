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
import { CreateType, CreateSchema } from '@/actions/blog/post/create/schema';
import { createAction } from '@/actions/blog/post/create';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/blog/post/modal/ResultConfirm';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import FormTextField from '@/components/common/form/FormTextField';
import FormSwitch from '@/components/common/form/FormSwitch';

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
      content: '',
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
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

          queryClient.invalidateQueries({ queryKey: ['blogPost', 'list'] });

          // 상세로 이동
          // const qs = searchParams.toString();
          // queryClient.setQueryData(blogPostQK.detail(newItem.uid), newItem);
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
                          label={t('columns.blogPost.userId')}
                          name="userId"
                          register={register}
                          error={errors?.userId}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.userId}
                          readOnly={isPending}
                          onChange={() => handleInputChange('userId')}
                          onBlur={() => handleInputChange('userId')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.blogPost.content')}
                          name="content"
                          register={register}
                          error={errors?.content}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.content}
                          readOnly={isPending}
                          onChange={() => handleInputChange('content')}
                          onBlur={() => handleInputChange('content')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.blogPost.linkUrl')}
                          name="linkUrl"
                          register={register}
                          error={errors?.linkUrl}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.linkUrl}
                          readOnly={isPending}
                          onChange={() => handleInputChange('linkUrl')}
                          onBlur={() => handleInputChange('linkUrl')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.blogPost.postCategoryId')}
                          name="postCategoryId"
                          register={register}
                          error={errors?.postCategoryId}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.postCategoryId}
                          readOnly={isPending}
                          onChange={() => handleInputChange('postCategoryId')}
                          onBlur={() => handleInputChange('postCategoryId')}
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
                          label={t('columns.blogPost.status')}
                          name="status"
                          register={register}
                          error={errors?.status}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.status}
                          readOnly={isPending}
                          onChange={() => handleInputChange('status')}
                          onBlur={() => handleInputChange('status')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.blogPost.visibility')}
                          name="visibility"
                          register={register}
                          error={errors?.visibility}
                          validMessage={t('common.form.valid')}
                          isDirty={!!dirtyFields.visibility}
                          readOnly={isPending}
                          onChange={() => handleInputChange('visibility')}
                          onBlur={() => handleInputChange('visibility')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormSwitch
                          label={t('columns.blogPost.isPinned')}
                          name={`isPinned` as any}
                          register={register}
                          error={errors?.isPinned}
                          isDirty={!!dirtyFields.isPinned}
                          switchLabel={t('common.yes')}
                          disabled={isPending}
                          onChange={() => handleInputChange(`isPinned`)}
                          onBlur={() => handleInputChange(`isPinned`)}
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
                    href={`${getRouteUrl('blogPost.index', locale)}?${searchParams.toString()}`}
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
