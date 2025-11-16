'use client';

import React, { useMemo, useState } from 'react';
import type { IShopOrder, CancelStatusInput } from '@/types/shop/order';
import { useLanguage } from '@/components/context/LanguageContext';
import { toast } from 'sonner';
import type { CancelReasonRole } from '@/lib/shop/status-utils';
import {
  SHOP_ORDER_CANCEL_STATUS_I18N,
  SHOP_ORDER_CANCEL_REASON_I18N,
  type ShopOrderCancelStatusCode,
} from '@/lib/shop/status-utils';
import { updateCancelStatusAction } from '@/actions/shop/order/list/cancel-status';

type Props = {
  id: string;
  row: IShopOrder | null;
  uids?: string[];
  // onUpdated: 취소 상태/사유 변경 후 상위 캐시 갱신
  onUpdated: (params: {
    uids: string[];
    cancelStatus: ShopOrderCancelStatusCode;
    cancelReasonCode: string;
    cancelReasonText?: string;
    cancelRequestedAt?: string;
  }) => void;
  isOpen?: boolean;
  onClose?: () => void;
};

const CancelStatusModal = ({
  id,
  row,
  uids,
  onUpdated,
  isOpen = false,
  onClose,
}: Props) => {
  const { t, locale } = useLanguage();
  const [cancelStatus, setCancelStatus] =
    useState<ShopOrderCancelStatusCode>('requested');
  const [cancelReasonCode, setCancelReasonCode] =
    useState<string>('change_mind');
  const [cancelReasonText, setCancelReasonText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // row.cancelRequestedBy 에서 역할 유추 (없으면 USER로 기본)
  const role: CancelReasonRole = useMemo(() => {
    if (row?.cancelRequestedBy === 'COMPANY') return 'COMPANY';
    return 'USER';
  }, [row]);

  const cancelStatusDict =
    SHOP_ORDER_CANCEL_STATUS_I18N[locale] ?? SHOP_ORDER_CANCEL_STATUS_I18N.ko;

  const reasonDict =
    SHOP_ORDER_CANCEL_REASON_I18N[role][locale] ??
    SHOP_ORDER_CANCEL_REASON_I18N[role].ko;

  const handleSubmit = async () => {
    const targetUids: string[] = row ? [row.uid] : (uids ?? []);
    if (!targetUids.length) return;

    try {
      setIsSubmitting(true);

      const payload: CancelStatusInput = row
        ? {
            uid: row.uid,
            cancelStatus,
            cancelReasonCode,
            cancelReasonText,
          }
        : {
            uids: targetUids,
            cancelStatus,
            cancelReasonCode,
            cancelReasonText,
          };

      const response = await updateCancelStatusAction(payload);
      if (response.status !== 'success') throw new Error(response.message);

      console.log(response.data);

      onUpdated({
        uids: targetUids,
        cancelStatus,
        cancelReasonCode,
        cancelReasonText:
          cancelReasonCode === 'other' ? cancelReasonText : undefined,
        cancelRequestedAt: response.data?.order?.cancelRequestedAt ?? '',
      });

      toast.success(response.message);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || '취소 상태 변경 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showReasonText = cancelReasonCode === 'other';
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
                {t('common.shopOrder.change_cancel_status') ?? '취소 상태 변경'}
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
                  ? (t('common.shopOrder.change_cancel_status_single', {
                      ordNo: row.ordNo,
                    }) ?? `주문번호 ${row.ordNo}의 취소 상태를 변경합니다.`)
                  : (t('common.shopOrder.change_cancel_status_multi', {
                      count: uids?.length ?? 0,
                    }) ??
                    `선택된 ${uids?.length ?? 0}건의 취소 상태를 변경합니다.`)}
              </p>

              {/* 취소 상태 */}
              <div className="mb-3">
                <label className="form-label">
                  {t('common.shopOrder.cancelStatus') ?? '취소 상태'}
                </label>
                <select
                  className="form-select"
                  value={cancelStatus}
                  onChange={(e) =>
                    setCancelStatus(e.target.value as ShopOrderCancelStatusCode)
                  }
                >
                  {Object.entries(cancelStatusDict)
                    .filter(([code]) => code !== 'none')
                    .map(([code, label]) => (
                      <option key={code} value={code}>
                        {label}
                      </option>
                    ))}
                </select>
              </div>

              {/* 취소 사유 코드 */}
              <div className="mb-3">
                <label className="form-label">
                  {t('common.shopOrder.cancelReasonCode') ?? '취소 사유'}
                </label>
                <select
                  className="form-select"
                  value={cancelReasonCode}
                  onChange={(e) => setCancelReasonCode(e.target.value)}
                >
                  {Object.entries(reasonDict).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  {t('common.shopOrder.cancelReason_hint') ??
                    '기타(직접 입력)를 선택하면 아래 입력란이 활성화됩니다.'}
                </div>
              </div>

              {/* 기타 사유 직접 입력 */}
              {showReasonText && (
                <div className="mb-3">
                  <label className="form-label">
                    {t('common.shopOrder.cancelReasonText') ??
                      '취소 사유(직접 입력)'}
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={cancelReasonText}
                    onChange={(e) => setCancelReasonText(e.target.value)}
                    placeholder={
                      t('common.shopOrder.cancelReasonText_placeholder') ??
                      '상세 취소 사유를 입력해 주세요.'
                    }
                  />
                </div>
              )}
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
                className="btn btn-danger"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default CancelStatusModal;
