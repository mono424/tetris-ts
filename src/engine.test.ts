import { createTetrisEngine } from "./engine";

test("Align perfectly", () => {
  const onCompleteRow = jest.fn();

  const engine = createTetrisEngine<string>({
    size: 3,
    maxBufferSize: 10,
    maxIndexValueDelta: 0,
    removeLowerIndexValuesOnCompleteRow: false,
    onCompleteRow,
  });

  engine.insert(0, { value: "example1", indexValue: 0 });
  engine.insert(1, { value: "example2", indexValue: 0 });
  engine.insert(2, { value: "example3", indexValue: 0 });

  expect(onCompleteRow).toHaveBeenNthCalledWith(1, [
    {
      delta: 0,
      index: 0,
      result: { value: "example1", indexValue: 0 },
    },
    {
      delta: 0,
      index: 0,
      result: { value: "example2", indexValue: 0 },
    },
    {
      delta: 0,
      index: 0,
      result: { value: "example3", indexValue: 0 },
    },
  ]);
});

test("Aligns perfectly with noise", () => {
  const onCompleteRow = jest.fn();

  const engine = createTetrisEngine<string>({
    size: 3,
    maxBufferSize: 10,
    maxIndexValueDelta: 0,
    removeLowerIndexValuesOnCompleteRow: false,
    onCompleteRow,
  });

  engine.insert(0, { value: "example1", indexValue: 1 });
  engine.insert(0, { value: "noise1", indexValue: 2 });

  engine.insert(1, { value: "noise2", indexValue: 2 });
  engine.insert(1, { value: "example2", indexValue: 1 });

  engine.insert(2, { value: "noise3-1", indexValue: 0 });
  engine.insert(2, { value: "noise3-2", indexValue: 3 });
  engine.insert(2, { value: "example3", indexValue: 1 });

  engine.insert(1, { value: "should-not-trigger-again", indexValue: 1 });

  expect(onCompleteRow).toHaveBeenNthCalledWith(1, [
    {
      delta: 0,
      index: 1,
      result: { value: "example1", indexValue: 1 },
    },
    {
      delta: 0,
      index: 1,
      result: { value: "example2", indexValue: 1 },
    },
    {
      delta: 0,
      index: 1,
      result: { value: "example3", indexValue: 1 },
    },
  ]);
});

test("Should insert in the correct order", () => {
  const onCompleteRow = jest.fn();

  const engine = createTetrisEngine<string>({
    size: 2,
    maxBufferSize: 10,
    maxIndexValueDelta: 0,
    removeLowerIndexValuesOnCompleteRow: true,
    onCompleteRow,
  });

  expect(engine.insert(0, { value: "number-2", indexValue: 2 })).toBe(0);
  expect(engine.insert(0, { value: "number-5", indexValue: 5 })).toBe(0);
  expect(engine.insert(0, { value: "number-1", indexValue: 1 })).toBe(2);
  expect(engine.insert(0, { value: "number-4", indexValue: 4 })).toBe(1);
  expect(engine.insert(0, { value: "number-3", indexValue: 3 })).toBe(2);
});

test("Should remove lower index values on complete row", () => {
  const onCompleteRow = jest.fn();

  const engine = createTetrisEngine<string>({
    size: 3,
    maxBufferSize: 10,
    maxIndexValueDelta: 0,
    removeLowerIndexValuesOnCompleteRow: true,
    onCompleteRow,
  });

  engine.insert(0, { value: "example1", indexValue: 2 });
  engine.insert(0, { value: "should-be-removed-1", indexValue: 0 });

  engine.insert(1, { value: "should-be-removed-2", indexValue: 1 });
  engine.insert(1, { value: "should-not-be-removed-2", indexValue: 3 });
  engine.insert(1, { value: "example2", indexValue: 2 });

  engine.insert(2, { value: "should-be-removed-3-1", indexValue: 0 });
  engine.insert(2, { value: "should-be-removed-3-2", indexValue: 1 });
  engine.insert(2, { value: "example3", indexValue: 2 });

  expect(onCompleteRow).toHaveBeenCalledTimes(1);
  expect(engine.getBuffers()[0].length()).toBe(0);
  expect(engine.getBuffers()[1].length()).toBe(1);
  expect(engine.getBuffers()[2].length()).toBe(0);
});
