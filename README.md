# @mono424/tetris-ts

[![Build Status](https://github.com/mono424/tetris-ts/actions/workflows/publish-package.yml/badge.svg)](https://github.com/mono424/tetris-ts/actions/workflows/publish-package.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT) [![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest)](https://jestjs.io/)

A TypeScript library for synchronizing items across multiple ordered buffers based on an `indexValue`. It detects when items "align" across all buffers (like completing a row in Tetris!) and triggers a callback for you to process them.

---

## Core Concept

Imagine you have several streams of data, where each item has an `indexValue` (like a timestamp or sequence number). This engine helps you manage these streams (buffers) and tells you when you have a complete "set" of items – one from each buffer – that are close enough in their `indexValue`.

When an item is inserted, the engine checks if it completes a "row" with items from other buffers. A row is considered complete if an item can be found in each buffer such that their `indexValue`s are all within a `maxIndexValueDelta` of the `indexValue` of the item that triggered the check.

---

## Features

✨ Manages multiple, independent buffers.
🔢 Items in buffers are ordered on insertion by their `indexValue`.
📐 Configurable maximum buffer size (`maxBufferSize`).
🎯 Detects "complete rows" based on `indexValue` proximity (`maxIndexValueDelta`).
🎣 Callback (`onCompleteRow`) invoked with the aligned items.
🧹 Option to automatically clean up buffers after a row is completed (`removeLowerIndexValuesOnCompleteRow`).
💪 Built with TypeScript, type-safe.
🧪 Includes tests with Jest.

---

## Installation

```bash
# Using pnpm
pnpm add @mono424/tetris-ts

# Using npm
npm install @mono424/tetris-ts

# Using yarn
yarn add @mono424/tetris-ts
```

---

## Basic Usage

```typescript
import { createTetrisEngine, TetrisBufferEntry } from "@mono424/tetris-ts";

// Define the type of items you'll be storing
type MyDataType = { message: string };

// 1. Configure the engine
const engine = createTetrisEngine<MyDataType>({
  size: 3, // Number of buffers to manage
  maxBufferSize: 100, // Max items per buffer
  maxIndexValueDelta: 5, // Max allowed difference in indexValue for a "match"
  removeLowerIndexValuesOnCompleteRow: true, // Clean up processed items
  onCompleteRow: (completedRow) => {
    console.log("🎉 Row Complete!");
    completedRow.forEach((item) => {
      console.log(
        `Buffer item: ${item.result.value.message}, indexValue: ${item.result.indexValue}, delta: ${item.delta}`,
      );
    });
  },
});

// 2. Insert items into buffers
// Items are { value: YourType, indexValue: number }
engine.insert(0, {
  value: { message: "Data stream A, event 1" },
  indexValue: 100,
});
engine.insert(1, {
  value: { message: "Data stream B, event 1" },
  indexValue: 102,
});

// ... more inserts ...

// If this insertion completes a row (items in buffers 0, 1, and 2 are found around indexValue 101)
// the onCompleteRow callback will be triggered.
engine.insert(2, {
  value: { message: "Data stream C, event 1" },
  indexValue: 101,
});
```

---

## Configuration

When you create an engine using `createTetrisEngine<T>(config)`, you can pass the following options in the `config` object:

- `size: number`: The number of parallel buffers the engine will manage.
- `maxBufferSize: number`: The maximum number of items that each individual buffer can hold. Once full, older items (those with the lowest `indexValue`) are dropped.
- `maxIndexValueDelta: number`: When checking for a complete row, this is the maximum absolute difference allowed between the `indexValue` of the triggering item and an item in another buffer for them to be considered part of the same row.
- `onCompleteRow: (result: TetrisBufferRowResult<T>) => void`: A callback function that gets executed when a complete row is detected. The `result` is an array of objects, each detailing the matched item from a buffer.
- `removeLowerIndexValuesOnCompleteRow: boolean`:
  - If `true`, when a row is completed, the matched items and items with `indexValue`s considered "lower" or processed are removed from their respective buffers to free up space and prevent reprocessing. (The exact behavior is to remove the matched item and all items after it in the sorted buffer, effectively clearing items with greater or equal index values from that point).
  - If `false`, only the exact matched items that formed the complete row are removed from their buffers.

---

## Development

- **Testing**: Tests are written with Jest and can be run using your package manager's test script (e.g., `pnpm test`).
  - The project is configured with `ts-jest` for TypeScript support in tests.
- **Building**: To build the library (e.g., transpile TypeScript to JavaScript), use your package manager's build script (e.g., `pnpm build`).

---

## Publishing

This library is automatically published to [npm](https://www.npmjs.com/) when changes are pushed to the `main` branch, thanks to the `.github/workflows/publish-package.yml` GitHub Actions workflow.

---

Happy synchronizing\! Let us know if you have any questions or suggestions.
