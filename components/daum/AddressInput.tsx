'use client';
import { useState } from 'react';
import { useDaumPostcode } from '@/hooks/useDaumPostcode';

type AddressInputProps = {
  zipcodeValue: string;
  addr1Value: string;
  addr2Value: string;
  addrJibeonValue: string;
  sidoValue: string;
  gugunValue: string;
  dongValue: string;
  onZipcodeChange: (value: string) => void;
  onAddr1Change: (value: string) => void;
  onAddr2Change: (value: string) => void;
  onAddrJibeonChange: (value: string) => void;
  onSidoChange: (value: string) => void;
  onGugunChange: (value: string) => void;
  onDongChange: (value: string) => void;
  disabled?: boolean;
  zipcodeError?: string;
  addr1Error?: string;
  addr2Error?: string;
  t: (key: string) => string;
};

export default function AddressInput({
  zipcodeValue,
  addr1Value,
  addr2Value,
  onZipcodeChange,
  onAddr1Change,
  onAddr2Change,
  onAddrJibeonChange,
  onSidoChange,
  onGugunChange,
  onDongChange,
  disabled = false,
  zipcodeError,
  addr1Error,
  addr2Error,
  t,
}: AddressInputProps) {
  const elementId = 'daum-postcode-wrap';
  const [isOpen, setIsOpen] = useState(false);

  const { open, close } = useDaumPostcode({
    onComplete: (data) => {
      onZipcodeChange(data.zipcode);
      onAddr1Change(data.address);
      onAddrJibeonChange(data.addrJibeon);
      onSidoChange(data.sido);
      onGugunChange(data.gugun);
      onDongChange(data.dong);
      setIsOpen(false);
      document.getElementById('addr2-input')?.focus();
    },
  });

  const handleToggle = () => {
    if (isOpen) {
      close(elementId);
      setIsOpen(false);
    } else {
      open(elementId);
      setIsOpen(true);
    }
  };

  return (
    <>
      <div className="mb-2">
        <label className="form-label">{t('columns.address.zipcode')}</label>
        <div className="d-flex gap-2">
          <input
            type="text"
            className={`form-control ${zipcodeError ? 'is-invalid' : ''}`}
            value={zipcodeValue}
            readOnly
            disabled={disabled}
          />
          <button
            type="button"
            className="btn btn-primary flex-shrink-0"
            onClick={handleToggle}
            disabled={disabled}
          >
            {isOpen ? t('common.close') : t('common.search')}
          </button>
        </div>
        {zipcodeError && (
          <div className="invalid-feedback d-block">{zipcodeError}</div>
        )}
      </div>

      <div
        id={elementId}
        style={{
          display: 'none',
          border: '1px solid',
          width: '100%',
          height: '300px',
          margin: '5px 0',
          position: 'relative',
        }}
      ></div>

      <div className="mb-2">
        <label className="form-label">{t('columns.address.addr1')}</label>
        <input
          type="text"
          className={`form-control ${addr1Error ? 'is-invalid' : ''}`}
          value={addr1Value}
          readOnly
          disabled={disabled}
        />
        {addr1Error && (
          <div className="invalid-feedback d-block">{addr1Error}</div>
        )}
      </div>

      <div className="mb-2">
        <label className="form-label">{t('columns.address.addr2')}</label>

        <input
          id="addr2-input"
          type="text"
          className={`form-control ${addr2Error ? 'is-invalid' : ''}`}
          value={addr2Value}
          onChange={(e) => onAddr2Change(e.target.value)}
          disabled={disabled}
        />
        {addr2Error && (
          <div className="invalid-feedback d-block">{addr2Error}</div>
        )}
      </div>
    </>
  );
}
