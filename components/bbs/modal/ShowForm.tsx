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
import { UpdateType, UpdateSchema } from '@/actions/bbs/update/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CommentSection from '../comment/CommentSection';
import { useQuery } from '@tanstack/react-query';
import { bbsQK } from '@/lib/queryKeys/bbs';
import { showAction } from '@/actions/bbs/show';
import FileViewer from '../FileViewer';
import UserProfileDisplay from '@/components/common/UserProfileDisplay';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: ITodosPart;
};

export default function ShowForm({ uid }: Props) {
  const { dictionary, t } = useLanguage();
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: bbsQK.detail(uid),
    queryFn: () => showAction(uid),
    staleTime: 30_000,
  });

  const { register, setValue, getValues } = useForm<UpdateType>({
    mode: 'onChange',
    resolver: zodResolver(UpdateSchema(dictionary.common.form)),
  });

  const [uploadedFiles, setFiles] = useState<
    {
      name: string;
      url: string;
      originalName: string;
      size: number;
      ext: string;
      type: string;
    }[]
  >([]);

  const seededRef = useRef(false);
  const staticUrl = useMemo(() => process.env.NEXT_PUBLIC_STATIC_URL ?? '', []);

  const seedFormFromData = useCallback(async () => {
    if (!data) return;
    if (seededRef.current) return;
    // console.log('edit form', props.uid)
    console.log(data);

    setValue('uid', data.uid ?? '', { shouldValidate: true });
    setValue('cid', data.cid ?? '', { shouldValidate: true });

    setValue('bdTable', data.bdTable ?? '', { shouldValidate: true });
    setValue('userId', data.userId ?? '');
    setValue('name', data.name ?? '', { shouldValidate: true });
    setValue('password', '', { shouldValidate: true });
    setValue('notice', data.notice ?? false);
    setValue('secret', data.secret ?? false);
    setValue('category', data.category ?? '');
    setValue('subject', data.subject ?? '', { shouldValidate: true });
    setValue('content', data.content ?? '', { shouldValidate: true });
    setValue('contentA', data.contentA ?? null);
    setValue('ipAddress', data.ipAddress ?? '');
    setValue('link1', data.link1 ?? '');
    setValue('link2', data.link2 ?? '');

    setValue('isUse', !!(data as any).isUse);
    setValue('isVisible', !!(data as any).isVisible);

    if (data.files) {
      const initialImages =
        data.files.map((file: any) => ({
          name: file.name,
          url: file.url,
          originalName: file.originalName, // 업로드한 원본 이름
          size: file.size, // 파일 크기 (bytes)
          ext: file.ext, // 확장자명
          type: file.type, // MIME 타입
        })) ?? [];
      setFiles(initialImages);
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
                            <label className="form-label" htmlFor="bdTable">
                              {t('columns.bbs.bdTable')}
                            </label>
                            <input
                              type="text"
                              className={`form-control`}
                              {...register('bdTable')}
                              disabled={true}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="userId">
                              {t('columns.bbs.userId')}
                            </label>

                            <UserProfileDisplay user={data.user} />

                            <input
                              type="text"
                              className={`form-control`}
                              {...register('userId')}
                              disabled={true}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="name">
                              {t('columns.bbs.name')}
                            </label>

                            <input
                              type="text"
                              className={`form-control`}
                              {...register('name')}
                              disabled={true}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="subject">
                              {t('columns.bbs.subject')}
                            </label>

                            <input
                              type="text"
                              className={`form-control`}
                              {...register('subject')}
                              disabled={true}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="content">
                              {t('columns.bbs.content')}
                            </label>
                            <div
                              className="content-display"
                              dangerouslySetInnerHTML={{
                                __html: getValues('content') as
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
                            <label className="form-label" htmlFor="notice">
                              {t('columns.bbs.notice')}
                            </label>
                            <div className="form-check form-switch">
                              <input
                                className={`form-check-input `}
                                type="checkbox"
                                role="switch"
                                id="notice"
                                {...register('notice')}
                                disabled={true}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="notice"
                              >
                                {t('common.usage')}
                              </label>
                            </div>
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="secret">
                              {t('columns.bbs.secret')}
                            </label>
                            <div className="form-check form-switch">
                              <input
                                className={`form-check-input `}
                                type="checkbox"
                                role="switch"
                                id="secret"
                                {...register('secret')}
                                disabled={true}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="secret"
                              >
                                {t('common.usage')}
                              </label>
                            </div>
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="category">
                              {t('columns.bbs.category')}
                            </label>

                            <input
                              type="text"
                              className={`form-control`}
                              {...register('category')}
                              disabled={true}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="link1">
                              {t('columns.bbs.link1')}
                            </label>

                            <input
                              type="text"
                              className={`form-control`}
                              {...register('link1')}
                              disabled={true}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="link2">
                              {t('columns.bbs.link2')}
                            </label>

                            <input
                              type="text"
                              className={`form-control`}
                              {...register('link2')}
                              disabled={true}
                            />
                          </div>
                          <div className="mb-2">
                            <label className="form-label" htmlFor="isUse">
                              {t('columns.bbs.isUse')}
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
                              {t('columns.bbs.isVisible')}
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
                        <FileViewer files={uploadedFiles} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-12 mb-2">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title m-0">
                        {t('columns.bbs.comments')}
                      </h5>
                    </div>
                    <div className="card-body">
                      <CommentSection pid={uid} bdTable={data.bdTable} />
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
