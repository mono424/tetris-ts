import {
  createSortedBuffer,
  SortedBuffer,
  SortedBufferEntry,
  SortedBufferGetResult,
} from "./sorted-buffer";

export type SortedBufferRowResult<T> = SortedBufferGetResult<T>[];

export type TetrisEngineOnCompleteRowHandler<T> = (
  result: SortedBufferRowResult<T>,
) => void;

export type TetrisEngine<T> = {
  insert: (bufferIndex: number, e: SortedBufferEntry<T>) => number;
  getBuffers: () => SortedBuffer<T>[];
};

export interface TetrisEngineConfig<T> {
  size: number;
  maxBufferSize: number;
  maxIndexValueDelta: number;
  onCompleteRow: TetrisEngineOnCompleteRowHandler<T>;
  removeLowerIndexValuesOnCompleteRow: boolean;
}

export const createTetrisEngine = <T>(
  config: TetrisEngineConfig<T>,
): TetrisEngine<T> => {
  let buffers = Array.from({ length: config.size }, () =>
    createSortedBuffer<T>({ maxSize: config.maxBufferSize }),
  );

  const checkCompleteRow = (eIndexValue: number) => {
    const rowResult: SortedBufferRowResult<T> = [];
    for (const buffer of buffers) {
      const result = buffer.get(eIndexValue, config.maxIndexValueDelta);
      if (!result) {
        return null;
      }
      rowResult.push(result);
    }
    for (let i = 0; i < buffers.length; i++) {
      buffers[i].remove(
        rowResult[i].index,
        config.removeLowerIndexValuesOnCompleteRow,
      );
    }
    config.onCompleteRow(rowResult);
  };

  const insert = (bufferIndex: number, e: SortedBufferEntry<T>) => {
    const index = buffers[bufferIndex]?.insert(e);
    if (index === undefined) {
      throw new Error("invalid buffer index");
    }
    checkCompleteRow(e.indexValue);
    return index;
  };

  const getBuffers = () => buffers;

  return {
    insert,
    getBuffers,
  };
};
