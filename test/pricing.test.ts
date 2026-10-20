import { describe, it, expect } from "vitest";
import { calculatePrice } from "../src/pricing";
import type { Product } from "../src/types";

const products: Product[] = [
  {
    sku: "IPH15-128-BLK",
    name: "Apple iPhone 15 128Gb черный",
    myPrice: 389990,
    minPrice: 370000,
    maxPrice: 420000,
    step: 10,
    competitors: [
      { seller: "TechnoMarket", price: 384990, inStock: true },
      { seller: "GadgetKZ", price: 379990, inStock: false },
      { seller: "AlmatyPhone", price: 386500, inStock: true },
    ],
  },
  {
    sku: "SAM-A55-256",
    name: "Samsung Galaxy A55 256Gb",
    myPrice: 189000,
    minPrice: 180000,
    maxPrice: 210000,
    step: 100,
    competitors: [{ seller: "MobiStore", price: 175000, inStock: true }],
  },
  {
    sku: "XIA-RN13-128",
    name: "Xiaomi Redmi Note 13 128Gb",
    myPrice: 89990,
    minPrice: 80000,
    maxPrice: 99990,
    step: 50,
    competitors: [{ seller: "Shop1", price: 85000, inStock: false }],
  },
  {
    sku: "AIRPODS-PRO2",
    name: "Apple AirPods Pro 2",
    myPrice: 119990,
    minPrice: 100000,
    maxPrice: 125000,
    step: 1,
    competitors: [{ seller: "EarShop", price: 150000, inStock: true }],
  },
  {
    sku: "DYSON-V15",
    name: "Dyson V15 Detect",
    myPrice: 359000,
    minPrice: 330000,
    maxPrice: 380000,
    step: 0.5,
    competitors: [{ seller: "HomeTech", price: 349999.9, inStock: true }],
  },
  {
    sku: "JBL-FLIP6",
    name: "JBL Flip 6",
    myPrice: 54990,
    minPrice: 45000,
    maxPrice: 60000,
    step: 10,
    competitors: [],
  },
];

const bySku = (sku: string): Product => {
  const p = products.find((x) => x.sku === sku);
  if (!p) throw new Error(`Товар ${sku} не найден`);
  return p;
};

describe("calculatePrice — реальные данные", () => {
  it("IPH15-128-BLK: UNDERCUT на 10 ниже лучшего в наличии", () => {
    const product = bySku("IPH15-128-BLK");

    const result = calculatePrice(product);

    expect(result).toEqual({
      sku: "IPH15-128-BLK",
      oldPrice: 389990,
      newPrice: 384980,
      reason: "UNDERCUT",
    });
  });

  it("SAM-A55-256: AT_MIN, т.к. конкурент ниже minPrice", () => {
    const product = bySku("SAM-A55-256");

    const result = calculatePrice(product);

    expect(result).toEqual({
      sku: "SAM-A55-256",
      oldPrice: 189000,
      newPrice: 180000,
      reason: "AT_MIN",
    });
  });

  it("XIA-RN13-128: NO_COMPETITORS (единственный конкурент не в наличии)", () => {
    const product = bySku("XIA-RN13-128");

    const result = calculatePrice(product);

    expect(result).toEqual({
      sku: "XIA-RN13-128",
      oldPrice: 89990,
      newPrice: 99990,
      reason: "NO_COMPETITORS",
    });
  });

  it("AIRPODS-PRO2: AT_MAX, т.к. цена конкурента выше maxPrice", () => {
    const product = bySku("AIRPODS-PRO2");

    const result = calculatePrice(product);

    expect(result).toEqual({
      sku: "AIRPODS-PRO2",
      oldPrice: 119990,
      newPrice: 125000,
      reason: "AT_MAX",
    });
  });

  it("DYSON-V15: UNDERCUT с дробной ценой, округление вниз", () => {
    const product = bySku("DYSON-V15");

    const result = calculatePrice(product);

    expect(result).toEqual({
      sku: "DYSON-V15",
      oldPrice: 359000,
      newPrice: 349999,
      reason: "UNDERCUT",
    });
  });

  it("JBL-FLIP6: NO_COMPETITORS при пустом списке конкурентов", () => {
    const product = bySku("JBL-FLIP6");

    const result = calculatePrice(product);

    expect(result).toEqual({
      sku: "JBL-FLIP6",
      oldPrice: 54990,
      newPrice: 60000,
      reason: "NO_COMPETITORS",
    });
  });

  it("не мутирует исходные товары", () => {
    const snapshot = JSON.parse(JSON.stringify(products));

    products.forEach((p) => calculatePrice(p));

    expect(products).toEqual(snapshot);
  });

  it("детерминированность: повторный вызов даёт тот же результат", () => {
    products.forEach((p) => {
      expect(calculatePrice(p)).toEqual(calculatePrice(p));
    });
  });
});
