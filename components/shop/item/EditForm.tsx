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
import { toast } from 'sonner';
import Link from 'next/link';
import { getRouteUrl } from '@/utils/routes';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faSave, faRefresh } from '@fortawesome/free-solid-svg-icons';

import { UpdateType, UpdateSchema } from '@/actions/shop/item/update/schema';
import { updateAction } from '@/actions/shop/item/update';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormUtils from '@/hooks/useFormUtils';
import ResultConfirm from '@/components/shop/item/modal/ResultConfirm';
import { IShopItem, IShopItemOption } from '@/types/shop/item';
import OptionForm from './OptionForm';
import SupplyForm from './SupplyForm';
import ImageUploader from './ImageUploader';
import { useSearchParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { shopItemQK } from '@/lib/queryKeys/shop/item';
import { showAction } from '@/actions/shop/item/show';
import FormSelect, { SelectOption } from '@/components/common/form/FormSelect';
import FormTextField from '@/components/common/form/FormTextField';
import FormTextarea from '@/components/common/form/FormTextarea';
import FormEditor from '@/components/common/form/FormEditor';
import FormSwitch from '@/components/common/form/FormSwitch';

type Props = {
  uid: string;
  baseParamsKey?: string;
  //   rs: IShopItemPart;
};
export default function EditForm({ uid }: Props) {
  const { dictionary, locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isDataFetched, setIsDataFetched] = useState<boolean | undefined>(
    false,
  );

  const [optionData, setOptionData] = useState<IShopItemOption[]>([]);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]); // ✅ 업로드된 이미지 상태
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);

  const cntOptions: SelectOption[] = [
    { value: '1', label: '1개' },
    { value: '2', label: '2개' },
    { value: '3', label: '3개' },
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: shopItemQK.detail(uid),
    queryFn: () => showAction(uid),
    staleTime: 30_000,
  });

  const seededRef = useRef(false);
  const staticUrl = useMemo(() => process.env.NEXT_PUBLIC_STATIC_URL ?? '', []);

  const methods = useForm<UpdateType>({
    mode: 'onChange',
    resolver: zodResolver(UpdateSchema(dictionary.common.form)),
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

  const { handleInputChange, getInputClass } = useFormUtils<UpdateType>({
    trigger,
    errors,
    watch,
    setErrorMessage,
  });

  const seedFormFromData = useCallback(async () => {
    if (!data) return;
    if (seededRef.current) return;
    // console.log('edit form', props.uid)
    // console.log(props.rs)

    setValue('item.uid', data.uid ?? '', { shouldValidate: true });
    setValue('item.cid', data.cid ?? '', { shouldValidate: true });
    setValue('item.name', data.name ?? '', { shouldValidate: true });

    setValue('item.isUse', !!(data as any).isUse);
    setValue('item.isVisible', !!(data as any).isVisible);

    if (data.ShopItemFile) {
      const initialImages =
        data.ShopItemFile.map((file: any) => ({
          preview: staticUrl + file.url,
          name: file.name,
          url: file.url,
          originalName: file.originalName, // ✅ 원본 파일명
          size: file.size, // ✅ 파일 크기
          ext: file.ext, // ✅ 확장자
          type: file.type, // ✅ MIME 타입
        })) ?? [];
      setUploadedImages(initialImages);
    }

    seededRef.current = true;
  }, [data, setValue, staticUrl]);

  useEffect(() => {
    if (data) seedFormFromData();
  }, [data, seedFormFromData]);

  useEffect(() => {
    if (errors) {
      // console.error(errors);
      Object.keys(errors).forEach((field) => {
        const errorMessage = errors[field as keyof typeof errors]?.message;
        if (errorMessage) {
          toast.error(errorMessage);
        }
      });
    }
  }, [errors]);

  const formAction: SubmitHandler<UpdateType> = (data) => {
    startTransition(async () => {
      try {
        const validOptions = data.options?.filter((opt) => !opt._delete) ?? [];
        const deleteOptions =
          data.options?.filter((opt) => opt._delete && opt.uid) ?? [];

        const validSupplies =
          data.supplies?.filter((opt) => !opt._delete) ?? [];
        const deleteSupplies =
          data.supplies?.filter((opt) => opt._delete && opt.uid) ?? [];

        const finalData = {
          ...data,
          options: validOptions,
          deleteOptionUids: deleteOptions
            .map((opt) => opt.uid)
            .filter(Boolean) as string[],
          supplies: validSupplies,
          deleteSupplyUids: deleteSupplies
            .map((opt) => opt.uid)
            .filter(Boolean) as string[],
          files: uploadedImages,
          deleteFileUrls: deletedImages, // ✅ 삭제된 이미지들
        };
        console.log(finalData);
        const response = await updateAction(finalData);
        console.log(response);
        if (response.status == 'success') {
          const updatedItem = response.data as IShopItem;

          toast.success(response.message);
          // reset();
          setIsResultOpen(true);

          queryClient.setQueryData(
            shopItemQK.detail(updatedItem.uid),
            updatedItem,
          );
          queryClient.invalidateQueries({ queryKey: ['shopItem', 'list'] });
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
    seedFormFromData();
    setIsDataFetched(false);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error || !data) return <p>{dictionary.common.failed_data}</p>;

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(formAction)}>
          <input type="hidden" {...register('item.uid')} />
          <input type="hidden" {...register('item.cid')} />
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
                      <div className="mb-2">
                        <FormSwitch
                          label={t('columns.shopItem.isUse')}
                          name={`item.isUse` as any}
                          register={register}
                          error={errors.item?.isUse}
                          switchLabel={t('common.yes')}
                          disabled={isPending}
                          onChange={() => handleInputChange(`item.isUse`)}
                          onBlur={() => handleInputChange(`item.isUse`)}
                        />
                      </div>
                      <div className="mb-2">
                        <FormSwitch
                          label={t('columns.shopItem.isVisible')}
                          name={`item.isVisible` as any}
                          register={register}
                          error={errors.item?.isVisible}
                          switchLabel={t('common.yes')}
                          disabled={isPending}
                          onChange={() => handleInputChange(`item.isVisible`)}
                          onBlur={() => handleInputChange(`item.isVisible`)}
                        />
                      </div>
                      <div className="mb-2">
                        <FormSwitch
                          label={t('columns.shopItem.isSoldout')}
                          name={`item.isSoldout` as any}
                          register={register}
                          error={errors.item?.isSoldout}
                          switchLabel={t('common.yes')}
                          disabled={isPending}
                          onChange={() => handleInputChange(`item.isSoldout`)}
                          onBlur={() => handleInputChange(`item.isSoldout`)}
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
                        {
                          <ImageUploader
                            dir={'item'}
                            pid={watch('item.uid')}
                            onChange={(images, removed) => {
                              setUploadedImages(images); // ✅ 남아있는 이미지들
                              setDeletedImages(removed ?? []); // ✅ 삭제된 이미지들
                            }}
                            initialImages={uploadedImages}
                            mode="edit"
                          />
                        }
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
      </FormProvider>
      <ResultConfirm isOpen={isResultOpen} setIsOpen={setIsResultOpen} />
    </>
  );
}
