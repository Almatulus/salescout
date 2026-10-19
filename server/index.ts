import express, { type Express, type Request, type Response } from "express";
import { calculatePrice } from "../src/pricing";
import type { Product } from "../src/types";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const app: Express = express();

app.use(express.json());

app.post("/reprice", async (_req: Request, res: Response) => {
  try {
    const filePath = resolve(process.cwd(), "data/products.json");
    const fileContent = await readFile(filePath, "utf-8");

    const products: Product[] = JSON.parse(fileContent);

    if (!Array.isArray(products)) {
      res.status(400).json({
        error: "Products data must be an array",
      });
      return;
    }

    const results = products.map(calculatePrice);

    res.json(results);
  } catch (error) {
    console.error("Ошибка при расчёте цен:", error);

    res.status(500).json({
      error: "Не удалось прочитать товары или рассчитать цены",
    });
  }
});

app.listen(3000);
