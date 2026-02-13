export interface PriceItem {
  service: string;
  price: number | string;
  prefix?: string; // "от " или "+" для цен с диапазоном или доплатой
  additionalInfo?: string; // Дополнительная информация об услуге
}

export interface PriceCategory {
  [categoryName: string]: PriceItem[];
}
