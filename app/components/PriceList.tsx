"use client";

import { PriceItem } from "@/types/prices";
import Image from "next/image";
import { useEffect, useState } from "react";

interface PriceListProps {
  category: string;
  items: PriceItem[];
}

export default function PriceList({ category, items }: PriceListProps) {
  const [pages, setPages] = useState<PriceItem[][]>([]);

  useEffect(() => {
    // Примерная высота элементов для расчета страниц
    const HEADER_HEIGHT = 150; // высота заголовка с логотипом
    const FOOTER_HEIGHT = 80; // высота футера
    const ITEM_HEIGHT = 28; // седняя высота одного элемента цены
    const PAGE_HEIGHT = 1122; // 297mm в пикселях при 96 DPI (297 * 3.7795)
    const PADDING = 76; // 20mm padding сверху и снизу

    const availableHeight =
      PAGE_HEIGHT - PADDING * 2 - HEADER_HEIGHT - FOOTER_HEIGHT;
    const itemsPerPage = Math.floor(availableHeight / ITEM_HEIGHT);

    // Разбиваем items на страницы
    const paginatedItems: PriceItem[][] = [];
    for (let i = 0; i < items.length; i += itemsPerPage) {
      paginatedItems.push(items.slice(i, i + itemsPerPage));
    }

    setPages(paginatedItems);
  }, [items]);

  const handlePrint = () => {
    window.print();
  };

  const Footer = ({
    pageNum,
    totalPages,
  }: {
    pageNum: number;
    totalPages: number;
  }) => (
    <div className="mt-auto pt-8 text-center text-sm text-gray-500">
      <p className="mb-2">
        Работа во внеурочные часы с 8.30-10.30 и с 20.30-22.30 оплачивается +50%
        к основному прайсу, по предварительной договорённости.
      </p>
      <p className="font-bold">Студия маникюра «Манхэттен beauty bar»</p>
      <p className="font-bold">Тел. 8 (985) 411-43-54, 8 (926) 394-80-50</p>
      {totalPages > 1 && (
        <p className="mt-2 text-gray-400">
          Страница {pageNum} из {totalPages}
        </p>
      )}
    </div>
  );

  if (pages.length === 0) {
    return null; // Загрузка
  }

  return (
    <div className="w-full">
      {/* Кнопка печати - скрывается при печати */}
      <div className="no-print mb-6 flex justify-center gap-4">
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
        >
          🖨️ Печать / Сохранить как PDF
        </button>
      </div>

      {/* Страницы A4 */}
      {pages.map((pageItems, pageIndex) => (
        <div
          key={pageIndex}
          className="print-area bg-white shadow-lg mx-auto flex flex-col mb-6 print:mb-0"
          style={{
            pageBreakAfter: pageIndex < pages.length - 1 ? "always" : "auto",
          }}
        >
          <div className="flex-grow">
            {/* Заголовок - только на первой странице */}
            {pageIndex === 0 && (
              <div className="text-center mb-4">
                <Image
                  width={540}
                  height={579}
                  style={{ width: 120, display: "block", margin: "0 auto" }}
                  src="/mbb+text-resize.png"
                  alt="logo"
                />
                <h2 className="text-3xl text-black font-bold text-center mt-6">
                  {category}
                </h2>
              </div>
            )}

            {/* Заголовок для продолжения на других страницах */}
            {pageIndex > 0 && (
              <div className="text-center pb-4 mb-6">
                <h2 className="text-3xl text-black font-bold">
                  {category} (продолжение)
                </h2>
              </div>
            )}

            {/* Таблица цен */}
            <div className="flex flex-col">
              {pageItems.map((item, index) => (
                <div
                  key={index}
                  className="flex relative justify-between items-end pb-[2px]"
                >
                  <div className="flex-1 pr-4">
                    <span className="font-medium bg-white relative text-black z-10 pr-1">
                      {item.service}
                    </span>
                    {item.additionalInfo && (
                      <div className="text-sm text-gray-500 mt-1">
                        {item.additionalInfo}
                      </div>
                    )}
                  </div>
                  <div className="absolute w-full border-b-[1.2px] border-black bottom-2 z-[1]" />
                  <div className="font-semibold text-black whitespace-nowrap text-right">
                    <span className="font-medium bg-white relative text-black z-10 pl-1">
                      {item.prefix && (
                        <span className="text-black">{item.prefix}</span>
                      )}
                      {item.price} р.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Футер */}
          <Footer pageNum={pageIndex + 1} totalPages={pages.length} />
        </div>
      ))}
    </div>
  );
}
