'use client';

import React, { useState } from 'react';
import type { IShopOrder } from '@/types/shop/order';
import { useLanguage } from '@/components/context/LanguageContext';
import { toast } from 'sonner';

// 상태 라벨 딕셔너리 재활용
import {
  SHOP_ORDER_STATUS_I18N,
  type ShopOrderStatusCode,
} from '@/lib/shop/status-utils';
import { updateOrderStatusAction } from '@/actions/shop/order/list/order-status';

type Props = {
  id: string;
  row: IShopOrder | null;
  uids?: string[];
  onUpdated: (params: {
    uids: string[];
    orderStatus: ShopOrderStatusCode;
  }) => void;
  isOpen?: boolean;
  onClose?: () => void;
};

const OrderStatusModal = ({
  id,
  row,
  uids,
  onUpdated,
  isOpen = false,
  onClose,
}: Props) => {
  const { t, locale } = useLanguage();
  const [orderStatus, setOrderStatus] =
    useState<ShopOrderStatusCode>('order_pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const targetUids: string[] = row ? [row.uid] : (uids ?? []);
    if (!targetUids.length) return;

    try {
      setIsSubmitting(true);

      // TODO: 백엔드 작업 시 실제 서버 액션 호출
      const response = await updateOrderStatusAction({
        uids: targetUids,
        orderStatus,
      });
      if (response.status !== 'success') throw new Error(response.message);

      // 혹은 상세에서
      // const rs = await updateOrderStatusAction({
      //   uid: row.uid, // 단일
      //   orderStatus: 'delivered',
      // });

      // console.log(targetUids, orderStatus);

      // 프론트 캐시 갱신은 상위 컴포넌트에서 처리
      onUpdated({ uids: targetUids, orderStatus });

      toast.success(response.message);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || '상태 변경 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dict = SHOP_ORDER_STATUS_I18N[locale] ?? SHOP_ORDER_STATUS_I18N.ko;

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        id={id}
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {t('common.shopOrder.change_order_status') ?? '주문 상태 변경'}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>

            <div className="modal-body">
              <p className="mb-3">
                {row
                  ? (t('common.shopOrder.change_order_status_single', {
                      ordNo: row.ordNo,
                    }) ?? `주문번호 ${row.ordNo}의 상태를 변경합니다.`)
                  : (t('common.shopOrder.change_order_status_multi', {
                      count: uids?.length ?? 0,
                    }) ??
                    `선택된 ${uids?.length ?? 0}건의 주문 상태를 변경합니다.`)}
              </p>

              <div className="mb-3">
                <label className="form-label">
                  {t('common.shopOrder.orderStatus') ?? '주문 상태'}
                </label>
                <select
                  className="form-select"
                  value={orderStatus}
                  onChange={(e) =>
                    setOrderStatus(e.target.value as ShopOrderStatusCode)
                  }
                >
                  {Object.entries(dict).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {t('common.save') ?? '저장'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default OrderStatusModal;
