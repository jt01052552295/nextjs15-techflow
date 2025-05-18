import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

const validOrderFields = [
  'name',
  'email',
  'createdAt',
  'updatedAt',
  'sortOrder',
] as const;
type OrderField = (typeof validOrderFields)[number];

export const useTodoListParams = () => {
  const searchParams = useSearchParams();

  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';
  const order = (searchParams.get('order') === 'asc' ? 'asc' : 'desc') as
    | 'asc'
    | 'desc';

  const rawOrderBy = searchParams.get('orderBy') || 'sortOrder';
  const orderBy: OrderField = validOrderFields.includes(
    rawOrderBy as OrderField,
  )
    ? (rawOrderBy as OrderField)
    : 'sortOrder';

  const page = parseInt(searchParams.get('page') || '1', 10);

  const filters = useMemo(
    () => ({
      name,
      email,
      orderBy,
      order,
    }),
    [name, email, orderBy, order],
  );
  return {
    filters,
    page,
    sortField: orderBy,
    sortOrder: order,
    queryString: searchParams.toString(),
  };
};
