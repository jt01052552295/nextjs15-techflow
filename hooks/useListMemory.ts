export function useListMemory(key: string) {
  const getKey = (suffix: string) => `${key}_${suffix}`;

  return {
    save: (data: {
      scrollY: number;
      page: number;
      filters: any;
      items: any;
    }) => {
      sessionStorage.setItem(getKey('scroll'), data.scrollY.toString());
      sessionStorage.setItem(getKey('page'), data.page.toString());
      sessionStorage.setItem(getKey('filters'), JSON.stringify(data.filters));
      sessionStorage.setItem(getKey('items'), JSON.stringify(data.items));
    },
    restore: () => {
      const scrollY = parseInt(sessionStorage.getItem(getKey('scroll')) || '0');
      const page = parseInt(sessionStorage.getItem(getKey('page')) || '1');
      const filters = JSON.parse(
        sessionStorage.getItem(getKey('filters')) || '{}',
      );
      const items = JSON.parse(sessionStorage.getItem(getKey('items')) || '[]');
      return { scrollY, page, filters, items };
    },
    clear: () => {
      ['scroll', 'page', 'filters', 'items'].forEach((suffix) =>
        sessionStorage.removeItem(getKey(suffix)),
      );
    },
  };
}
