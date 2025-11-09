'use client';

import {
  useFieldArray,
  Control,
  UseFormRegister,
  FieldErrors,
} from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import FormTextField from '@/components/common/form/FormTextField';
import FormSwitch from '@/components/common/form/FormSwitch';

type SupplyFormProps = {
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  t: (key: string) => string;
  handleInputChange: any;
  getInputClass: any;
  isPending?: boolean;
};

const SupplyForm = ({
  control,
  register,
  errors,
  t,
  handleInputChange,
  getInputClass,
  isPending = false,
}: SupplyFormProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'supplies',
  });

  // 옵션 추가
  const addOption = () => {
    append({
      gubun: '',
      parentId: 0,
      choiceType: '',
      name: '',
      price: 0,
      stock: 0,
      isUse: true,
      isVisible: true,
      isSoldout: false,
    });
  };

  // 옵션 삭제 (최소 1개는 유지)
  const removeOption = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title m-0">{t('columns.shopItemSupply.t')}</h5>
      </div>
      <div className="card-body">
        {fields.map((field, index) => (
          <div key={field.id} className="row g-2 mb-3 pb-3 border-bottom">
            <div className="col-md-2">
              <FormTextField
                label={t('columns.shopItemSupply.gubun')}
                name={`supplies.${index}.gubun` as any}
                register={register}
                error={(errors.supplies as any)?.[index]?.gubun}
                placeholder="구분"
                readOnly={isPending}
                className=""
                onChange={() => handleInputChange(`supplies.${index}.gubun`)}
                onBlur={() => handleInputChange(`supplies.${index}.gubun`)}
              />
            </div>

            <div className="col-md-2">
              <FormTextField
                label={t('columns.shopItemSupply.choiceType')}
                name={`supplies.${index}.choiceType` as any}
                register={register}
                error={(errors.supplies as any)?.[index]?.choiceType}
                placeholder="선택타입"
                readOnly={isPending}
                className=""
                onChange={() =>
                  handleInputChange(`supplies.${index}.choiceType`)
                }
                onBlur={() => handleInputChange(`supplies.${index}.choiceType`)}
              />
            </div>

            <div className="col-md-3">
              <FormTextField
                label={t('columns.shopItemSupply.name')}
                name={`supplies.${index}.name` as any}
                register={register}
                error={(errors.supplies as any)?.[index]?.name}
                placeholder="옵션명"
                readOnly={isPending}
                className=""
                onChange={() => handleInputChange(`supplies.${index}.name`)}
                onBlur={() => handleInputChange(`supplies.${index}.name`)}
              />
            </div>

            <div className="col-md-2">
              <FormTextField
                label={t('columns.shopItemSupply.price')}
                name={`supplies.${index}.price` as any}
                register={register}
                error={(errors.supplies as any)?.[index]?.price}
                placeholder="가격"
                type="number"
                readOnly={isPending}
                className=""
                onChange={() => handleInputChange(`supplies.${index}.price`)}
                onBlur={() => handleInputChange(`supplies.${index}.price`)}
              />
            </div>

            <div className="col-md-2">
              <FormTextField
                label={t('columns.shopItemSupply.stock')}
                name={`supplies.${index}.stock` as any}
                register={register}
                error={(errors.supplies as any)?.[index]?.stock}
                placeholder="재고"
                type="number"
                readOnly={isPending}
                className=""
                onChange={() => handleInputChange(`supplies.${index}.stock`)}
                onBlur={() => handleInputChange(`supplies.${index}.stock`)}
              />
            </div>

            <div className="col-md-2">
              <FormSwitch
                label={t('columns.shopItemSupply.isUse')}
                name={`supplies.${index}.isUse` as any}
                register={register}
                error={(errors.supplies as any)?.[index]?.isUse}
                switchLabel={t('common.yes')}
                disabled={isPending}
                onChange={() => handleInputChange(`supplies.${index}.isUse`)}
                onBlur={() => handleInputChange(`supplies.${index}.isUse`)}
              />
            </div>

            <div className="col-md-2">
              <FormSwitch
                label={t('columns.shopItemSupply.isVisible')}
                name={`supplies.${index}.isVisible` as any}
                register={register}
                error={(errors.supplies as any)?.[index]?.isVisible}
                switchLabel={t('common.yes')}
                disabled={isPending}
                onChange={() =>
                  handleInputChange(`supplies.${index}.isVisible`)
                }
                onBlur={() => handleInputChange(`supplies.${index}.isVisible`)}
              />
            </div>
            <div className="col-md-2">
              <FormSwitch
                label={t('columns.shopItemSupply.isSoldout')}
                name={`supplies.${index}.isSoldout` as any}
                register={register}
                error={(errors.supplies as any)?.[index]?.isSoldout}
                switchLabel={t('common.yes')}
                disabled={isPending}
                onChange={() =>
                  handleInputChange(`supplies.${index}.isSoldout`)
                }
                onBlur={() => handleInputChange(`supplies.${index}.isSoldout`)}
              />
            </div>

            <div className="col-md-2 d-flex align-items-end gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm flex-grow-1 mb-2"
                onClick={addOption}
                disabled={isPending}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm flex-grow-1 mb-2"
                onClick={() => removeOption(index)}
                disabled={isPending || fields.length === 1}
                title={
                  fields.length === 1
                    ? t('common.validation.enter_at_least_one_option')
                    : t('common.delete')
                }
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>

            {/* Hidden fields */}
            {(field as any).uid && (
              <input type="hidden" {...register(`supplies.${index}.uid`)} />
            )}
            <input
              type="hidden"
              {...register(`supplies.${index}.parentId`)}
              value={0}
            />
            <input
              type="hidden"
              {...register(`supplies.${index}.isVisible`)}
              value="true"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplyForm;
