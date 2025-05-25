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
import { useRouter } from 'next/navigation';
import { useTodoListParams } from '../hooks/useTodoListParams';
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

import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ITodosPart } from '@/types/todos';

type TypeProps = {
  rs: ITodosPart;
};

export default function ShowForm(props: TypeProps) {
  const { dictionary, locale, t } = useLanguage();
  const router = useRouter();
  const { queryString } = useTodoListParams();
  const [isDataFetched, setIsDataFetched] = useState<boolean | undefined>(
    false,
  );

  const { register, setValue, getValues } = useForm<UpdateTodosType>({
    mode: 'onChange',
    resolver: zodResolver(UpdateTodosSchema(dictionary.common.form)),
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
    }
  }, [props.rs, setValue]);

  useEffect(() => {
    if (!isDataFetched) {
      onSubmit();
      setIsDataFetched(true);
    }
  }, [isDataFetched, onSubmit]);

  const onClickClose = () => {
    router.back();
  };

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content" style={{ maxHeight: '70vh' }}>
            <div className="modal-header">
              <h1 className="modal-title fs-5">{props.rs.uid ?? '-'}</h1>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClickClose}
              ></button>
            </div>
            <div className={`modal-body `}>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title m-0">
                        {t('common.basic_info')}
                      </h5>
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
                              className={`form-control`}
                              {...register('name')}
                              disabled={true}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="email">
                              {t('columns.todos.email')}
                            </label>

                            <input
                              type="text"
                              className={`form-control`}
                              {...register('email')}
                              disabled={true}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="content">
                              {t('columns.todos.content')}
                            </label>
                            <TextareaAutosize
                              className={`form-control`}
                              maxRows={10}
                              {...register('content')}
                              disabled={true}
                            ></TextareaAutosize>
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="content2">
                              {t('columns.todos.content2')}
                            </label>
                            <div
                              className="content-display"
                              dangerouslySetInnerHTML={{
                                __html: getValues('content2') as
                                  | string
                                  | TrustedHTML,
                              }}
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
                      <h5 className="card-title m-0">
                        {t('common.other_info')}
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col">
                          <div className="mb-2">
                            <label className="form-label">
                              {t('columns.todos.gender')}
                            </label>

                            <select
                              className={`form-select`}
                              defaultValue=""
                              {...register('gender')}
                              disabled={true}
                            >
                              <option value="">{t('common.choose')}</option>
                              <option value="male">
                                {t('common.gender.male')}
                              </option>
                              <option value="female">
                                {t('common.gender.female')}
                              </option>
                            </select>
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="ipAddress">
                              {t('columns.todos.ipAddress')}
                            </label>

                            <input
                              type="text"
                              className={`form-control`}
                              {...register('ipAddress')}
                              disabled={true}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="isUse">
                              {t('columns.todos.isUse')}
                            </label>
                            <div className="form-check form-switch">
                              <input
                                className={`form-check-input `}
                                type="checkbox"
                                role="switch"
                                id="isUse"
                                {...register('isUse')}
                                disabled={true}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="isUse"
                              >
                                {t('common.usage')}
                              </label>
                            </div>
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="isVisible">
                              {t('columns.todos.isVisible')}
                            </label>
                            <div className="form-check form-switch">
                              <input
                                className={`form-check-input `}
                                type="checkbox"
                                role="switch"
                                id="isVisible"
                                {...register('isVisible')}
                                disabled={true}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="isVisible"
                              >
                                {t('common.visible')}
                              </label>
                            </div>
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
                          <div className="mb-2">OptionForm</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClickClose}
              >
                {dictionary.common.close}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
