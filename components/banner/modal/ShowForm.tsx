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
import { UpdateType, UpdateSchema } from '@/actions/banner/update/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ImageView from '../ImageView';
import { useQuery } from '@tanstack/react-query';
import { bannerQK } from '@/lib/queryKeys/banner';
import { showAction } from '@/actions/banner/show';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: IBannerPart;
};

export default function ShowForm({ uid }: Props) {
  const { dictionary, t } = useLanguage();
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: bannerQK.detail(uid),
    queryFn: () => showAction(uid),
    staleTime: 30_000,
  });

  const { register, setValue, getValues } = useForm<UpdateType>({
    mode: 'onChange',
    resolver: zodResolver(UpdateSchema(dictionary.common.form)),
  });

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
    setValue('gubun', data.gubun ?? '', { shouldValidate: true });
    setValue('title', data.title ?? '', { shouldValidate: true });
    setValue('deviceType', (data as any).deviceType ?? '');
    setValue('url', (data as any).url ?? '');

    setValue('isUse', !!(data as any).isUse);
    setValue('isVisible', !!(data as any).isVisible);

    if (data.BannerFile) {
      const initialImages =
        data.BannerFile.map((file: any) => ({
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
                            <label className="form-label" htmlFor="gubun">
                              {t('columns.banner.gubun')}
                            </label>
                            <input
                              type="text"
                              className={`form-control`}
                              {...register('gubun')}
                              disabled={true}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="title">
                              {t('columns.banner.title')}
                            </label>

                            <input
                              type="text"
                              className={`form-control`}
                              {...register('title')}
                              disabled={true}
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
                              {t('columns.banner.deviceType')}
                            </label>

                            <select
                              className={`form-select`}
                              defaultValue=""
                              {...register('deviceType')}
                              disabled={true}
                            >
                              <option value="all">all</option>
                              <option value="pc">pc</option>
                              <option value="mobile">mobile</option>
                            </select>
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="url">
                              {t('columns.banner.url')}
                            </label>

                            <input
                              type="text"
                              className={`form-control`}
                              {...register('url')}
                              disabled={true}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="isUse">
                              {t('columns.banner.isUse')}
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
                              {t('columns.banner.isVisible')}
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
                        <ImageView images={uploadedImages} />
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
