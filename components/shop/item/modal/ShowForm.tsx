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
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/context/LanguageContext';
import TextareaAutosize from 'react-textarea-autosize';
import { UpdateType, UpdateSchema } from '@/actions/shop/item/update/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IShopItemOption } from '@/types/shop/item';
import CommentSection from '../comment/CommentSection';
import ImageView from '../ImageView';
import { useQuery } from '@tanstack/react-query';
import { shopItemQK } from '@/lib/queryKeys/shop/item';
import { showAction } from '@/actions/shop/item/show';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: IShopItemPart;
};

export default function ShowForm({ uid }: Props) {
  const { dictionary, t } = useLanguage();
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: shopItemQK.detail(uid),
    queryFn: () => showAction(uid),
    staleTime: 30_000,
  });

  const { register, setValue, getValues } = useForm<UpdateType>({
    mode: 'onChange',
    resolver: zodResolver(UpdateSchema(dictionary.common.form)),
  });

  const [optionData, setOptionData] = useState<IShopItemOption[]>([]);
  const [uploadedImages, setUploadedImages] = useState<
    { preview: string; name: string; url: string }[]
  >([]);

  const seededRef = useRef(false);
  const staticUrl = useMemo(() => process.env.NEXT_PUBLIC_STATIC_URL ?? '', []);

  const seedFormFromData = useCallback(async () => {
    if (!data) return;
    if (seededRef.current) return;
    // console.log('edit form', props.uid)
    // console.log(props.rs)

    setValue('uid', data.uid ?? '', { shouldValidate: true });
    setValue('cid', data.cid ?? '', { shouldValidate: true });
    setValue('name', data.name ?? '', { shouldValidate: true });
    setValue('email', data.email ?? '', { shouldValidate: true });
    setValue('gender', (data as any).gender ?? '');
    setValue('ipAddress', (data as any).ipAddress ?? '');

    setValue('content', (data as any).content ?? null);
    setValue('content2', (data as any).content2 ?? null);
    setValue('isUse', !!(data as any).isUse);
    setValue('isVisible', !!(data as any).isVisible);

    if (data.TodosOption) {
      setOptionData(data.TodosOption);
    }
    if (data.TodosFile) {
      const initialImages =
        data.TodosFile.map((file: any) => ({
          preview: staticUrl + file.url,
          name: file.name,
          url: file.url,
        })) ?? [];
      setUploadedImages(initialImages);
    }
    seededRef.current = true;
  }, [data, setValue, staticUrl]);

  useEffect(() => {
    if (data) seedFormFromData();
  }, [data, seedFormFromData]);

  if (isLoading) return <p>Loading...</p>;
  if (error || !data) return <p>{dictionary.common.failed_data}</p>;

  const onClickClose = () => {
    router.back();
  };

  //   const initialComments = Array.from({ length: 200 }, (_, i) => ({
  //     id: i + 1,
  //     writer: '관리자',
  //     content: `테스트 댓글입니다. (${i + 1})`,
  //     createdAt: new Date(Date.now() - i * 60000).toLocaleString(), // 1분씩 감소
  //   }));

  return (
    <>
      <div
        className="modal fade show d-block"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClickClose();
          }
        }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content" style={{ maxHeight: '70vh' }}>
            <div className="modal-header">
              <h3 className="modal-title fs-5">{t('common.view')}</h3>
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
                              {t('columns.shopItem.name')}
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
                              {t('columns.shopItem.email')}
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
                              {t('columns.shopItem.content')}
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
                              {t('columns.shopItem.content2')}
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
                              {t('columns.shopItem.gender')}
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
                              {t('columns.shopItem.ipAddress')}
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
                              {t('columns.shopItem.isUse')}
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
                              {t('columns.shopItem.isVisible')}
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
                              {t('columns.shopItem.TodosFile')}
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
                                  <div className="text-secondary small">
                                    {t('columns.shopItem.name')}
                                  </div>
                                  <div className="fs-4 fw-semibold">
                                    {v.name}
                                  </div>
                                </div>
                                <div className="mb-2 w-100">
                                  <div className="text-secondary small">
                                    {t('columns.shopItem.age')}
                                  </div>
                                  <div className="fs-4 fw-semibold">
                                    {v.age}
                                  </div>
                                </div>
                                <div className="w-100">
                                  <div className="text-secondary small">
                                    {t('columns.shopItem.gender')}
                                  </div>
                                  <div className="fs-4 fw-semibold">
                                    {v.gender}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-12 text-center text-muted">
                            {t('common.no_items')}
                          </div>
                        )}
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
                        <ImageView images={uploadedImages} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-12 mb-2">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title m-0">
                        {t('columns.shopItem.TodosComment')}
                      </h5>
                    </div>
                    <div className="card-body">
                      <CommentSection todoId={uid} />
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
