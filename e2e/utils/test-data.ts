/**
 * E2E Test Data and Fixtures
 *
 * This file contains test data and utilities for E2E tests.
 */

export interface TestTemplate {
  name: string;
  imageFileName: string;
  regions: TestRegion[];
}

export interface TestRegion {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
}

export const TEST_TEMPLATES = {
  SIMPLE: {
    name: "シンプルアンケート",
    imageFileName: "simple-form.png",
    regions: [
      {
        name: "氏名",
        x: 50,
        y: 50,
        width: 200,
        height: 30,
        order: 1,
      },
      {
        name: "Q1回答",
        x: 50,
        y: 100,
        width: 200,
        height: 30,
        order: 2,
      },
      {
        name: "Q2回答",
        x: 50,
        y: 150,
        width: 200,
        height: 30,
        order: 3,
      },
    ],
  } as TestTemplate,
  COMPLEX: {
    name: "複雑なアンケート",
    imageFileName: "complex-form.png",
    regions: [
      {
        name: "ID",
        x: 30,
        y: 20,
        width: 150,
        height: 25,
        order: 1,
      },
      {
        name: "氏名",
        x: 30,
        y: 60,
        width: 300,
        height: 25,
        order: 2,
      },
      {
        name: "住所",
        x: 30,
        y: 100,
        width: 300,
        height: 50,
        order: 3,
      },
      {
        name: "電話番号",
        x: 30,
        y: 170,
        width: 200,
        height: 25,
        order: 4,
      },
      {
        name: "メール",
        x: 30,
        y: 210,
        width: 250,
        height: 25,
        order: 5,
      },
    ],
  } as TestTemplate,
};

export const TEST_FORM_DATA = {
  SIMPLE: {
    name: "氏名太郎",
    q1: "選択肢A",
    q2: "選択肢B",
  },
  COMPLEX: {
    id: "12345",
    name: "田中花子",
    address: "東京都渋谷区道玄坂1-2-3",
    phone: "090-1234-5678",
    email: "hanako@example.com",
  },
};

/**
 * Mock data for OCR results
 */
export const MOCK_OCR_RESULTS = {
  SIMPLE: [
    { text: "氏名太郎", confidence: 0.95 },
    { text: "選択肢A", confidence: 0.92 },
    { text: "選択肢B", confidence: 0.88 },
  ],
  COMPLEX: [
    { text: "12345", confidence: 0.97 },
    { text: "田中花子", confidence: 0.95 },
    { text: "東京都渋谷区道玄坂1-2-3", confidence: 0.89 },
    { text: "090-1234-5678", confidence: 0.93 },
    { text: "hanako@example.com", confidence: 0.91 },
  ],
};
