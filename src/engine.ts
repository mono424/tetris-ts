import {
  createTetrisBuffer,
  TetrisBuffer,
  TetrisBufferEntry,
  TetrisBufferGetResult,
} from "./buffer";

export type TetrisBufferRowResult<T> = TetrisBufferGetResult<T>[];

export type TetrisEngineOnCompleteRowHandler<T> = (
  result: TetrisBufferRowResult<T>,
) => void;

export type TetrisEngine<T> = {
  insert: (bufferIndex: number, e: TetrisBufferEntry<T>) => number;
  getBuffers: () => TetrisBuffer<T>[];
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
    createTetrisBuffer<T>(),
  );

  const checkCompleteRow = (eIndexValue: number) => {
    const rowResult: TetrisBufferRowResult<T> = [];
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

  const insert = (bufferIndex: number, e: TetrisBufferEntry<T>) => {
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
