import { google } from 'googleapis';
import type { PriceItem, PriceCategory } from '../types/prices';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const SPREADSHEET_ID = '14StsbfQBd_b1Hk75bbRpzpfJ6lvvWdVkUz3_tO3xuYE';
const FALLBACK_JSON_PATH = join(process.cwd(), 'prices_json', 'prices.json');

// Hardcoded categories for better performance (instead of fetching sheet names)
const PRICE_CATEGORIES = ['Маникюр', 'Педикюр', 'Услуги бровиста', 'Подология'];

// Type alias for backward compatibility
export type PricesData = PriceCategory;

// Initialize Google Sheets API
function getGoogleSheetsClient() {
  if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
    throw new Error('GOOGLE_SHEETS_CREDENTIALS environment variable is required. Please add it to your .env file.');
  }

  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

// Cache the Google Sheets client to avoid recreating it on each request
let cachedClient: ReturnType<typeof getGoogleSheetsClient> | null = null;

function getCachedGoogleSheetsClient() {
  if (!cachedClient) {
    cachedClient = getGoogleSheetsClient();
  }
  return cachedClient;
}

// In-memory cache for prices data
let pricesCache: { data: PricesData; timestamp: number } | null = null;
const CACHE_DURATION = 1000; // 1 sec - temporary cache duration for testing (set to 5 minutes or more in production)

// Fetch prices from Google Sheets
export async function fetchPricesFromGoogleSheets(): Promise<PricesData> {
  // Check in-memory cache first
  if (pricesCache && Date.now() - pricesCache.timestamp < CACHE_DURATION) {
    console.log('⚡ Returning cached prices data');
    return pricesCache.data;
  }

  const startTime = Date.now();
  console.log('🔄 Fetching fresh prices from Google Sheets...');

  try {
    const sheets = getCachedGoogleSheetsClient();
    
    // Fetch data from all categories in one batch request (using hardcoded categories)
    const ranges = PRICE_CATEGORIES.map(name => `${name}!A2:D`);
    const batchResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ranges,
    });
    
    const pricesData: PricesData = {};
    
    // Process batch response
    batchResponse.data.valueRanges?.forEach((valueRange, index) => {
      const categoryName = PRICE_CATEGORIES[index];
      const rows = valueRange.values || [];
      
      pricesData[categoryName] = rows.map(row => ({
        service: row[0] || '',
        price: row[1] || '',
        prefix: row[2] || undefined,
        additionalInfo: row[3] || undefined,
      }));
    });
    
    // Update cache
    pricesCache = {
      data: pricesData,
      timestamp: Date.now(),
    };
    
    // Update fallback JSON file in background (only in development/local environment)
    // if (process.env.NODE_ENV !== 'production') {
    //   updateFallbackJSON(pricesData).catch(error => {
    //     console.warn('Failed to update fallback JSON:', error);
    //   });
    // }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Fetched fresh prices from Google Sheets in ${duration}ms`);
    return pricesData;
  } catch (error) {
    console.error('Error fetching prices from Google Sheets:', error);
    throw error;
  }
}

// Update fallback JSON file with fresh data (for development backup)
async function updateFallbackJSON(data: PricesData): Promise<void> {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    await writeFile(FALLBACK_JSON_PATH, jsonContent, 'utf-8');
    console.log('✅ Updated fallback JSON file with fresh prices');
  } catch (error) {
    // On Vercel (read-only filesystem), this will fail - that's OK
    console.warn('Could not update fallback JSON (possibly read-only filesystem):', error);
  }
}

// Main function to fetch prices (no fallback, always from Google Sheets)
export async function fetchPrices(): Promise<PricesData> {
  return await fetchPricesFromGoogleSheets();
}
