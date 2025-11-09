'use client';
import {
  useEffect,
  useState,
  useTransition,
  useCallback,
  MouseEvent,
  useRef,
  ChangeEventHandler,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import Link from 'next/link';
import { getRouteUrl } from '@/utils/routes';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faSave, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { CreateType, CreateSchema } from '@/actions/shop/item/create/schema';
import { createAction } from '@/actions/shop/item/create';
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/shop/item/modal/ResultConfirm';
import OptionForm from './OptionForm';
import SupplyForm from './SupplyForm';
import ImageUploader from './ImageUploader';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import FormSelect, { SelectOption } from '@/components/common/form/FormSelect';
import FormTextField from '@/components/common/form/FormTextField';
import FormTextarea from '@/components/common/form/FormTextarea';
import FormEditor from '@/components/common/form/FormEditor';

export default function CreateForm() {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]); // ✅ 업로드된 이미지 상태

  const cntOptions: SelectOption[] = [
    { value: '1', label: '1개' },
    { value: '2', label: '2개' },
    { value: '3', label: '3개' },
  ];

  const methods = useForm<CreateType>({
    mode: 'onChange',
    resolver: zodResolver(CreateSchema(dictionary.common.form)),
    defaultValues: {
      item: {
        uid: uuidv4(),
        shopId: 0,

        code: uuidv4(),
        categoryCode: '',

        name: '',
        desc1: '',

        basicPrice: 0,
        basicPriceDc: 0,
        salePrice: 0,

        basicDesc: null,
        etcDesc: null,

        useDuration: 0,
        stock: 0,
        orderMinimumCnt: 0,
        orderMaximumCnt: 0,

        isUse: true,
        isVisible: true,
        isSoldout: false,
      },
      files: [],
      options: [
        {
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
        },
      ],
      supplies: [
        {
          gubun: '',
          parentId: 0,
          choiceType: '',
          name: '',
          price: 0,
          stock: 0,
          isUse: true,
          isVisible: true,
          isSoldout: false,
        },
      ],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    getValues,
    trigger,
    watch,
    reset,
    setError,
  } = methods;

  const { handleInputChange, getInputClass } = useFormUtils<CreateType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const formAction: SubmitHandler<CreateType> = (data) => {
    startTransition(async () => {
      try {
        const finalData = {
          ...data,
          files: uploadedImages,
        };
        // console.log(finalData);
        const response = await createAction(finalData);
        console.log(response);
        if (response.status == 'success') {
          const newItem = response.data;
          if (!newItem) {
            throw new Error(`${response.message}`);
          }
          toast.success(response.message);

          reset();
          setUploadedImages([]); // ✅ 이미지 초기화
          setIsResultOpen(true);

          queryClient.invalidateQueries({ queryKey: ['shopItem', 'list'] });

          // 상세로 이동
          // const qs = searchParams.toString();
          // queryClient.setQueryData(shopItemQK.detail(newItem.uid), newItem);
          // const showUrl = getRouteUrl('todos.show', locale, { id: newItem.uid });
          // router.push(qs ? `${showUrl}?${qs}` : showUrl, { scroll: false });
        } else {
          throw new Error(`${response.message}:: ${response.error}`);
        }
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          toast.error(err.message);
        } else if (typeof err === 'string') {
          toast.error(err);
        } else {
          // toast.error(t('common.unknown_error'));
          toast.error(JSON.stringify(err));
        }
      }
    });
  };

  const formReset = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    reset(); // update form back to default values
    setUploadedImages([]); // ✅ 이미지 초기화
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(formAction)}>
          <input type="hidden" {...register('item.uid')} />
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
                          label={t('columns.shopItem.categoryCode')}
                          name="item.categoryCode"
                          register={register}
                          error={errors.item?.categoryCode}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() =>
                            handleInputChange('item.categoryCode')
                          }
                          onBlur={() => handleInputChange('item.categoryCode')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopItem.code')}
                          name="item.code"
                          register={register}
                          error={errors.item?.code}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('item.code')}
                          onBlur={() => handleInputChange('item.code')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopItem.name')}
                          name="item.name"
                          register={register}
                          error={errors.item?.name}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('item.name')}
                          onBlur={() => handleInputChange('item.name')}
                        />
                      </div>

                      <div className="mb-2">
                        <FormTextarea
                          label={t('columns.shopItem.desc1')}
                          name="item.desc1"
                          register={register}
                          error={errors.item?.desc1}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          minRows={3}
                          maxRows={10}
                          onChange={() => handleInputChange('item.desc1')}
                          onBlur={() => handleInputChange('item.desc1')}
                        />
                      </div>

                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopItem.basicPrice')}
                          name="item.basicPrice"
                          register={register}
                          error={errors.item?.basicPrice}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('item.basicPrice')}
                          onBlur={() => handleInputChange('item.basicPrice')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopItem.basicPriceDc')}
                          name="item.basicPriceDc"
                          register={register}
                          error={errors.item?.basicPriceDc}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() =>
                            handleInputChange('item.basicPriceDc')
                          }
                          onBlur={() => handleInputChange('item.basicPriceDc')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopItem.salePrice')}
                          name="item.salePrice"
                          register={register}
                          error={errors.item?.salePrice}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('item.salePrice')}
                          onBlur={() => handleInputChange('item.salePrice')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopItem.stock')}
                          name="item.stock"
                          register={register}
                          error={errors.item?.stock}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('item.stock')}
                          onBlur={() => handleInputChange('item.stock')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormTextField
                          label={t('columns.shopItem.useDuration')}
                          name="item.useDuration"
                          register={register}
                          error={errors.item?.useDuration}
                          validMessage={t('common.form.valid')}
                          readOnly={isPending}
                          onChange={() => handleInputChange('item.useDuration')}
                          onBlur={() => handleInputChange('item.useDuration')}
                        />
                      </div>
                      <div className="mb-2">
                        <FormSelect
                          label={t('columns.shopItem.orderMinimumCnt')}
                          name="item.orderMinimumCnt"
                          register={register}
                          options={cntOptions}
                          error={errors.item?.orderMinimumCnt}
                          validMessage={t('common.form.valid')}
                          placeholder={t('common.choose')}
                          onChange={() =>
                            handleInputChange('item.orderMinimumCnt')
                          }
                          onBlur={() =>
                            handleInputChange('item.orderMinimumCnt')
                          }
                        />
                      </div>
                      <div className="mb-2">
                        <FormSelect
                          label={t('columns.shopItem.orderMaximumCnt')}
                          name="item.orderMaximumCnt"
                          register={register}
                          options={cntOptions}
                          error={errors.item?.orderMaximumCnt}
                          validMessage={t('common.form.valid')}
                          placeholder={t('common.choose')}
                          onChange={() =>
                            handleInputChange('item.orderMaximumCnt')
                          }
                          onBlur={() =>
                            handleInputChange('item.orderMaximumCnt')
                          }
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
                        <FormEditor
                          label={t('columns.shopItem.basicDesc')}
                          name="item.basicDesc"
                          control={control}
                          error={errors.item?.basicDesc}
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
                  <div className="row">
                    <div className="col">
                      <div className="mb-2">
                        <ImageUploader
                          dir={'item'}
                          pid={watch('item.uid')}
                          onChange={setUploadedImages} // ✅ 작성폼은 업로드된 이미지만 관리
                          mode="create"
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
                  <div className="row">
                    <div className="col">
                      <div className="mb-2">
                        <OptionForm
                          control={control}
                          register={register}
                          errors={errors}
                          t={t}
                          handleInputChange={handleInputChange}
                          getInputClass={getInputClass}
                          isPending={isPending}
                        />
                      </div>
                      <div className="mb-2">
                        <SupplyForm
                          control={control}
                          register={register}
                          errors={errors}
                          t={t}
                          handleInputChange={handleInputChange}
                          getInputClass={getInputClass}
                          isPending={isPending}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="row justify-content-between align-items-center mt-3 mb-3">
                <div className="col-auto">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isPending || !isValid}
                  >
                    <FontAwesomeIcon icon={faSave} />
                    &nbsp;{isPending ? t('common.loading') : t('common.save')}
                  </button>
                </div>
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm m-1"
                    onClick={formReset}
                  >
                    <FontAwesomeIcon icon={faRefresh} />
                    &nbsp;{t('common.reset')}
                  </button>
                  <Link
                    className="btn btn-outline-primary btn-sm"
                    href={`${getRouteUrl('shopItem.index', locale)}?${searchParams.toString()}`}
                  >
                    <FontAwesomeIcon icon={faList} />
                    &nbsp;{t('common.list')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
        <ResultConfirm isOpen={isResultOpen} setIsOpen={setIsResultOpen} />
      </FormProvider>
    </>
  );
}
