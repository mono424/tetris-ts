export type SortedBufferEntry<T> = {
  value: T;
  indexValue: number;
};

export interface SortedBufferGetResult<T> {
  result: SortedBufferEntry<T>;
  delta: number;
  index: number;
}

export type SortedBuffer<T> = {
  insert: (e: SortedBufferEntry<T>) => number;
  get: (indexValue: number, delta: number) => SortedBufferGetResult<T>;
  remove: (index: number, deleteLowerIndexValues: boolean) => boolean;
  length: () => number;
};

export interface SortedBufferOptions {
  maxSize: number;
}

export const createSortedBuffer = <T>(
  options: SortedBufferOptions,
): SortedBuffer<T> => {
  let array: SortedBufferEntry<T>[] = [];

  const locationOf = (
    eIndexVal: number,
    start: number,
    end: number,
  ): number => {
    var pivot = Math.floor(start + (end - start) / 2);
    if (array[pivot] === undefined || array[pivot].indexValue === eIndexVal)
      return pivot;
    if (end - start <= 1)
      return array[pivot].indexValue < eIndexVal ? pivot : pivot + 1;
    if (array[pivot].indexValue > eIndexVal) {
      return locationOf(eIndexVal, pivot, end);
    } else {
      return locationOf(eIndexVal, start, pivot);
    }
  };

  const insert = (e: SortedBufferEntry<T>) => {
    const location = locationOf(e.indexValue, 0, array.length);
    array.splice(location, 0, e);
    while (array.length > options.maxSize) array.pop();
    return location;
  };

  const get = (indexValue: number, delta: number): SortedBufferGetResult<T> => {
    const loc = locationOf(indexValue, 0, array.length);
    return [loc, loc - 1, loc + 1]
      .filter((i) => i >= 0 && i < array.length)
      .reduce<SortedBufferGetResult<T> | null>((res, i) => {
        const item = array[i];
        const itemDelta = Math.abs(item.indexValue - indexValue);
        if (itemDelta <= delta) {
          if (res !== null && res.delta <= itemDelta) {
            return res;
          }

          return {
            delta: itemDelta,
            result: item,
            index: i,
          };
        }
        return res;
      }, null);
  };

  const length = () => array.length;

  const remove = (index: number, deleteLowerIndexValues: boolean) => {
    if (deleteLowerIndexValues) {
      array.splice(index, array.length - index);
    } else {
      array.splice(index, 1);
    }
    return true;
  };

  return {
    insert,
    get,
    remove,
    length,
  };
};
