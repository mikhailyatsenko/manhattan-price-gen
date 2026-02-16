'use client';

import { useState, useEffect } from 'react';
import PriceList from './components/PriceList';
import AllPricesList from './components/AllPricesList';
import type { PriceCategory } from '@/types/prices';

export default function Home() {
  const [prices, setPrices] = useState<PriceCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch('/api/prices');
        if (!response.ok) {
          throw new Error('Ошибка загрузки цен');
        }
        const data = await response.json();
        setPrices(data);
        // Автоматически выбираем первую категорию
        const firstCategory = Object.keys(data)[0];
        if (firstCategory) {
          setSelectedCategory(firstCategory);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, []);

  // Обновляем title страницы при изменении категории
  useEffect(() => {
    if (showAll) {
      document.title = 'Все прайс-листы | Манхэттен beauty bar';
    } else if (selectedCategory) {
      document.title = `${selectedCategory} - Прайс-лист | Манхэттен beauty bar`;
    } else {
      document.title = 'Прайс-листы услуг | Манхэттен beauty bar';
    }
  }, [selectedCategory, showAll]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка прайс-листов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center bg-red-50 p-6 rounded-lg">
          <p className="text-red-600 font-semibold">Ошибка: {error}</p>
        </div>
      </div>
    );
  }

  if (!prices || Object.keys(prices).length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Нет доступных прайс-листов</p>
      </div>
    );
  }

  const categories = Object.keys(prices);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Выбор категории - скрывается при печати */}
        <div className="no-print mb-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
            Прайс-листы услуг
          </h1>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setShowAll(false);
                }}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedCategory === category && !showAll
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => setShowAll(true)}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                showAll
                  ? 'bg-green-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              📋 Все прайс-листы
            </button>
          </div>
        </div>

        {/* Все прайс-листы */}
        {showAll && <AllPricesList prices={prices} />}

        {/* Один прайс-лист */}
        {!showAll && selectedCategory && prices[selectedCategory] && (
          <PriceList
            category={selectedCategory}
            items={prices[selectedCategory]}
          />
        )}
      </div>
    </div>
  );
}
