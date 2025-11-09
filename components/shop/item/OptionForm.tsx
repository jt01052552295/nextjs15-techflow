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

type OptionFormProps = {
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  t: (key: string) => string;
  handleInputChange: any;
  getInputClass: any;
  isPending?: boolean;
};

const OptionForm = ({
  control,
  register,
  errors,
  t,
  handleInputChange,
  getInputClass,
  isPending = false,
}: OptionFormProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
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
      buyMin: 0,
      buyMax: 0,
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
        <h5 className="card-title m-0">{t('columns.shopItemOption.t')}</h5>
      </div>
      <div className="card-body">
        {fields.map((field, index) => (
          <div key={field.id} className="row g-2 mb-3 pb-3 border-bottom">
            <div className="col-md-2">
              <FormTextField
                label={t('columns.shopItemOption.gubun')}
                name={`options.${index}.gubun` as any}
                register={register}
                error={(errors.options as any)?.[index]?.gubun}
                placeholder="구분"
                readOnly={isPending}
                className=""
                onChange={() => handleInputChange(`options.${index}.gubun`)}
                onBlur={() => handleInputChange(`options.${index}.gubun`)}
              />
            </div>

            <div className="col-md-2">
              <FormTextField
                label={t('columns.shopItemOption.choiceType')}
                name={`options.${index}.choiceType` as any}
                register={register}
                error={(errors.options as any)?.[index]?.choiceType}
                placeholder="선택타입"
                readOnly={isPending}
                className=""
                onChange={() =>
                  handleInputChange(`options.${index}.choiceType`)
                }
                onBlur={() => handleInputChange(`options.${index}.choiceType`)}
              />
            </div>

            <div className="col-md-3">
              <FormTextField
                label={t('columns.shopItemOption.name')}
                name={`options.${index}.name` as any}
                register={register}
                error={(errors.options as any)?.[index]?.name}
                placeholder="옵션명"
                readOnly={isPending}
                className=""
                onChange={() => handleInputChange(`options.${index}.name`)}
                onBlur={() => handleInputChange(`options.${index}.name`)}
              />
            </div>

            <div className="col-md-2">
              <FormTextField
                label={t('columns.shopItemOption.price')}
                name={`options.${index}.price` as any}
                register={register}
                error={(errors.options as any)?.[index]?.price}
                placeholder="가격"
                type="number"
                readOnly={isPending}
                className=""
                onChange={() => handleInputChange(`options.${index}.price`)}
                onBlur={() => handleInputChange(`options.${index}.price`)}
              />
            </div>

            <div className="col-md-2">
              <FormTextField
                label={t('columns.shopItemOption.stock')}
                name={`options.${index}.stock` as any}
                register={register}
                error={(errors.options as any)?.[index]?.stock}
                placeholder="재고"
                type="number"
                readOnly={isPending}
                className=""
                onChange={() => handleInputChange(`options.${index}.stock`)}
                onBlur={() => handleInputChange(`options.${index}.stock`)}
              />
            </div>

            <div className="col-md-1">
              <FormTextField
                label={t('columns.shopItemOption.buyMin')}
                name={`options.${index}.buyMin` as any}
                register={register}
                error={(errors.options as any)?.[index]?.buyMin}
                placeholder="최소"
                type="number"
                readOnly={isPending}
                className=""
                onChange={() => handleInputChange(`options.${index}.buyMin`)}
                onBlur={() => handleInputChange(`options.${index}.buyMin`)}
              />
            </div>

            <div className="col-md-1">
              <FormTextField
                label={t('columns.shopItemOption.buyMax')}
                name={`options.${index}.buyMax` as any}
                register={register}
                error={(errors.options as any)?.[index]?.buyMax}
                placeholder="최대"
                type="number"
                readOnly={isPending}
                className=""
                onChange={() => handleInputChange(`options.${index}.buyMax`)}
                onBlur={() => handleInputChange(`options.${index}.buyMax`)}
              />
            </div>

            <div className="col-md-2">
              <FormSwitch
                label={t('columns.shopItemOption.isUse')}
                name={`options.${index}.isUse` as any}
                register={register}
                error={(errors.options as any)?.[index]?.isUse}
                switchLabel={t('common.yes')}
                disabled={isPending}
                onChange={() => handleInputChange(`options.${index}.isUse`)}
                onBlur={() => handleInputChange(`options.${index}.isUse`)}
              />
            </div>

            <div className="col-md-2">
              <FormSwitch
                label={t('columns.shopItemOption.isVisible')}
                name={`options.${index}.isVisible` as any}
                register={register}
                error={(errors.options as any)?.[index]?.isVisible}
                switchLabel={t('common.yes')}
                disabled={isPending}
                onChange={() => handleInputChange(`options.${index}.isVisible`)}
                onBlur={() => handleInputChange(`options.${index}.isVisible`)}
              />
            </div>
            <div className="col-md-2">
              <FormSwitch
                label={t('columns.shopItemOption.isSoldout')}
                name={`options.${index}.isSoldout` as any}
                register={register}
                error={(errors.options as any)?.[index]?.isSoldout}
                switchLabel={t('common.yes')}
                disabled={isPending}
                onChange={() => handleInputChange(`options.${index}.isSoldout`)}
                onBlur={() => handleInputChange(`options.${index}.isSoldout`)}
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
              <input type="hidden" {...register(`options.${index}.uid`)} />
            )}
            <input
              type="hidden"
              {...register(`options.${index}.parentId`)}
              value={0}
            />
            <input
              type="hidden"
              {...register(`options.${index}.isVisible`)}
              value="true"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptionForm;
