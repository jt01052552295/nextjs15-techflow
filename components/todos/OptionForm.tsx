'use client';
import { useFieldArray, useFormContext } from 'react-hook-form';
import useFormUtils from '@/hooks/useFormUtils';
import { CreateTodosType } from '@/actions/todos/create/schema';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

export const OptionForm = () => {
  const { t } = useLanguage();
  const {
    control,
    register,
    getValues,
    formState: { errors },
    trigger,
    watch,
  } = useFormContext<CreateTodosType>();

  const { getInputClass, handleInputChange } = useFormUtils<CreateTodosType>({
    errors,
    trigger,
    watch,
    setErrorMessage: () => {},
  });

  const { fields, append, remove, update } = useFieldArray<
    CreateTodosType,
    'todoOption'
  >({
    control,
    name: 'todoOption', // 폼 데이터에서 옵션 배열의 경로
  });

  const removeOption = (index: number) => {
    const current = getValues(`todoOption.${index}`);
    if (current?.uid) {
      // DB에 존재하는 항목이라면 삭제 플래그
      update(index, { ...current, _delete: true });
    } else {
      // 새로 추가한 항목이면 완전히 제거
      remove(index);
    }
  };

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{t('columns.todos.TodosOption')}</h5>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => append({ name: '', age: 0, gender: '' })}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      {fields.map((field, index) => {
        const current = watch(`todoOption.${index}`);
        if (current?._delete) return null;

        return (
          <div className="row align-items-end mb-3" key={field.id}>
            <div className="col-md-4">
              <label className="form-label">{t('columns.todos.name')}</label>
              <input
                type="text"
                className={`form-control form-control-sm ${getInputClass(`todoOption.${index}.name`)}`}
                {...register(`todoOption.${index}.name`, {
                  onChange: () => handleInputChange(`todoOption.${index}.name`),
                  onBlur: () => handleInputChange(`todoOption.${index}.name`),
                })}
              />
              {errors.todoOption?.[index]?.name && (
                <div className="invalid-feedback">
                  {errors.todoOption?.[index]?.name.message}
                </div>
              )}
              {!errors.todoOption?.[index]?.name && (
                <div className="valid-feedback">{t('common.form.valid')}</div>
              )}
            </div>

            <div className="col-md-3">
              <label className="form-label">나이</label>
              <input
                type="number"
                className={`form-control form-control-sm ${getInputClass(`todoOption.${index}.age`)}`}
                {...register(`todoOption.${index}.age`, {
                  onChange: () => handleInputChange(`todoOption.${index}.age`),
                  onBlur: () => handleInputChange(`todoOption.${index}.age`),
                })}
              />
              {errors.todoOption?.[index]?.age !== undefined && (
                <div className="invalid-feedback">
                  {errors.todoOption?.[index]?.age.message}
                </div>
              )}
              {!errors.todoOption?.[index]?.age && (
                <div className="valid-feedback">{t('common.form.valid')}</div>
              )}
            </div>

            <div className="col-md-3">
              <label className="form-label">{t('columns.todos.gender')}</label>
              <select
                className={`form-select form-select-sm ${getInputClass(`todoOption.${index}.gender`)}`}
                {...register(`todoOption.${index}.gender`, {
                  onChange: () =>
                    handleInputChange(`todoOption.${index}.gender`),
                  onBlur: () => handleInputChange(`todoOption.${index}.gender`),
                })}
              >
                <option value="">{t('common.choose')}</option>
                <option value="male">{t('common.gender.male')}</option>
                <option value="female">{t('common.gender.female')}</option>
              </select>
              {errors.todoOption?.[index]?.gender && (
                <div className="invalid-feedback">
                  {errors.todoOption?.[index]?.gender.message}
                </div>
              )}
              {!errors.todoOption?.[index]?.gender && (
                <div className="valid-feedback">{t('common.form.valid')}</div>
              )}
            </div>
            <div className="col-md-1">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeOption(index)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>

            {field.uid && (
              <input type="hidden" {...register(`todoOption.${index}.uid`)} />
            )}
          </div>
        );
      })}
    </div>
  );
};
