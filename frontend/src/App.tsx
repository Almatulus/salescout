import { useState } from "react";
import "./App.css";

interface PriceResult {
  sku: string;
  oldPrice: number;
  newPrice: number;
  reason: "UNDERCUT" | "AT_MIN" | "AT_MAX" | "NO_COMPETITORS";
}

const reasonLabels: Record<PriceResult["reason"], string> = {
  UNDERCUT: "Конкурентная цена",
  AT_MIN: "Минимальная цена",
  AT_MAX: "Максимальная цена",
  NO_COMPETITORS: "Нет конкурентов",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 2,
  }).format(price);
}

function App() {
  const [products, setProducts] = useState<PriceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPrices() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/reprice", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Не удалось загрузить цены");
      }

      const data: PriceResult[] = await response.json();
      setProducts(data);
    } catch {
      setError("Не удалось загрузить товары. Проверь соединение с сервером.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">SALESCOUT</p>
          <h1>Переоценка товаров</h1>
          <p className="subtitle">
            Результаты расчёта цен на основе предложений конкурентов
          </p>
        </div>

        <button
          className="primary-button"
          onClick={loadPrices}
          disabled={loading}
        >
          {loading ? "Загрузка..." : "Пересчитать цены"}
        </button>
      </header>

      <section className="table-card">
        <div className="table-heading">
          <h2>Список товаров</h2>
          <span>{products.length} товаров</span>
        </div>

        {error && <p className="error-message">{error}</p>}

        {!error && products.length === 0 && !loading && (
          <div className="empty-state">
            <p>Нажми «Пересчитать цены», чтобы загрузить товары.</p>
          </div>
        )}

        {loading && (
          <div className="empty-state">
            <p>Получаем результаты расчёта...</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Артикул</th>
                  <th>Текущая цена</th>
                  <th>Новая цена</th>
                  <th>Изменение</th>
                  <th>Причина</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const difference = product.newPrice - product.oldPrice;

                  return (
                    <tr key={product.sku}>
                      <td className="sku">{product.sku}</td>
                      <td>{formatPrice(product.oldPrice)}</td>
                      <td className="new-price">
                        {formatPrice(product.newPrice)}
                      </td>
                      <td>
                        <span
                          className={`change ${
                            difference < 0
                              ? "decrease"
                              : difference > 0
                                ? "increase"
                                : "unchanged"
                          }`}
                        >
                          {difference > 0 ? "+" : ""}
                          {formatPrice(difference)}
                        </span>
                      </td>
                      <td>
                        <span className={`reason ${product.reason}`}>
                          {reasonLabels[product.reason]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
