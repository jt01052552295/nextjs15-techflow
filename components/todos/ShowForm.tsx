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

import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ITodosPart, ITodosOption } from '@/types/todos';

type TypeProps = {
  rs: ITodosPart;
};

export default function ShowForm(props: TypeProps) {
  const { dictionary, locale, t } = useLanguage();
  const { queryString } = useTodoListParams();
  const [isDataFetched, setIsDataFetched] = useState<boolean | undefined>(
    false,
  );
  const [optionData, setOptionData] = useState<ITodosOption[]>([]);

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

      if (props.rs.TodosOption) {
        setOptionData(props.rs.TodosOption);
      }
    }
  }, [props.rs, setValue]);

  useEffect(() => {
    if (!isDataFetched) {
      onSubmit();
      setIsDataFetched(true);
    }
  }, [isDataFetched, onSubmit]);

  return (
    <>
      <div>
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
                          __html: getValues('content2') as string | TrustedHTML,
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
                        className={`form-select`}
                        defaultValue=""
                        {...register('gender')}
                        disabled={true}
                      >
                        <option value="">{t('common.choose')}</option>
                        <option value="male">{t('common.gender.male')}</option>
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
                        <label className="form-check-label" htmlFor="isUse">
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
                        <label className="form-check-label" htmlFor="isVisible">
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
                <div className="row g-4">
                  {optionData.length > 0 ? (
                    optionData.map((v, index) => (
                      <div key={index} className="col-md-6">
                        <div className="p-4 rounded-4 shadow-sm bg-white border h-100 d-flex flex-column justify-content-center align-items-center text-center">
                          <div className="mb-3 w-100">
                            <h4 className="fw-bold text-dark mb-0">
                              #{index + 1}
                            </h4>
                          </div>
                          <div className="mb-2 w-100">
                            <div className="text-secondary small">이름</div>
                            <div className="fs-4 fw-semibold">{v.name}</div>
                          </div>
                          <div className="mb-2 w-100">
                            <div className="text-secondary small">나이</div>
                            <div className="fs-4 fw-semibold">{v.age}</div>
                          </div>
                          <div className="w-100">
                            <div className="text-secondary small">성별</div>
                            <div className="fs-4 fw-semibold">{v.gender}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-center text-muted">
                      추가 정보가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="row justify-content-between align-items-center mt-3 mb-3">
              <div className="col-auto"></div>
              <div className="col-auto">
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
      </div>
    </>
  );
}
