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
import { useTodoListParams } from './hooks/useTodoListParams';
import Link from 'next/link';
import { getRouteUrl } from '@/utils/routes';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faSave, faRefresh } from '@fortawesome/free-solid-svg-icons';
import TextareaAutosize from 'react-textarea-autosize';
import {
  UpdateTodosType,
  UpdateTodosSchema,
} from '@/actions/todos/update/schema';
import { updateAction } from '@/actions/todos/update';
import {
  FormProvider,
  SubmitHandler,
  useForm,
  Controller,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/todos/modal/ResultConfirm';
import { useListMemory } from '@/hooks/useListMemory';
import { ITodosPart } from '@/types/todos';
import { OptionForm } from './OptionForm';
import QEditor from '@/components/editor/QEditor';
import ImageUploader from './ImageUploader';
import FileUploader from './FileUploader';

type TypeProps = {
  rs: ITodosPart;
};

export default function EditForm(props: TypeProps) {
  const { dictionary, locale, t } = useLanguage();
  const { queryString } = useTodoListParams();
  const [isDataFetched, setIsDataFetched] = useState<boolean | undefined>(
    false,
  );
  const [uploadedImages, setUploadedImages] = useState<any[]>([]); // ✅ 업로드된 이미지 상태
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);

  const pathname = 'todos';
  const listMemory = useListMemory(pathname);

  const methods = useForm<UpdateTodosType>({
    mode: 'onChange',
    resolver: zodResolver(UpdateTodosSchema(dictionary.common.form)),
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

  const { handleInputChange, getInputClass } = useFormUtils<UpdateTodosType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const onSubmit = useCallback(async () => {
    // console.log('edit form', props.uid)
    // console.log(props.rs)
    if (props.rs) {
      setValue('uid', props.rs.uid ?? '', { shouldValidate: true });
      setValue('cid', props.rs.cid ?? '', { shouldValidate: true });
      setValue('name', props.rs.name ?? '', { shouldValidate: true });
      setValue('email', props.rs.email ?? '', { shouldValidate: true });
      setValue('gender', props.rs.gender ?? '');
      setValue('ipAddress', props.rs.ipAddress ?? '');

      setValue('content', props.rs.content);
      setValue('content2', props.rs.content2);
      setValue('isUse', props.rs.isUse);
      setValue('isVisible', props.rs.isVisible);
      if (props.rs.TodosOption) {
        setValue('todoOption', props.rs.TodosOption, { shouldValidate: true });
      }

      if (props.rs.TodosFile) {
        const initialImages = props.rs.TodosFile.map((file) => ({
          preview: process.env.NEXT_PUBLIC_STATIC_URL + file.url,
          name: file.name,
          url: file.url,
        }));
        console.log(initialImages);
        setUploadedImages(initialImages);
      }
    }
  }, [props.rs, setValue]);

  useEffect(() => {
    if (!isDataFetched) {
      onSubmit();
      setIsDataFetched(true);
    }
  }, [isDataFetched, onSubmit]);

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

  const formAction: SubmitHandler<UpdateTodosType> = (data) => {
    startTransition(async () => {
      try {
        const validOptions =
          data.todoOption?.filter((opt) => !opt._delete) ?? [];
        const deleteOptions =
          data.todoOption?.filter((opt) => opt._delete && opt.uid) ?? [];

        const finalData = {
          ...data,
          todoOption: validOptions,
          deleteOptionUids: deleteOptions
            .map((opt) => opt.uid)
            .filter(Boolean) as string[],
          todoFile: uploadedImages,
          deleteFileUrls: deletedImages, // ✅ 삭제된 이미지들
        };
        console.log(finalData);
        const response = await updateAction(finalData);
        console.log(response);
        if (response.status == 'success') {
          const updatedItem = response.data as ITodosPart;
          const memory = listMemory.restore();

          const updatedItems = (memory.items as ITodosPart[]).map((item) =>
            item.uid === updatedItem.uid ? updatedItem : item,
          );

          listMemory.save({
            ...memory,
            items: updatedItems,
          });

          toast.success(response.message);
          // reset();
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

  const formReset = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSubmit();
    setIsDataFetched(false);
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(formAction)}>
          <input type="hidden" {...register('uid')} />
          <input type="hidden" {...register('cid')} />
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
                        <label className="form-label" htmlFor="name">
                          {t('columns.todos.name')}
                        </label>
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
                      <div className="mb-2">
                        <label className="form-label" htmlFor="email">
                          {t('columns.todos.email')}
                        </label>

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
                      <div className="mb-2">
                        <label className="form-label" htmlFor="content">
                          {t('columns.todos.content')}
                        </label>
                        <TextareaAutosize
                          className={`form-control ${getInputClass('content')}`}
                          maxRows={10}
                          {...register('content', {
                            onChange: () => handleInputChange('content'),
                            onBlur: () => handleInputChange('content'),
                          })}
                          readOnly={isPending}
                        ></TextareaAutosize>
                        {errors.content?.message && (
                          <div className="invalid-feedback">
                            {errors.content?.message}
                          </div>
                        )}
                        {!errors.content && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="content2">
                          {t('columns.todos.content2')}
                        </label>

                        <Controller
                          name="content2"
                          control={control}
                          render={({ field, fieldState }) => (
                            <>
                              <QEditor
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                              />
                              {fieldState.error?.message && (
                                <div className="invalid-feedback d-block">
                                  {fieldState.error.message}
                                </div>
                              )}
                            </>
                          )}
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
                        <label className="form-label">
                          {t('columns.todos.gender')}
                        </label>

                        <select
                          className={`form-select ${getInputClass('gender')}`}
                          defaultValue=""
                          {...register('gender', {
                            onChange: () => handleInputChange('gender'),
                            onBlur: () => handleInputChange('gender'),
                          })}
                        >
                          <option value="">{t('common.choose')}</option>
                          <option value="male">
                            {t('common.gender.male')}
                          </option>
                          <option value="female">
                            {t('common.gender.female')}
                          </option>
                        </select>
                        {errors.gender?.message && (
                          <div className="invalid-feedback">
                            {errors.gender?.message}
                          </div>
                        )}
                        {!errors.gender && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="ipAddress">
                          {t('columns.todos.ipAddress')}
                        </label>

                        <input
                          type="text"
                          className={`form-control ${getInputClass('ipAddress')}`}
                          {...register('ipAddress', {
                            onChange: () => handleInputChange('ipAddress'),
                            onBlur: () => handleInputChange('ipAddress'),
                          })}
                          readOnly={isPending}
                        />
                        {errors.ipAddress?.message && (
                          <div className="invalid-feedback">
                            {errors.ipAddress?.message}
                          </div>
                        )}
                        {!errors.ipAddress && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="isUse">
                          {t('columns.todos.isUse')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('isUse')}`}
                            type="checkbox"
                            role="switch"
                            id="isUse"
                            {...register('isUse', {
                              onChange: () => handleInputChange('isUse'),
                              onBlur: () => handleInputChange('isUse'),
                            })}
                            readOnly={isPending}
                          />
                          <label className="form-check-label" htmlFor="isUse">
                            {t('common.usage')}
                          </label>
                        </div>

                        {errors.isUse?.message && (
                          <div className="invalid-feedback">
                            {errors.isUse?.message}
                          </div>
                        )}
                        {!errors.isUse && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label" htmlFor="isVisible">
                          {t('columns.todos.isVisible')}
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className={`form-check-input ${getInputClass('isVisible')}`}
                            type="checkbox"
                            role="switch"
                            id="isVisible"
                            {...register('isVisible', {
                              onChange: () => handleInputChange('isVisible'),
                              onBlur: () => handleInputChange('isVisible'),
                            })}
                            readOnly={isPending}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isVisible"
                          >
                            {t('common.visible')}
                          </label>
                        </div>

                        {errors.isVisible?.message && (
                          <div className="invalid-feedback">
                            {errors.isVisible?.message}
                          </div>
                        )}
                        {!errors.isVisible && (
                          <div className="valid-feedback">
                            {t('common.form.valid')}
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <label className="form-label" htmlFor="todoFile">
                          {t('columns.todos.TodosFile')}
                          <small className="text-muted ms-1">
                            {t('common.upload.info_message', {
                              count: '4',
                              size: '20',
                            })}
                          </small>
                        </label>
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
                    <div className="col">
                      <div className="mb-2">
                        <ImageUploader
                          dir={pathname}
                          pid={watch('uid')}
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
                    {t('common.additional_info')}
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col">
                      <div className="mb-2">
                        <FileUploader />
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
                    <div className="col">
                      <div className="mb-2">
                        <OptionForm />
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
                    href={`${getRouteUrl('todos.index', locale)}?${queryString}`}
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
