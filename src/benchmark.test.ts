import { createTetrisEngine } from "./engine";

test("Benchmark", () => {
  const onCompleteRow = jest.fn();

  const engine = createTetrisEngine<string>({
    size: 3,
    maxBufferSize: 20_001,
    maxIndexValueDelta: 0,
    removeLowerIndexValuesOnCompleteRow: true,
    onCompleteRow,
  });

  const randomBetween = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  engine.insert(0, {
    value: `example-success`,
    indexValue: 333_333,
  });

  for (let i = 0; i < 10_000; i++) {
    engine.insert(0, {
      value: `example-${i}`,
      indexValue: randomBetween(100_001, 333_332),
    });

    engine.insert(1, {
      value: `example-${i}`,
      indexValue: randomBetween(100_001, 333_332),
    });

    engine.insert(2, {
      value: `example-${i}`,
      indexValue: randomBetween(600_001, 900_000),
    });
  }

  engine.insert(1, {
    value: `example-success`,
    indexValue: 333_333,
  });

  for (let i = 10_000; i < 20_000; i++) {
    engine.insert(0, {
      value: `example-${i}`,
      indexValue: randomBetween(333_334, 600_000),
    });

    engine.insert(1, {
      value: `example-${i}`,
      indexValue: randomBetween(333_334, 600_000),
    });

    engine.insert(2, {
      value: `example-${i}`,
      indexValue: randomBetween(600_001, 900_000),
    });
  }

  engine.insert(2, {
    value: `example-success`,
    indexValue: 333_333,
  });

  expect(onCompleteRow).toHaveBeenNthCalledWith(1, [
    {
      delta: 0,
      index: 10_000,
      result: { value: "example-success", indexValue: 333_333 },
    },
    {
      delta: 0,
      index: 10_000,
      result: { value: "example-success", indexValue: 333_333 },
    },
    {
      delta: 0,
      index: 20_000,
      result: { value: "example-success", indexValue: 333_333 },
    },
  ]);
});
