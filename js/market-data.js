const EODHD_API_KEY = "vexly_eodhd_api_key";
const TWELVE_DATA_API_KEY = "vexly_twelve_data_api_key";
const MARKET_DATA_CACHE_KEY = "vexly_market_data_cache";
const MARKET_DATA_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const COINGECKO_MARKETS_URL = "https://api.coingecko.com/api/v3/coins/markets";
const EODHD_BASE_URL = "https://eodhd.com/api";
const EODHD_FALLBACK_EXCHANGES = ["XETRA", "F", "LSE", "PA", "MI", "SW", "US"];

function loadEodhdApiKey() {
  return localStorage.getItem(EODHD_API_KEY) || "";
}

function saveEodhdApiKey(key) {
  localStorage.setItem(EODHD_API_KEY, (key || "").trim());
}

function loadTwelveDataApiKey() {
  return localStorage.getItem(TWELVE_DATA_API_KEY) || "";
}

function saveTwelveDataApiKey(key) {
  localStorage.setItem(TWELVE_DATA_API_KEY, (key || "").trim());
}

function getMarketDataCache() {
  try {
    return JSON.parse(localStorage.getItem(MARKET_DATA_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setMarketDataCache(key, value) {
  const cache = getMarketDataCache();
  cache[key] = { fetchedAt: Date.now(), value };
  localStorage.setItem(MARKET_DATA_CACHE_KEY, JSON.stringify(cache));
}

function getCachedMarketData(key) {
  const entry = getMarketDataCache()[key];
  if (!entry || Date.now() - entry.fetchedAt > MARKET_DATA_CACHE_TTL_MS) return null;
  return entry.value;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Market data request failed.");
  const data = await res.json();
  if (data && data.status === "error") {
    throw new Error(data.message || "Market data request failed.");
  }
  if (data && data.error) {
    throw new Error(data.error || "Market data request failed.");
  }
  return data;
}

async function lookupInstrument(rawTicker) {
  return lookupStockEtfInstrument(rawTicker);
}

async function lookupStockEtfInstrument(rawTicker) {
  const ticker = String(rawTicker || "").trim().toUpperCase();
  if (!ticker) throw new Error("Enter ticker first.");

  const cacheKey = "stock_etf:" + ticker;
  const cached = getCachedMarketData(cacheKey);
  if (cached) return cached;

  const apiKey = loadEodhdApiKey();
  if (!apiKey) throw new Error("Add EODHD API key in Settings first.");

  const symbols = buildEodhdSymbolCandidates(ticker);
  let lastError = null;

  for (const symbol of symbols) {
    try {
      const metadata = await lookupEodhdSymbol(symbol, ticker, apiKey);
      setMarketDataCache(cacheKey, metadata);
      return metadata;
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(lastError ? lastError.message : "Ticker was not found.");
}

function buildEodhdSymbolCandidates(ticker) {
  if (ticker.includes(".") || ticker.includes("-")) return [ticker];
  const candidates = [ticker];
  EODHD_FALLBACK_EXCHANGES.forEach(exchange => candidates.push(ticker + "." + exchange));
  return candidates;
}

async function lookupEodhdSymbol(symbol, requestedTicker, apiKey) {
  const eodUrl = EODHD_BASE_URL + "/eod/" + encodeURIComponent(symbol) + "?api_token=" + encodeURIComponent(apiKey) + "&fmt=json&period=d&order=d&limit=1";
  const quoteRows = await fetchJson(eodUrl);
  if (!Array.isArray(quoteRows) || quoteRows.length === 0) {
    throw new Error("No EODHD price found for " + symbol + ".");
  }

  const row = quoteRows[0];
  const price = Number(row.adjusted_close || row.close || 0);
  if (!price) throw new Error("No EODHD close price found for " + symbol + ".");

  let details = {};
  try {
    const fundamentalsUrl = EODHD_BASE_URL + "/fundamentals/" + encodeURIComponent(symbol) + "?api_token=" + encodeURIComponent(apiKey) + "&fmt=json";
    details = await fetchJson(fundamentalsUrl);
  } catch {
    details = {};
  }

  const general = details.General || {};
  const etfData = details.ETF_Data || {};
  const typeText = String(general.Type || general.Category || etfData.Type || "").toLowerCase();
  const hasEtfData = Object.keys(etfData).length > 0;
  const assetType = hasEtfData || typeText.includes("etf") || typeText.includes("fund") ? "etf" : "stock";
  const exchangeSuffix = symbol.includes(".") ? symbol.split(".").pop() : "";
  const currency = (general.CurrencyCode || general.Currency || row.currency || inferCurrencyFromExchange(exchangeSuffix) || "USD").toUpperCase();

  return {
    ticker: requestedTicker,
    providerSymbol: symbol,
    fullName: general.Name || general.Code || requestedTicker,
    assetType,
    manualPrice: price,
    marketCurrency: currency,
    countryCode: normalizeCountryCode(general.CountryISO || general.CountryName || general.Country || ""),
    icon: assetType === "etf" ? "ph:chart-pie-slice-bold" : "ph:chart-line-up-bold",
    logoUrl: "",
    iconMode: "manual",
    metadataProvider: "eodhd",
    quoteFetchedAt: new Date().toISOString(),
    cryptoManualOverride: false
  };
}

function inferCurrencyFromExchange(exchange) {
  const map = {
    XETRA: "EUR",
    F: "EUR",
    LSE: "GBP",
    PA: "EUR",
    MI: "EUR",
    SW: "CHF",
    US: "USD"
  };
  return map[exchange] || "";
}

async function loadTopCryptoInstruments() {
  const cacheKey = "crypto_top5";
  const cached = getCachedMarketData(cacheKey);
  if (cached) return cached;

  const topFiveUrl = COINGECKO_MARKETS_URL + "?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false";
  const markets = await fetchJson(topFiveUrl);
  const crypto = (Array.isArray(markets) ? markets : []).map(toCryptoInstrument).filter(Boolean);
  setMarketDataCache(cacheKey, crypto);
  return crypto;
}

async function lookupCryptoInstrument(tickerOrId) {
  const value = String(tickerOrId || "").trim().toLowerCase();
  if (!value) throw new Error("Select crypto first.");
  const instruments = await loadTopCryptoInstruments();
  const match = instruments.find(item => item.id === value || item.ticker.toLowerCase() === value);
  if (!match) throw new Error("Crypto is not in the supported top 5 menu.");
  return match;
}

function toCryptoInstrument(coin) {
  if (!coin || !coin.symbol) return null;
  return {
    id: coin.id,
    ticker: String(coin.symbol).toUpperCase(),
    fullName: coin.name || String(coin.symbol).toUpperCase(),
    assetType: "crypto",
    investmentMode: "crypto",
    manualPrice: Number(coin.current_price) || 0,
    marketCurrency: "USD",
    countryCode: "",
    icon: "ph:coins-bold",
    logoUrl: coin.image || "",
    iconMode: coin.image ? "logo" : "manual",
    metadataProvider: "coingecko",
    quoteFetchedAt: new Date().toISOString(),
    cryptoManualOverride: false
  };
}

function normalizeCountryCode(country) {
  const raw = String(country || "").trim();
  if (!raw) return "";
  if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
  const known = {
    "united states": "US",
    "usa": "US",
    "united kingdom": "GB",
    "great britain": "GB",
    "germany": "DE",
    "france": "FR",
    "netherlands": "NL",
    "switzerland": "CH",
    "canada": "CA",
    "japan": "JP",
    "china": "CN",
    "hong kong": "HK",
    "czech republic": "CZ",
    "czechia": "CZ",
    "ireland": "IE",
    "italy": "IT",
    "spain": "ES"
  };
  return known[raw.toLowerCase()] || raw.slice(0, 2).toUpperCase();
}
