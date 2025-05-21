import { createTetrisEngine } from "./engine";

test("Simple Benchmark", () => {
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

test("Timestamp Benchmark", () => {
  const onCompleteRow = jest.fn();

  const engine = createTetrisEngine<string>({
    size: 3,
    maxBufferSize: 20_001,
    maxIndexValueDelta: 20,
    removeLowerIndexValuesOnCompleteRow: true,
    onCompleteRow,
  });

  const randomBetween = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const insertNotMatchingSet = (rootTimestamp: number): number[] => {
    const timestamp1 = rootTimestamp;
    const timestamp2 = rootTimestamp + randomBetween(11, 20);
    const timestamp3 = rootTimestamp - randomBetween(11, 20);

    engine.insert(0, {
      value: `not-aligned-${rootTimestamp}-${timestamp1}`,
      indexValue: timestamp1,
    });

    engine.insert(1, {
      value: `not-aligned-${rootTimestamp}-${timestamp2}`,
      indexValue: timestamp2,
    });

    engine.insert(2, {
      value: `not-aligned-${rootTimestamp}-${timestamp3}`,
      indexValue: timestamp3,
    });

    return [timestamp1, timestamp2, timestamp3];
  };

  const iterationLength = 14;
  const iterations = 5_000; /// Results in 210k insertions and 10k complete rows
  const startTimestamp = 1747817314659;
  let makeCompleteRow = [0, 0, 0];

  for (let i = 0; i < iterations * iterationLength; i++) {
    const timestamp = startTimestamp + i * 1000;
    const insertedTimestamp = insertNotMatchingSet(timestamp);
    if (i % 14 === 0) {
      makeCompleteRow = insertedTimestamp;
    } else if (i % 14 === 6) {
      engine.insert(2, {
        value: `completed-${timestamp}`,
        indexValue: makeCompleteRow[0] + 10,
      });
      makeCompleteRow = insertedTimestamp;
    } else if (i % 14 === 12) {
      engine.insert(1, {
        value: `completed-${timestamp}`,
        indexValue: makeCompleteRow[0] - 10,
      });
      makeCompleteRow = [0, 0, 0];
    }
  }

  expect(onCompleteRow).toHaveBeenCalledTimes(iterations * 2);
});
