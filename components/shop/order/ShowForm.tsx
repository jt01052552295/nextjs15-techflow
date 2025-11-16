'use client';
import {
  useEffect,
  useState,
  useTransition,
  useCallback,
  MouseEvent,
  useRef,
  ChangeEventHandler,
  useMemo,
} from 'react';

import Link from 'next/link';
import { getRouteUrl } from '@/utils/routes';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faList,
  faClipboardList,
  faBan,
} from '@fortawesome/free-solid-svg-icons';
import { UpdateType, UpdateSchema } from '@/actions/shop/order/update/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IShopOrderItem, IShopOrderPayment } from '@/types/shop/order';

import { useQueryClient, useQuery } from '@tanstack/react-query';
import { shopOrderQK } from '@/lib/queryKeys/shop/order';
import { showAction } from '@/actions/shop/order/show';
import { useSearchParams } from 'next/navigation';
import FormTextField from '@/components/common/form/FormTextField';
import UserProfileDisplay from '@/components/common/UserProfileDisplay';
import { formatKrw } from '@/lib/util';
import CancelStatusModal from '@/components/shop/order/modal/CancelStatusModal';
import OrderStatusModal from '@/components/shop/order/modal/OrderStatusModal';

type Props = {
  uid: string;
  baseParamsKey?: string;
};

export default function ShowForm({ uid }: Props) {
  const { dictionary, locale, t } = useLanguage();

  const searchParams = useSearchParams();

  const { data, isLoading, error } = useQuery({
    queryKey: shopOrderQK.detail(uid),
    queryFn: () => showAction(uid),
    staleTime: 30_000,
  });
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [modalType, setModalType] = useState<'single' | 'bulk'>('single');
  const [statusModalTarget, setStatusModalTarget] = useState<
    'order' | 'cancel' | null
  >(null);

  const [isOrderStatusOpen, setIsOrderStatusOpen] = useState(false);
  const [isCancelStatusOpen, setIsCancelStatusOpen] = useState(false);

  const { register, setValue, getValues } = useForm<UpdateType>({
    mode: 'onChange',
    resolver: zodResolver(UpdateSchema(dictionary.common.form)),
  });

  const [orderItem, setOrderItem] = useState<IShopOrderItem[]>([]);
  const [orderPayment, setOrderPayment] = useState<IShopOrderPayment[]>([]);

  const seededRef = useRef(false);
  const staticUrl = useMemo(() => process.env.NEXT_PUBLIC_STATIC_URL ?? '', []);

  const seedFormFromData = useCallback(async () => {
    if (!data) return;
    if (seededRef.current) return;

    if (data.ShopOrderItem && data.ShopOrderItem.length > 0) {
      setOrderItem(data.ShopOrderItem);
    }
    if (data.ShopOrderPayment && data.ShopOrderPayment.length > 0) {
      setOrderPayment(data.ShopOrderPayment);
    }

    setValue('uid', data.uid ?? '', { shouldValidate: true });
    setValue('ordNo', data.ordNo ?? '', { shouldValidate: true });
    setValue('shopId', data.shopId ?? 0, { shouldValidate: true });
    setValue('sellerId', data.sellerId ?? 0, { shouldValidate: true });
    setValue('gubun', data.gubun ?? '', { shouldValidate: true });

    // 금액 관련
    setValue('basicPrice', data.basicPrice ?? 0, { shouldValidate: true });
    setValue('optionPrice', data.optionPrice ?? 0, { shouldValidate: true });
    setValue('deliveryPrice', data.deliveryPrice ?? 0, {
      shouldValidate: true,
    });
    setValue('boxDc', data.boxDc ?? 0, { shouldValidate: true });
    setValue('payPrice', data.payPrice ?? 0, { shouldValidate: true });
    setValue('stock', data.stock ?? 0, { shouldValidate: true });

    // 메모 / 상태
    setValue('memo', data.memo ?? '', { shouldValidate: true });
    setValue('orderPaid', data.orderPaid ?? '', { shouldValidate: true });
    setValue('orderStatus', data.orderStatus ?? '', { shouldValidate: true });
    setValue('cancelStatus', data.cancelStatus ?? 'none', {
      shouldValidate: true,
    });

    // 취소 관련
    setValue('cancelRequestedBy', data.cancelRequestedBy ?? '', {
      shouldValidate: true,
    });
    setValue('cancelRequestedAt', data.cancelRequestedAt ?? '', {
      shouldValidate: true,
    });
    setValue('cancelReasonCode', data.cancelReasonCode ?? '', {
      shouldValidate: true,
    });
    setValue('cancelReasonText', data.cancelReasonText ?? '', {
      shouldValidate: true,
    });
    setValue('cancelRejectedReasonText', data.cancelRejectedReasonText ?? '', {
      shouldValidate: true,
    });

    // 결제 수단
    setValue('paymethod', data.paymethod ?? '', { shouldValidate: true });

    // 주문자 정보
    setValue('name', data.name ?? '', { shouldValidate: true });
    setValue('email', data.email ?? '', { shouldValidate: true });
    setValue('hp', data.hp ?? '', { shouldValidate: true });
    setValue('zipcode', data.zipcode ?? '', { shouldValidate: true });
    setValue('jibunAddr1', data.jibunAddr1 ?? '', { shouldValidate: true });
    setValue('jibunAddr2', data.jibunAddr2 ?? '', { shouldValidate: true });
    setValue('roadAddr1', data.roadAddr1 ?? '', { shouldValidate: true });
    setValue('roadAddr2', data.roadAddr2 ?? '', { shouldValidate: true });

    // 수령자 정보
    setValue('rcvStore', data.rcvStore ?? '', { shouldValidate: true });
    setValue('rcvName', data.rcvName ?? '', { shouldValidate: true });
    setValue('rcvHp', data.rcvHp ?? '', { shouldValidate: true });
    setValue('rcvEmail', data.rcvEmail ?? '', { shouldValidate: true });
    setValue('rcvDate', data.rcvDate ?? '', { shouldValidate: true });
    setValue('rcvAddr1', data.rcvAddr1 ?? '', { shouldValidate: true });
    setValue('rcvAddr2', data.rcvAddr2 ?? '', { shouldValidate: true });
    setValue('rcvZipcode', data.rcvZipcode ?? '', { shouldValidate: true });

    // 결제 관련

    setValue('payEmail', data.payEmail ?? '', { shouldValidate: true });
    setValue('payRepresent', data.payRepresent ?? 0, { shouldValidate: true });
    setValue('payDay', data.payDay ?? '', { shouldValidate: true });
    setValue('payYear', data.payYear ?? false, { shouldValidate: true });
    setValue('payPeople', data.payPeople ?? 0, { shouldValidate: true });

    // 기타
    setValue('createdAt', data.createdAt ?? '', { shouldValidate: true });
    setValue('isUse', data.isUse ?? true, { shouldValidate: true });
    setValue('isVisible', data.isVisible ?? true, { shouldValidate: true });

    seededRef.current = true;
  }, [data, setValue, staticUrl]);

  useEffect(() => {
    if (data) seedFormFromData();
  }, [data, seedFormFromData]);

  if (isLoading) return <p>Loading...</p>;
  if (error || !data) return <p>{dictionary.common.failed_data}</p>;

  const handleOrderStatusButtonClick = () => {
    const uid = getValues('uid');
    if (!uid) return;
    setSelectedUids([uid]);
    setModalType('single');
    setStatusModalTarget('order');
    setIsOrderStatusOpen(true);
  };

  const handleCancelStatusButtonClick = () => {
    const uid = getValues('uid');
    if (!uid) return;
    setSelectedUids([uid]);
    setModalType('single');
    setStatusModalTarget('cancel');
    setIsCancelStatusOpen(true);
  };

  return (
    <>
      <div>
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
                        label={t('columns.shopOrder.uid')}
                        name="uid"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.ordNo')}
                        name="ordNo"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.shopId')}
                        name="shopId"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.sellerId')}
                        name="sellerId"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.gubun')}
                        name="gubun"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.orderPaid')}
                        name="orderPaid"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.orderStatus')}
                        name="orderStatus"
                        register={register}
                        readOnly
                        disabled
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleOrderStatusButtonClick}
                      >
                        <FontAwesomeIcon icon={faClipboardList} />{' '}
                        {t('columns.shopOrder.orderStatus')}
                      </button>
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.cancelStatus')}
                        name="cancelStatus"
                        register={register}
                        readOnly
                        disabled
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={handleCancelStatusButtonClick}
                      >
                        <FontAwesomeIcon icon={faBan} />{' '}
                        {t('columns.shopOrder.cancelStatus')}
                      </button>
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.basicPrice')}
                        name="basicPrice"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.optionPrice')}
                        name="optionPrice"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.deliveryPrice')}
                        name="deliveryPrice"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.boxDc')}
                        name="boxDc"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.payPrice')}
                        name="payPrice"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.stock')}
                        name="stock"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.cancelRequestedBy')}
                        name="cancelRequestedBy"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.cancelRequestedAt')}
                        name="cancelRequestedAt"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.cancelReasonCode')}
                        name="cancelReasonCode"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.cancelReasonText')}
                        name="cancelReasonText"
                        register={register}
                        readOnly
                        disabled
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
                        label={t('columns.shopOrder.paymethod')}
                        name="paymethod"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.payEmail')}
                        name="payEmail"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.payRepresent')}
                        name="payRepresent"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.payDay')}
                        name="payDay"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.payPeople')}
                        name="payPeople"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.name')}
                        name="name"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.email')}
                        name="email"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.hp')}
                        name="hp"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.zipcode')}
                        name="zipcode"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.jibunAddr1')}
                        name="jibunAddr1"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.jibunAddr2')}
                        name="jibunAddr2"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.roadAddr1')}
                        name="roadAddr1"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.roadAddr2')}
                        name="roadAddr2"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.rcvStore')}
                        name="rcvStore"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.rcvName')}
                        name="rcvName"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.rcvHp')}
                        name="rcvHp"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.rcvEmail')}
                        name="rcvEmail"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.rcvDate')}
                        name="rcvDate"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.rcvAddr1')}
                        name="rcvAddr1"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.rcvAddr2')}
                        name="rcvAddr2"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.rcvZipcode')}
                        name="rcvZipcode"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.payYear')}
                        name="payYear"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.createdAt')}
                        name="createdAt"
                        register={register}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mb-2">
                      <FormTextField
                        label={t('columns.shopOrder.memo')}
                        name="memo"
                        register={register}
                        readOnly
                        disabled
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
                <div className="row g-4">
                  {orderPayment.length > 0 ? (
                    orderPayment.map((v, index) => (
                      <div key={index} className="col-md-6">
                        <div className="p-4 rounded-4 shadow-sm bg-white border h-100 d-flex flex-column justify-content-center align-items-center text-center">
                          <div className="mb-3 w-100">
                            <h4 className="fw-bold text-dark mb-0">
                              #{index + 1}
                            </h4>
                          </div>
                          <div className="mb-2 w-100">
                            <div className="text-secondary small">
                              {t('columns.shopOrderPayment.amount')}
                            </div>
                            <div className="fs-4 fw-semibold">
                              {formatKrw(v.amount)}
                            </div>
                          </div>
                          <div className="mb-2 w-100">
                            <div className="text-secondary small">
                              {t('columns.shopOrderPayment.cardName')}
                            </div>
                            <div className="fs-4 fw-semibold">{v.cardName}</div>
                          </div>
                          <div className="w-100">
                            <div className="text-secondary small">
                              {t('columns.shopOrderPayment.cardNumber')}
                            </div>
                            <div className="fs-4 fw-semibold">
                              {v.cardNumber}
                            </div>
                          </div>
                          <div className="w-100">
                            <div className="text-secondary small">
                              {t('columns.shopOrderPayment.receiptUrl')}
                            </div>
                            <div className="fs-4 fw-semibold">
                              {v.receiptUrl}
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
                  {orderItem.length > 0 ? (
                    orderItem.map((v, index) => (
                      <div key={index} className="col-md-6">
                        <div className="p-4 rounded-4 shadow-sm bg-white border h-100 d-flex flex-column justify-content-center align-items-center text-center">
                          <div className="mb-3 w-100">
                            <h4 className="fw-bold text-dark mb-0">
                              #{index + 1}
                            </h4>
                          </div>
                          <div className="mb-2 w-100">
                            <div className="text-secondary small">
                              {t('columns.shopOrderItem.itemName')}
                            </div>
                            <div className="fs-4 fw-semibold">{v.itemName}</div>
                          </div>
                          <div className="mb-2 w-100">
                            <div className="text-secondary small">
                              {t('columns.shopOrderItem.salePrice')}
                            </div>
                            <div className="fs-4 fw-semibold">
                              {v.quantity}개 {formatKrw(v.salePrice)}
                            </div>
                          </div>
                          <div className="w-100">
                            <div className="text-secondary small">
                              {t('columns.shopOrderItem.optionPrice')}
                            </div>
                            <div className="fs-4 fw-semibold">
                              {formatKrw(v.optionPrice)}
                            </div>
                          </div>
                          <div className="w-100">
                            <div className="text-secondary small">
                              {t('columns.shopOrderItem.supplyPrice')}
                            </div>
                            <div className="fs-4 fw-semibold">
                              {formatKrw(v.supplyPrice)}
                            </div>
                          </div>
                          <div className="w-100">
                            <div className="text-secondary small">
                              {t('columns.shopOrderItem.totalPrice')}
                            </div>
                            <div className="fs-4 fw-semibold">
                              {formatKrw(v.totalPrice)}
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
                  {t('columns.shopOrder.userId')}
                </h5>
              </div>
              <div className="card-body">
                <UserProfileDisplay
                  user={data.User}
                  showEmail={true}
                  size={32}
                />
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="row justify-content-between align-items-center mt-3 mb-3">
              <div className="col-auto"></div>
              <div className="col-auto">
                <Link
                  className="btn btn-outline-primary btn-sm"
                  href={`${getRouteUrl('shopOrder.index', locale)}?${searchParams.toString()}`}
                >
                  <FontAwesomeIcon icon={faList} />
                  &nbsp;{t('common.list')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderStatusModal
        id="orderStatusModalShow"
        row={
          modalType === 'single' && statusModalTarget === 'order' ? data : null
        }
        uids={
          modalType === 'single' && statusModalTarget === 'order'
            ? selectedUids
            : []
        }
        onUpdated={({ uids, orderStatus }) => {
          const currentUid = getValues('uid');
          if (currentUid && uids.includes(currentUid)) {
            setValue('orderStatus', orderStatus, { shouldValidate: true });
          }
          setIsOrderStatusOpen(false);
          setSelectedUids([]);
          setStatusModalTarget(null);
          setModalType('single');
        }}
        isOpen={isOrderStatusOpen}
        onClose={() => {
          setIsOrderStatusOpen(false);
          setSelectedUids([]);
          setStatusModalTarget(null);
          setModalType('single');
        }}
      />

      <CancelStatusModal
        id="cancelStatusModalShow"
        row={
          modalType === 'single' && statusModalTarget === 'cancel' ? data : null
        }
        uids={
          modalType === 'single' && statusModalTarget === 'cancel'
            ? selectedUids
            : []
        }
        onUpdated={({
          uids,
          cancelStatus,
          cancelReasonCode,
          cancelReasonText,
          cancelRequestedAt,
        }) => {
          const currentUid = getValues('uid');
          if (currentUid && uids.includes(currentUid)) {
            setValue('cancelStatus', cancelStatus, { shouldValidate: true });
            setValue('cancelReasonCode', cancelReasonCode ?? '', {
              shouldValidate: true,
            });
            setValue('cancelReasonText', cancelReasonText ?? '', {
              shouldValidate: true,
            });
            setValue('cancelRequestedAt', (cancelRequestedAt as any) ?? '', {
              shouldValidate: true,
            });
          }
          setIsCancelStatusOpen(false);
          setSelectedUids([]);
          setStatusModalTarget(null);
          setModalType('single');
        }}
        isOpen={isCancelStatusOpen}
        onClose={() => {
          setIsCancelStatusOpen(false);
          setSelectedUids([]);
          setStatusModalTarget(null);
          setModalType('single');
        }}
      />
    </>
  );
}
