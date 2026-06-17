let financeItems = [];
let step = 1;
let selectedCurrency = "USD";
let currentView = "treemap";
let pinnedDisplayCurrency = null;
let currentStep3Filter = "all";
let currentKind = "income"; // "income" | "outcome" | "investment"
let currentInvestmentMode = "stock_etf";
const supportedCurrencyCodes = ["CZK", "EUR", "USD"];

window.currencies = {
  USD: { symbol: "$", name: "US Dollar", rate: 1 },
  EUR: { symbol: "€", name: "Euro", rate: 0.92 },
  GBP: { symbol: "£", name: "British Pound", rate: 0.79 },
  JPY: { symbol: "¥", name: "Japanese Yen", rate: 149.5 },
  CNY: { symbol: "¥", name: "Chinese Yuan", rate: 7.24 },
  KRW: { symbol: "₩", name: "South Korean Won", rate: 1320 },
  INR: { symbol: "₹", name: "Indian Rupee", rate: 83.12 },
  CAD: { symbol: "C$", name: "Canadian Dollar", rate: 1.36 },
  AUD: { symbol: "A$", name: "Australian Dollar", rate: 1.53 },
  CHF: { symbol: "CHF", name: "Swiss Franc", rate: 0.88 },
  HKD: { symbol: "HK$", name: "Hong Kong Dollar", rate: 7.82 },
  SGD: { symbol: "S$", name: "Singapore Dollar", rate: 1.34 },
  SEK: { symbol: "kr", name: "Swedish Krona", rate: 10.42 },
  NOK: { symbol: "kr", name: "Norwegian Krone", rate: 10.85 },
  DKK: { symbol: "kr", name: "Danish Krone", rate: 6.87 },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar", rate: 1.64 },
  MXN: { symbol: "MX$", name: "Mexican Peso", rate: 17.15 },
  BRL: { symbol: "R$", name: "Brazilian Real", rate: 4.97 },
  ZAR: { symbol: "R", name: "South African Rand", rate: 18.65 },
  RUB: { symbol: "₽", name: "Russian Ruble", rate: 92.5 },
  TRY: { symbol: "₺", name: "Turkish Lira", rate: 29.2 },
  PLN: { symbol: "zł", name: "Polish Zloty", rate: 3.98 },
  THB: { symbol: "฿", name: "Thai Baht", rate: 35.2 },
  IDR: { symbol: "Rp", name: "Indonesian Rupiah", rate: 15650 },
  MYR: { symbol: "RM", name: "Malaysian Ringgit", rate: 4.72 },
  PHP: { symbol: "₱", name: "Philippine Peso", rate: 55.8 },
  VND: { symbol: "₫", name: "Vietnamese Dong", rate: 24500 },
  TWD: { symbol: "NT$", name: "Taiwan Dollar", rate: 31.5 },
  AED: { symbol: "د.إ", name: "UAE Dirham", rate: 3.67 },
  SAR: { symbol: "﷼", name: "Saudi Riyal", rate: 3.75 },
  ILS: { symbol: "₪", name: "Israeli Shekel", rate: 3.68 },
  CZK: { symbol: "Kč", name: "Czech Koruna", rate: 22.8 },
  HUF: { symbol: "Ft", name: "Hungarian Forint", rate: 356 },
  RON: { symbol: "lei", name: "Romanian Leu", rate: 4.57 },
  BGN: { symbol: "лв", name: "Bulgarian Lev", rate: 1.8 },
  HRK: { symbol: "kn", name: "Croatian Kuna", rate: 6.93 },
  CLP: { symbol: "CLP$", name: "Chilean Peso", rate: 880 },
  COP: { symbol: "COL$", name: "Colombian Peso", rate: 3950 },
  ARS: { symbol: "ARS$", name: "Argentine Peso", rate: 365 },
  PEN: { symbol: "S/", name: "Peruvian Sol", rate: 3.72 },
  EGP: { symbol: "E£", name: "Egyptian Pound", rate: 30.9 },
  NGN: { symbol: "₦", name: "Nigerian Naira", rate: 785 },
  KES: { symbol: "KSh", name: "Kenyan Shilling", rate: 153 },
  PKR: { symbol: "₨", name: "Pakistani Rupee", rate: 278 },
  BDT: { symbol: "৳", name: "Bangladeshi Taka", rate: 110 },
  UAH: { symbol: "₴", name: "Ukrainian Hryvnia", rate: 37.5 },
};

// tailwind color palette - bg is the lighter shade, accent for gradients
const colors = [
  { id: "purple", bg: "#FAF5FF", accent: "#E9D5FF" },
  { id: "blue", bg: "#EFF6FF", accent: "#BFDBFE" },
  { id: "cyan", bg: "#ECFEFF", accent: "#A5F3FC" },
  { id: "green", bg: "#F0FDF4", accent: "#BBF7D0" },
  { id: "yellow", bg: "#FEFCE8", accent: "#FEF08A" },
  { id: "orange", bg: "#FFF7ED", accent: "#FED7AA" },
  { id: "pink", bg: "#FDF2F8", accent: "#FBCFE8" },
  { id: "rose", bg: "#FFF1F2", accent: "#FECDD3" },
  { id: "slate", bg: "#F8FAFC", accent: "#E2E8F0" },
  { id: "indigo", bg: "#EEF2FF", accent: "#C7D2FE" },
  { id: "teal", bg: "#F0FDFA", accent: "#99F6E4" },
  { id: "amber", bg: "#FFFBEB", accent: "#FDE68A" },
];

const randColor = () => colors[Math.floor(Math.random() * colors.length)];

function getColor(colorId) {
  const found = colors.find(c => c.id === colorId);
  return found ? found : randColor();
}

const currencyLocales = {
  USD: "en-US", EUR: "de-DE", GBP: "en-GB", JPY: "ja-JP", CNY: "zh-CN",
  KRW: "ko-KR", INR: "en-IN", CAD: "en-CA", AUD: "en-AU", CHF: "de-CH",
  HKD: "zh-HK", SGD: "en-SG", SEK: "sv-SE", NOK: "nb-NO", DKK: "da-DK",
  NZD: "en-NZ", MXN: "es-MX", BRL: "pt-BR", ZAR: "en-ZA", RUB: "ru-RU",
  TRY: "tr-TR", PLN: "pl-PL", THB: "th-TH", IDR: "id-ID", MYR: "ms-MY",
  PHP: "en-PH", VND: "vi-VN", TWD: "zh-TW", AED: "ar-AE", SAR: "ar-SA",
  ILS: "he-IL", CZK: "cs-CZ", HUF: "hu-HU", RON: "ro-RO", BGN: "bg-BG",
  HRK: "hr-HR", CLP: "es-CL", COP: "es-CO", ARS: "es-AR", PEN: "es-PE",
  EGP: "ar-EG", NGN: "en-NG", KES: "en-KE", PKR: "en-PK", BDT: "bn-BD",
  UAH: "uk-UA"
};

function convertAmount(amount, fromCurrency, toCurrency) {
  const from = currencies[fromCurrency] || currencies.USD;
  const to = currencies[toCurrency] || currencies.USD;
  const usdAmount = amount / from.rate;
  return usdAmount * to.rate;
}

function convertToBase(amount, fromCurrency) {
  return convertAmount(amount, fromCurrency, selectedCurrency);
}

function formatNum(amount, decimals, currencyCode) {
  const locale = currencyLocales[currencyCode] || "en-US";
  return amount.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatCurrency(baseAmount, decimals = 2) {
  const curr = currencies[selectedCurrency];
  const dec = curr.rate > 100 ? 0 : decimals;
  return curr.symbol + formatNum(baseAmount, dec, selectedCurrency);
}

function formatCurrencyFor(amount, currencyCode, decimals = 2) {
  const curr = currencies[currencyCode] || currencies.USD;
  const dec = curr.rate > 100 ? 0 : decimals;
  return curr.symbol + formatNum(amount, dec, currencyCode);
}

function formatCurrencyShort(baseAmount) {
  const curr = currencies[selectedCurrency];
  if (baseAmount >= 1_000_000) return curr.symbol + (baseAmount / 1_000_000).toFixed(1) + "M";
  if (baseAmount >= 10_000) return curr.symbol + (baseAmount / 1_000).toFixed(0) + "k";
  if (curr.rate > 100) return curr.symbol + formatNum(Math.round(baseAmount), 0, selectedCurrency);
  return curr.symbol + formatNum(baseAmount, 0, selectedCurrency);
}

function formatCurrencyItem(item) {
  const code = item.currency || selectedCurrency || "USD";
  const curr = currencies[code] || currencies.USD;
  const dec = curr.rate > 100 ? 0 : 2;
  return curr.symbol + formatNum(item.amount, dec, code);
}

function formatMonthlyItem(item) {
  const code = item.currency || selectedCurrency || "USD";
  const curr = currencies[code] || currencies.USD;
  let monthly = item.amount;
  if (item.cycle === "Yearly") monthly = item.amount / 12;
  if (item.cycle === "Weekly") monthly = item.amount * 4.33;
  const dec = curr.rate > 100 ? 0 : 2;
  return curr.symbol + formatNum(monthly, dec, code);
}

function formatItemCycleDetail(item) {
  const code = item.currency || selectedCurrency || "USD";
  const monthly = getMonthlyInCurrency(item, code);
  if (item.kind === "investment" && Math.abs(monthly) < 0.005) return "";
  if (item.cycle === "Monthly") return formatCurrencyItem(item) + "/mo";
  return formatCurrencyItem(item) + " / " + item.cycle + " · " + formatCurrencyFor(monthly, code) + "/mo";
}

function formatMonthlyItemShort(item) {
  const code = item.currency || selectedCurrency || "USD";
  const curr = currencies[code] || currencies.USD;
  let monthly = item.amount;
  if (item.cycle === "Yearly") monthly = item.amount / 12;
  if (item.cycle === "Weekly") monthly = item.amount * 4.33;
  if (monthly >= 1_000_000) return curr.symbol + (monthly / 1_000_000).toFixed(1) + "M";
  if (monthly >= 10_000) return curr.symbol + (monthly / 1_000).toFixed(0) + "k";
  if (curr.rate > 100) return curr.symbol + formatNum(Math.round(monthly), 0, code);
  return curr.symbol + formatNum(monthly, 0, code);
}

function formatYearlyItemShort(item) {
  const code = item.currency || selectedCurrency || "USD";
  const curr = currencies[code] || currencies.USD;
  let yearly = item.amount * 12;
  if (item.cycle === "Yearly") yearly = item.amount;
  if (item.cycle === "Weekly") yearly = item.amount * 52;
  if (yearly >= 1_000_000) return curr.symbol + (yearly / 1_000_000).toFixed(1) + "M";
  if (yearly >= 10_000) return curr.symbol + (yearly / 1_000).toFixed(0) + "k";
  if (curr.rate > 100) return curr.symbol + formatNum(Math.round(yearly), 0, code);
  return curr.symbol + formatNum(yearly, 0, code);
}

function toMonthly(item) {
  const itemCurrency = item.currency || selectedCurrency || "USD";
  let monthly = item.amount;
  if (item.cycle === "Yearly") monthly = item.amount / 12;
  if (item.cycle === "Weekly") monthly = item.amount * 4.33;
  return convertToBase(monthly, itemCurrency);
}

function getMonthlyInCurrency(item, currencyCode) {
  const itemCurrency = item.currency || selectedCurrency || "USD";
  let monthly = Number(item.amount) || 0;
  if (item.cycle === "Yearly") monthly = monthly / 12;
  if (item.cycle === "Weekly") monthly = monthly * 4.33;
  return convertAmount(monthly, itemCurrency, currencyCode);
}

function getPortfolioValueInCurrency(item, currencyCode) {
  if (item.kind !== "investment") return 0;
  const quantity = getItemOwned(item);
  const price = Number(item.manualPrice) || 0;
  const marketCurrency = item.marketCurrency || item.currency || selectedCurrency;
  return convertAmount(quantity * price, marketCurrency, currencyCode);
}

function getItemOwned(item) {
  return Number(item.owned ?? item.quantity) || 0;
}

function getTotals(currencyCode = selectedCurrency) {
  return financeItems.reduce((totals, item) => {
    const monthly = getMonthlyInCurrency(item, currencyCode);
    if (item.kind === "income") totals.income += monthly;
    if (item.kind === "outcome") totals.outcome += monthly;
    if (item.kind === "investment") totals.investment += monthly;
    if (item.kind === "saving") totals.saving += monthly;
    return totals;
  }, { income: 0, outcome: 0, investment: 0, saving: 0 });
}

function getItemDisplayName(item, maxFullNameLength = 20) {
  if (item.kind !== "investment") return item.name;
  if ((item.assetType === "etf" || item.assetType === "crypto") && item.ticker) return item.ticker;
  if (item.ticker && item.fullName && item.fullName.length <= maxFullNameLength) return item.fullName;
  return item.ticker || item.name;
}

function getKindMeta(kind) {
  if (kind === "income") return { label: "Income", border: "#22c55e", text: "text-green-600" };
  if (kind === "investment") return { label: "Investment", border: "#2563eb", text: "text-blue-600" };
  if (kind === "saving") return { label: "Savings", border: "#0d9488", text: "text-teal-600" };
  return { label: "Expense", border: "#ef4444", text: "text-red-500" };
}

function getFilteredVisualizationItems() {
  if (currentStep3Filter === "income") {
    return financeItems.filter(item => item.kind === "income");
  }
  if (currentStep3Filter === "expenses") {
    return financeItems.filter(item => item.kind === "outcome" || item.kind === "investment" || item.kind === "saving");
  }
  return financeItems.slice();
}

function getStep3FilterLabel() {
  if (currentStep3Filter === "income") return "income";
  if (currentStep3Filter === "expenses") return "outgoing cashflow";
  return "cashflow items";
}

function getLogoDevUrl(domain) {
  const normalized = normalizeDomain(domain);
  if (!normalized) return "";
  return "https://img.logo.dev/" + encodeURIComponent(normalized) + "?token=pk_KuI_oR-IQ1-fqpAfz3FPEw&size=100&retina=true&format=png";
}

function normalizeDomain(value) {
  if (!value) return "";
  let raw = String(value).trim().toLowerCase();
  if (!raw) return "";
  try {
    if (!raw.startsWith("http")) raw = "https://" + raw;
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

function findPresetByDomain(domain) {
  const normalized = normalizeDomain(domain);
  if (!normalized || !Array.isArray(presets)) return null;
  return presets.find(preset => normalizeDomain(preset.domain) === normalized) || null;
}

function getItemIconHtml(item, className) {
  const classes = className || "h-10 w-10 shrink-0";
  if (item.logoUrl && item.iconMode === "logo") {
    return '<img src="' + escapeHtml(item.logoUrl) + '" alt="" class="' + classes + ' rounded-xl object-contain bg-white p-1" referrerpolicy="no-referrer" />';
  }
  const iconName = item.icon || "ph:cube-bold";
  return '<span class="iconify ' + classes + ' text-slate-400" data-icon="' + escapeHtml(iconName) + '"></span>';
}

function goToStep(stepNum) {
  if (stepNum > 1 && financeItems.filter(item => item.kind === "income").length === 0) {
    alert("Add at least one income first.");
    return;
  }

  if (stepNum === 1) currentKind = "income";
  if (stepNum === 2) currentKind = "outcome";

  // Hide pinned badge when leaving step 3
  if (step === 3) {
    const pinnedBadge = document.getElementById("pinned-currency-badge");
    if (pinnedBadge) pinnedBadge.classList.add("hidden");
  }

  document.querySelectorAll(".step-panel").forEach(panel => panel.classList.remove("active"));
  document.getElementById("step-" + stepNum).classList.add("active");

  const progressBar = document.getElementById("progress-bar");
  const indicator = document.getElementById("step-indicator");

  const barClasses = "h-full bg-indigo-600 transition-all duration-500 ease-out rounded-full";
  const widths = ["w-[33.33%]", "w-[66.66%]", "w-full"];
  progressBar.className = barClasses + " " + widths[stepNum - 1];

  indicator.innerText = "Step " + stepNum + " of 3";
  step = stepNum;

  renderItemList();

  if (stepNum === 3) {
    updatePinnedCurrencyBadge();
    setView(currentView);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setView(view) {
  currentView = view;

  const views = ["treemap", "beeswarm"];
  const activeClass = "bg-slate-900 text-white";
  const inactiveClass = "bg-white text-slate-600";

  views.forEach(v => {
    const btn = document.getElementById("view-" + v);
    if (btn) {
      btn.classList.remove(...activeClass.split(" "), ...inactiveClass.split(" "));
      if (v === view) {
        btn.classList.add(...activeClass.split(" "));
      } else {
        btn.classList.add(...inactiveClass.split(" "));
      }
    }
  });

  // Toggle containers
  const treemapContainer = document.getElementById("bento-grid");
  const beeswarmContainer = document.getElementById("beeswarm-container");

  treemapContainer.classList.add("hidden");
  beeswarmContainer.classList.add("hidden");

  if (view === "treemap") {
    treemapContainer.classList.remove("hidden");
    renderGrid();
  } else if (view === "beeswarm") {
    beeswarmContainer.classList.remove("hidden");
    renderBeeswarm();
  }
}

function setStep3Filter(filter) {
  currentStep3Filter = ["all", "income", "expenses"].includes(filter) ? filter : "all";
  const activeClass = "bg-slate-900 text-white";
  const inactiveClass = "bg-white text-slate-600";

  ["all", "income", "expenses"].forEach(option => {
    const btn = document.getElementById("filter-" + option);
    if (!btn) return;
    btn.classList.remove(...activeClass.split(" "), ...inactiveClass.split(" "));
    btn.classList.add(...(option === currentStep3Filter ? activeClass : inactiveClass).split(" "));
  });

  if (step === 3) setView(currentView);
}

function renderItemList() {
  renderIncomeScreen();
  renderOutcomeScreen();
  if (step === 3) {
    setView(currentView);
  }
}

function setButtonEnabled(button, enabled) {
  if (!button) return;
  button.disabled = !enabled;
  button.classList.toggle("opacity-50", !enabled);
  button.classList.toggle("cursor-not-allowed", !enabled);
}

function renderIncomeScreen() {
  const incomeItems = financeItems.filter(item => item.kind === "income").sort(compareOrder);
  const listContainer = document.getElementById("sub-list-container");
  const emptyState = document.getElementById("empty-state");
  const nextBtn = document.getElementById("next-btn-1");
  const clearBtn = document.getElementById("clear-btn");
  const totalEl = document.getElementById("income-step-total");

  if (!listContainer || !emptyState) return;

  if (totalEl) totalEl.innerText = formatCurrencyFor(getTotals(selectedCurrency).income, selectedCurrency);
  setButtonEnabled(nextBtn, incomeItems.length > 0);

  if (clearBtn) {
    clearBtn.classList.toggle("hidden", incomeItems.length === 0);
    clearBtn.classList.toggle("flex", incomeItems.length > 0);
  }

  if (incomeItems.length === 0) {
    listContainer.classList.add("hidden");
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  listContainer.classList.remove("hidden");
  listContainer.innerHTML = renderItemCards(incomeItems) + renderAddButton("income", "Add Income");
  initDragReorder(listContainer, "income");
}

function renderOutcomeScreen() {
  const expenseItems = financeItems.filter(item => item.kind === "outcome").sort(compareOrder);
  const savingItems = financeItems.filter(item => item.kind === "saving").sort(compareOrder);
  const investmentItems = financeItems.filter(item => item.kind === "investment").sort(compareOrder);
  const totals = getTotals(selectedCurrency);

  renderSectionList("expense-list-container", "expense-empty-state", expenseItems, "outcome", "Add Expense");
  renderSectionList("saving-list-container", "saving-empty-state", savingItems, "saving", "Add Savings");
  renderSectionList("investment-list-container", "investment-empty-state", investmentItems, "investment", "Add Investment");

  const expensesTotalEl = document.getElementById("expenses-step-total");
  const savingsTotalEl = document.getElementById("savings-step-total");
  const investmentsTotalEl = document.getElementById("investments-step-total");
  if (expensesTotalEl) expensesTotalEl.innerText = formatCurrencyFor(totals.outcome, selectedCurrency);
  if (savingsTotalEl) savingsTotalEl.innerText = formatCurrencyFor(totals.saving, selectedCurrency);
  if (investmentsTotalEl) investmentsTotalEl.innerText = formatCurrencyFor(totals.investment, selectedCurrency);

  const hasOutcome = expenseItems.length + savingItems.length + investmentItems.length > 0;
  const clearBtn = document.getElementById("clear-btn-2");
  if (clearBtn) {
    clearBtn.classList.toggle("hidden", !hasOutcome);
    clearBtn.classList.toggle("flex", hasOutcome);
  }
  setButtonEnabled(document.getElementById("next-btn-2"), financeItems.some(item => item.kind === "income"));
}

function renderSectionList(listId, emptyId, items, addKind, addLabel) {
  const listContainer = document.getElementById(listId);
  const emptyState = document.getElementById(emptyId);
  if (!listContainer || !emptyState) return;

  if (items.length === 0) {
    listContainer.classList.add("hidden");
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  listContainer.classList.remove("hidden");
  listContainer.innerHTML = renderItemCards(items) + renderAddButton(addKind, addLabel);
  initDragReorder(listContainer, addKind);
}

function renderItemCards(items) {
  let html = "";
  for (const item of items) {
    const meta = getKindMeta(item.kind);
    const itemName = getItemDisplayName(item);

    html += '<div class="finance-item-card flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm" draggable="true" data-id="' + item.id + '" data-kind="' + item.kind + '">';
    html += '<button type="button" class="drag-handle -ml-1 flex h-9 w-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-slate-300 hover:bg-slate-50 hover:text-slate-500 active:cursor-grabbing" title="Reorder"><span class="iconify h-5 w-5" data-icon="ph:dots-six-vertical-bold"></span></button>';
    html += '<div class="flex min-w-0 flex-1 cursor-pointer items-center gap-3" onclick="editItem(\'' + item.id + '\')">';
    html += '<div class="h-10 w-1 shrink-0 rounded-full" style="background:' + meta.border + ';"></div>';
    html += getItemIconHtml(item, "h-10 w-10 shrink-0");
    html += '<div class="min-w-0">';
    html += '<div class="truncate font-bold text-slate-900">' + escapeHtml(itemName) + '</div>';
    const cycleDetail = formatItemCycleDetail(item);
    if (cycleDetail) html += '<div class="text-xs text-slate-500">' + cycleDetail + '</div>';
    if (item.kind === "investment" && getItemOwned(item) && item.manualPrice) {
      const portfolioValue = getPortfolioValueInCurrency(item, item.marketCurrency || selectedCurrency);
      html += '<div class="text-xs font-medium text-blue-600">Value: ' + formatCurrencyFor(portfolioValue, item.marketCurrency || selectedCurrency, 0) + '</div>';
    }
    if (item.kind === "saving" && Number(item.currentBalance)) {
      html += '<div class="text-xs font-medium text-teal-600">Saved: ' + formatCurrencyFor(Number(item.currentBalance), item.balanceCurrency || item.currency || selectedCurrency, 0) + '</div>';
    }
    html += '</div></div>';
    html += '<div class="flex shrink-0 items-center gap-1">';
    html += '<button onclick="editItem(\'' + item.id + '\')" class="p-2 text-slate-300 hover:text-indigo-500"><span class="iconify" data-icon="ph:pencil-simple-bold"></span></button>';
    html += '<button onclick="removeItem(\'' + item.id + '\')" class="p-2 text-slate-300 hover:text-red-500"><span class="iconify" data-icon="ph:trash-bold"></span></button>';
    html += '</div></div>';
  }
  return html;
}

function renderAddButton(kind, label) {
  return '<button onclick="openModalForKind(\'' + kind + '\')" class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-4 font-bold text-slate-400 transition-all hover:border-indigo-300 hover:bg-white hover:text-indigo-600">' +
    '<span class="iconify h-5 w-5" data-icon="ph:plus-bold"></span>' + label + '</button>';
}

function compareOrder(a, b) {
  const aOrder = Number.isFinite(Number(a.order)) ? Number(a.order) : 0;
  const bOrder = Number.isFinite(Number(b.order)) ? Number(b.order) : 0;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return String(a.id || "").localeCompare(String(b.id || ""));
}

function getNextOrder(kind) {
  const sameKind = financeItems.filter(item => item.kind === kind);
  if (sameKind.length === 0) return 0;
  return Math.max(...sameKind.map(item => Number.isFinite(Number(item.order)) ? Number(item.order) : 0)) + 1;
}

function initDragReorder(container, kind) {
  if (!container) return;
  let draggedId = null;
  let targetId = null;

  container.querySelectorAll(".drag-handle").forEach(handle => {
    handle.addEventListener("pointerdown", event => {
      const card = event.target.closest(".finance-item-card");
      if (!card || card.dataset.kind !== kind) return;
      draggedId = card.dataset.id;
      targetId = null;
      card.classList.add("dragging");
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    handle.addEventListener("pointermove", event => {
      if (!draggedId) return;
      const el = document.elementFromPoint(event.clientX, event.clientY);
      const card = el ? el.closest(".finance-item-card") : null;
      container.querySelectorAll(".finance-item-card").forEach(item => item.classList.remove("drag-target"));
      if (card && card.dataset.kind === kind && card.dataset.id !== draggedId && container.contains(card)) {
        targetId = card.dataset.id;
        card.classList.add("drag-target");
      }
    });

    handle.addEventListener("pointerup", event => {
      const draggedCard = draggedId ? container.querySelector('[data-id="' + draggedId + '"]') : null;
      if (draggedCard) draggedCard.classList.remove("dragging");
      container.querySelectorAll(".finance-item-card").forEach(item => item.classList.remove("drag-target"));
      if (draggedId && targetId) reorderItemsWithinKind(kind, draggedId, targetId);
      draggedId = null;
      targetId = null;
      try { handle.releasePointerCapture(event.pointerId); } catch {}
    });

    handle.addEventListener("pointercancel", () => {
      container.querySelectorAll(".finance-item-card").forEach(item => item.classList.remove("dragging", "drag-target"));
      draggedId = null;
      targetId = null;
    });
  });
}

function reorderItemsWithinKind(kind, draggedId, targetId) {
  const ordered = financeItems.filter(item => item.kind === kind).sort(compareOrder);
  const fromIndex = ordered.findIndex(item => item.id === draggedId);
  const toIndex = ordered.findIndex(item => item.id === targetId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

  const [dragged] = ordered.splice(fromIndex, 1);
  ordered.splice(toIndex, 0, dragged);
  ordered.forEach((item, index) => { item.order = index; });
  save();
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function renderPresets() {
  const grid = document.getElementById("presets-grid");
  if (!grid) return;

  // full list is overwhelming, just show common ones here
  const popular = presets.filter(p => p.popular);

  let html = "";
  for (let i = 0; i < popular.length; i++) {
    const preset = popular[i];
    const presetIndex = presets.indexOf(preset);
    const icon = preset.icon || "ph:cube-bold";

    html += '<button onclick="openModalWithPreset(' + presetIndex + ')" ';
    html += 'class="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md active:scale-95 sm:p-3">';
    html += '<span class="iconify h-8 w-8 text-slate-500 sm:h-10 sm:w-10" data-icon="' + icon + '"></span>';
    html += '<span class="text-[10px] font-semibold text-slate-600 truncate w-full text-center sm:text-xs">' + preset.name + '</span>';
    html += '</button>';
  }
  grid.innerHTML = html;
}

function removeItem(itemId) {
  financeItems = financeItems.filter(i => i.id !== itemId);
  save();
}

function clearAllItems() {
  clearCurrentStepItems();
}

function clearCurrentStepItems() {
  const kinds = step === 1 ? ["income"] : ["outcome", "saving", "investment"];
  if (!confirm("Delete all " + (step === 1 ? "income" : "outcome") + " items?")) return;
  financeItems = financeItems.filter(i => !kinds.includes(i.kind));
  save();
}

function editItem(itemId) {
  const item = financeItems.find(i => i.id === itemId);
  if (!item) return;

  document.getElementById("entry-id").value = item.id;
  document.getElementById("name").value = item.name;
  document.getElementById("price").value = item.amount;
  document.getElementById("sub-currency").value = item.currency || selectedCurrency;
  document.getElementById("cycle").value = item.cycle;
  document.getElementById("logo-url").value = item.logoUrl || "";
  document.getElementById("icon-mode").value = item.iconMode || "manual";

  setFormKind(item.kind || "outcome");
  document.getElementById("selected-color").value = item.color || randColor().id;
  pickColor(item.color || randColor().id);

  if (item.icon) {
    document.getElementById("selected-icon").value = item.icon;
    pickIcon(item.icon);
  }

  if (item.kind === "outcome") {
    const urlEl = document.getElementById("url");
    if (urlEl) urlEl.value = item.url || "";
    updateExpenseLogoPreview(item.logoUrl || "", item.url || "");
  }

  if (item.kind === "saving") {
    const savingTypeEl = document.getElementById("saving-type");
    const balanceEl = document.getElementById("saving-current-balance");
    const balanceCurrencyEl = document.getElementById("saving-balance-currency");
    if (savingTypeEl) savingTypeEl.value = item.savingType || "savings_account";
    if (balanceEl) balanceEl.value = item.currentBalance || "";
    if (balanceCurrencyEl) balanceCurrencyEl.value = item.balanceCurrency || item.currency || selectedCurrency;
    if (item.icon) pickIcon(item.icon);
    if (item.color) pickColor(item.color);
  }

  // Investment fields
  if (item.kind === "investment") {
    setInvestmentMode(item.investmentMode || (item.assetType === "crypto" ? "crypto" : "stock_etf"));
    document.getElementById("ticker").value = item.ticker || "";
    document.getElementById("owned").value = getItemOwned(item) || "";
    const cryptoSelect = document.getElementById("crypto-select");
    if (cryptoSelect && item.assetType === "crypto") {
      cryptoSelect.value = (item.cryptoId || "").toLowerCase();
    }
    fillInvestmentMetadata({
      ticker: item.ticker || "",
      fullName: item.fullName || item.name || "",
      assetType: item.assetType || "stock",
      investmentMode: item.investmentMode || (item.assetType === "crypto" ? "crypto" : "stock_etf"),
      manualPrice: item.manualPrice || "",
      marketCurrency: item.marketCurrency || item.currency || selectedCurrency,
      countryCode: item.countryCode || "",
      icon: item.icon || "ph:chart-line-up-bold",
      logoUrl: item.logoUrl || "",
      iconMode: item.iconMode || "manual",
      metadataProvider: item.metadataProvider || "saved",
      providerSymbol: item.providerSymbol || "",
      cryptoId: item.cryptoId || "",
      quoteFetchedAt: item.quoteFetchedAt || "",
      cryptoManualOverride: !!item.cryptoManualOverride
    });
  }

  const kindLabels = { income: "Income", outcome: "Expense", investment: "Investment" };
  document.getElementById("modal-title").innerText = "Edit " + kindLabels[item.kind];
  document.querySelector("#sub-form button[type='submit']").innerText = "Save Changes";

  showModal();
}

const iconOptions = [
  "ph:bank-bold", "ph:credit-card-bold", "ph:cash-bold", "ph:wallet-bold",
  "ph:house-bold", "ph:car-bold", "ph:heart-bold", "ph:lightning-bold",
  "ph:game-controller-bold", "ph:music-notes-bold", "ph:film-strip-bold",
  "ph:book-open-bold", "ph:graduation-cap-bold", "ph:dumbbell-bold",
  "ph:first-aid-kit-bold", "ph:shield-check-bold", "ph:shopping-cart-bold", "ph:airplane-bold",
  "ph:train-bold", "ph:bus-bold", "ph:globe-simple-bold", "ph:cloud-bold",
  "ph:cpu-bold", "ph:code-bold", "ph:lock-bold", "ph:key-bold",
  "ph:chart-line-up-bold", "ph:chart-pie-slice-bold", "ph:coins-bold",
  "ph:cube-bold", "ph:package-bold", "ph:storefront-bold", "ph:coffee-bold",
  "ph:bowl-food-bold", "ph:pill-bold", "ph:flower-bold", "ph:tree-bold",
  "ph:dog-bold", "ph:cat-bold", "ph:phone-bold", "ph:laptop-bold",
  "ph:desktop-bold", "ph:tv-bold", "ph:cube-transparent-bold", "ph:star-bold",
  "ph:sun-bold", "ph:moon-bold", "ph:trend-up-bold", "ph:trend-down-bold"
];

const savingTypePresets = {
  savings_account: { label: "Savings account", icon: "ph:bank-bold", color: "teal" },
  building_savings: { label: "Building savings", icon: "ph:house-bold", color: "amber" },
  pension_savings: { label: "Pension savings", icon: "ph:shield-check-bold", color: "indigo" },
  envelope: { label: "Envelope", icon: "ph:wallet-bold", color: "cyan" }
};

function applySavingTypePreset(type) {
  const preset = savingTypePresets[type] || savingTypePresets.savings_account;
  document.getElementById("selected-icon").value = preset.icon;
  pickIcon(preset.icon);
  pickColor(preset.color);
}

function initIconPicker() {
  const grid = document.getElementById("icon-grid");
  if (!grid) return;

  let html = "";
  for (let i = 0; i < iconOptions.length; i++) {
    const icon = iconOptions[i];
    html += '<button type="button" onclick="pickIcon(\'' + icon + '\')" ';
    html += 'class="icon-option p-2 rounded-lg border-2 border-transparent hover:border-indigo-200 transition-all">';
    html += '<span class="iconify text-2xl text-slate-600" data-icon="' + icon + '"></span>';
    html += '</button>';
  }
  grid.innerHTML = html;
}

function pickIcon(iconName) {
  document.getElementById("selected-icon").value = iconName;

  document.querySelectorAll(".icon-option").forEach(opt => {
    opt.classList.remove("border-indigo-500", "bg-indigo-50");
    opt.classList.add("border-transparent");
  });

  const selected = document.querySelector('.icon-option[onclick="pickIcon(\'' + iconName + '\')"]');
  if (selected) {
    selected.classList.add("border-indigo-500", "bg-indigo-50");
    selected.classList.remove("border-transparent");
  }

  // Update preview
  const preview = document.getElementById("icon-preview");
  if (preview) {
    preview.innerHTML = '<span class="iconify text-3xl text-slate-600" data-icon="' + iconName + '"></span>';
  }
}

function handleExpenseWebsiteInput(value) {
  const domain = normalizeDomain(value);
  const logoUrl = domain ? getLogoDevUrl(domain) : "";
  document.getElementById("logo-url").value = logoUrl;
  document.getElementById("icon-mode").value = logoUrl ? "logo" : "manual";

  const preset = findPresetByDomain(domain);
  if (preset) {
    const nameEl = document.getElementById("name");
    const priceEl = document.getElementById("price");
    if (nameEl && !nameEl.value.trim()) nameEl.value = preset.name;
    if (priceEl && !priceEl.value) priceEl.value = preset.price || "";
    if (preset.cycle) document.getElementById("cycle").value = preset.cycle;
    pickColor(preset.color || document.getElementById("selected-color").value || randColor().id);
  }

  updateExpenseLogoPreview(logoUrl, domain);
}

function updateExpenseLogoPreview(logoUrl, domain) {
  const preview = document.getElementById("expense-logo-preview");
  if (!preview) return;
  if (!logoUrl) {
    preview.classList.add("hidden");
    preview.classList.remove("flex");
    preview.innerHTML = "";
    return;
  }
  preview.classList.remove("hidden");
  preview.classList.add("flex");
  preview.innerHTML = '<img src="' + escapeHtml(logoUrl) + '" alt="" class="h-6 w-6 rounded-md object-contain bg-white" referrerpolicy="no-referrer" /> Logo from ' + escapeHtml(domain || "website");
}

async function lookupInvestmentTicker() {
  const tickerEl = document.getElementById("ticker");
  const statusEl = document.getElementById("investment-lookup-status");
  const ticker = tickerEl ? tickerEl.value.trim().toUpperCase() : "";
  if (tickerEl) tickerEl.value = ticker;
  if (!ticker) return;

  setInvestmentMode("stock_etf");
  clearInvestmentMetadata(false);
  hideManualInvestmentFields();
  if (statusEl) {
    statusEl.className = "text-xs font-semibold text-slate-400";
    statusEl.innerText = "Looking up ticker...";
  }

  try {
    const metadata = await lookupStockEtfInstrument(ticker);
    fillInvestmentMetadata({ ...metadata, investmentMode: "stock_etf" });
    if (statusEl) {
      statusEl.className = "text-xs font-semibold text-green-600";
      statusEl.innerText = "Ticker metadata resolved.";
    }
  } catch (err) {
    clearInvestmentMetadata(false);
    showManualInvestmentFields();
    if (statusEl) {
      statusEl.className = "text-xs font-semibold text-amber-600";
      statusEl.innerText = (err.message || "Ticker lookup failed.") + " Fill manual override to save.";
    }
  }
}

function setInvestmentMode(mode) {
  currentInvestmentMode = mode === "crypto" ? "crypto" : "stock_etf";
  const modeInput = document.getElementById("investment-mode");
  if (modeInput) modeInput.value = currentInvestmentMode;

  const stockBtn = document.getElementById("investment-mode-stock-etf");
  const cryptoBtn = document.getElementById("investment-mode-crypto");
  const stockField = document.getElementById("stock-etf-ticker-field");
  const cryptoField = document.getElementById("crypto-select-field");
  const ownedLabel = document.getElementById("owned-label");
  const tickerInput = document.getElementById("ticker");
  const cryptoSelect = document.getElementById("crypto-select");

  if (stockBtn && cryptoBtn) {
    const active = "bg-slate-900 text-white";
    const inactive = "bg-white text-slate-600";
    stockBtn.classList.remove(...active.split(" "), ...inactive.split(" "));
    cryptoBtn.classList.remove(...active.split(" "), ...inactive.split(" "));
    stockBtn.classList.add(...(currentInvestmentMode === "stock_etf" ? active : inactive).split(" "));
    cryptoBtn.classList.add(...(currentInvestmentMode === "crypto" ? active : inactive).split(" "));
  }

  if (stockField) stockField.classList.toggle("hidden", currentInvestmentMode !== "stock_etf");
  if (cryptoField) cryptoField.classList.toggle("hidden", currentInvestmentMode !== "crypto");
  if (ownedLabel) ownedLabel.innerText = currentInvestmentMode === "crypto" ? "Owned coins" : "Owned shares";
  if (tickerInput) tickerInput.required = currentInvestmentMode === "stock_etf";
  if (cryptoSelect) cryptoSelect.required = currentInvestmentMode === "crypto";

  clearInvestmentMetadata(false);
  hideManualInvestmentFields();
  const statusEl = document.getElementById("investment-lookup-status");
  if (statusEl) statusEl.innerText = "";

  if (currentInvestmentMode === "crypto") {
    loadCryptoMenu();
  }
}

async function loadCryptoMenu() {
  const select = document.getElementById("crypto-select");
  const statusEl = document.getElementById("investment-lookup-status");
  if (!select) return;
  select.innerHTML = '<option value="">Loading...</option>';
  if (statusEl) {
    statusEl.className = "text-xs font-semibold text-slate-400";
    statusEl.innerText = "Loading top 5 crypto...";
  }

  try {
    const coins = await loadTopCryptoInstruments();
    let html = '<option value="">Select crypto</option>';
    coins.forEach(coin => {
      html += '<option value="' + escapeHtml(coin.id) + '">' + escapeHtml(coin.ticker + " - " + coin.fullName) + '</option>';
    });
    select.innerHTML = html;
    if (statusEl) statusEl.innerText = "";
  } catch (err) {
    select.innerHTML = '<option value="">Crypto unavailable</option>';
    if (statusEl) {
      statusEl.className = "text-xs font-semibold text-red-500";
      statusEl.innerText = err.message || "Crypto list failed.";
    }
  }
}

async function selectCryptoInstrument(value) {
  if (!value) {
    clearInvestmentMetadata(false);
    return;
  }
  const statusEl = document.getElementById("investment-lookup-status");
  if (statusEl) {
    statusEl.className = "text-xs font-semibold text-slate-400";
    statusEl.innerText = "Loading crypto price...";
  }
  try {
    const metadata = await lookupCryptoInstrument(value);
    fillInvestmentMetadata({ ...metadata, investmentMode: "crypto" });
    const tickerEl = document.getElementById("ticker");
    if (tickerEl) tickerEl.value = metadata.ticker;
    if (statusEl) {
      statusEl.className = "text-xs font-semibold text-green-600";
      statusEl.innerText = "Crypto metadata resolved.";
    }
  } catch (err) {
    clearInvestmentMetadata(false);
    if (statusEl) {
      statusEl.className = "text-xs font-semibold text-red-500";
      statusEl.innerText = err.message || "Crypto lookup failed.";
    }
  }
}

function showManualInvestmentFields() {
  const manual = document.getElementById("manual-investment-fields");
  if (manual) manual.classList.remove("hidden");
  const nameEl = document.getElementById("manual-investment-name");
  const tickerEl = document.getElementById("ticker");
  if (nameEl && tickerEl && !nameEl.value) nameEl.value = tickerEl.value.trim().toUpperCase();
  const currEl = document.getElementById("manual-investment-market-currency");
  if (currEl && !currEl.value) currEl.value = selectedCurrency;
}

function hideManualInvestmentFields() {
  const manual = document.getElementById("manual-investment-fields");
  if (manual) manual.classList.add("hidden");
}

function clearInvestmentMetadata(clearTicker) {
  const ids = [
    "investment-full-name", "investment-asset-type", "investment-manual-price",
    "investment-market-currency", "investment-country-code", "investment-logo-url",
    "investment-metadata-provider", "investment-quote-fetched-at",
    "investment-crypto-manual-override", "investment-provider-symbol", "investment-crypto-id"
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const iconMode = document.getElementById("investment-icon-mode");
  if (iconMode) iconMode.value = "manual";
  if (clearTicker) {
    const tickerEl = document.getElementById("ticker");
    if (tickerEl) tickerEl.value = "";
  }
  const summary = document.getElementById("investment-lookup-summary");
  if (summary) {
    summary.classList.add("hidden");
    summary.innerHTML = "";
  }
  const manualName = document.getElementById("manual-investment-name");
  const manualPrice = document.getElementById("manual-investment-price");
  if (manualName) manualName.value = "";
  if (manualPrice) manualPrice.value = "";
}

function fillInvestmentMetadata(metadata) {
  const fields = {
    "investment-full-name": metadata.fullName || metadata.ticker || "",
    "investment-asset-type": metadata.assetType || "stock",
    "investment-manual-price": metadata.manualPrice || "",
    "investment-market-currency": metadata.marketCurrency || selectedCurrency,
    "investment-country-code": metadata.countryCode || "",
    "investment-logo-url": metadata.logoUrl || "",
    "investment-icon-mode": metadata.iconMode || "manual",
    "investment-metadata-provider": metadata.metadataProvider || "",
    "investment-quote-fetched-at": metadata.quoteFetchedAt || "",
    "investment-crypto-manual-override": metadata.cryptoManualOverride ? "true" : "",
    "investment-provider-symbol": metadata.providerSymbol || "",
    "investment-crypto-id": metadata.id || metadata.cryptoId || ""
  };

  Object.keys(fields).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = fields[id];
  });

  const tickerEl = document.getElementById("ticker");
  if (tickerEl && metadata.ticker) tickerEl.value = metadata.ticker.toUpperCase();
  const modeEl = document.getElementById("investment-mode");
  if (modeEl) modeEl.value = metadata.investmentMode || (metadata.assetType === "crypto" ? "crypto" : "stock_etf");
  const nameEl = document.getElementById("name");
  if (nameEl) nameEl.value = metadata.fullName || metadata.ticker || "";
  document.getElementById("selected-icon").value = metadata.icon || "ph:chart-line-up-bold";

  const summary = document.getElementById("investment-lookup-summary");
  if (summary) {
    const iconHtml = metadata.logoUrl
      ? '<img src="' + escapeHtml(metadata.logoUrl) + '" alt="" class="h-9 w-9 rounded-lg object-contain bg-white p-1" referrerpolicy="no-referrer" />'
      : '<span class="iconify h-9 w-9 text-slate-500" data-icon="' + escapeHtml(metadata.icon || "ph:chart-line-up-bold") + '"></span>';
    summary.classList.remove("hidden");
    summary.innerHTML =
      '<div class="flex items-center gap-3">' + iconHtml +
      '<div class="min-w-0"><div class="truncate font-bold text-slate-900">' + escapeHtml(metadata.fullName || metadata.ticker) + '</div>' +
      '<div class="text-xs text-slate-500">' + escapeHtml((metadata.assetType || "stock").toUpperCase()) + ' · ' + escapeHtml(fields["investment-market-currency"]) + ' · ' + formatCurrencyFor(Number(metadata.manualPrice) || 0, fields["investment-market-currency"]) + '</div></div></div>';
  }
}

function setFormKind(kind) {
  currentKind = kind;
  document.getElementById("current-kind").value = kind;

  const kindSelector = document.getElementById("kind-selector");
  if (kindSelector) {
    kindSelector.classList.add("hidden");
  }

  ["income", "outcome", "investment", "saving"].forEach(k => {
    const btn = document.getElementById("kind-" + k + "-btn");
    if (btn) {
      if (k === kind) {
        btn.classList.add("bg-indigo-600", "text-white", "border-indigo-600");
        btn.classList.remove("border-slate-200", "text-slate-600");
      } else {
        btn.classList.remove("bg-indigo-600", "text-white", "border-indigo-600");
        btn.classList.add("border-slate-200", "text-slate-600");
      }
    }
  });

  const invFields = document.getElementById("investment-fields");
  if (invFields) {
    invFields.classList.toggle("hidden", kind !== "investment");
  }
  if (kind === "investment") {
    setInvestmentMode(currentInvestmentMode || "stock_etf");
  }

  const nameField = document.getElementById("name-field");
  const iconField = document.getElementById("icon-field");
  const currencyField = document.getElementById("currency-field");
  const colorField = document.getElementById("color-field");
  const websiteField = document.getElementById("expense-website-field");
  const savingFields = document.getElementById("saving-fields");
  const amountLabel = document.getElementById("amount-label");
  const nameInput = document.getElementById("name");
  const tickerInput = document.getElementById("ticker");
  const ownedInput = document.getElementById("owned");

  if (nameField) nameField.classList.toggle("hidden", kind === "investment");
  if (iconField) iconField.classList.toggle("hidden", kind === "investment");
  if (currencyField) currencyField.classList.remove("hidden");
  if (colorField) colorField.classList.toggle("hidden", kind === "investment");
  if (websiteField) websiteField.classList.toggle("hidden", kind !== "outcome");
  if (savingFields) savingFields.classList.toggle("hidden", kind !== "saving");
  if (amountLabel) amountLabel.innerText = kind === "investment" ? "Monthly amount" : "Amount";
  if (nameInput) nameInput.required = kind !== "investment";
  if (tickerInput) tickerInput.required = kind === "investment";
  if (ownedInput) ownedInput.required = kind === "investment";
  if (kind === "saving" && !document.getElementById("entry-id").value) {
    const savingType = document.getElementById("saving-type");
    if (savingType && !savingType.value) savingType.value = "savings_account";
    applySavingTypePreset(savingType ? savingType.value : "savings_account");
  }
}

function initColorPicker() {
  const container = document.getElementById("color-selector");
  let html = "";
  for (const color of colors) {
    html += '<div onclick="pickColor(\'' + color.id + '\')" ';
    html += 'class="color-option cursor-pointer rounded-lg h-10 border-2 border-transparent transition-all hover:scale-105" ';
    html += 'data-val="' + color.id + '" ';
    html += 'style="background:linear-gradient(135deg,' + color.bg + ' 0%,' + color.accent + ' 100%)"></div>';
  }
  container.innerHTML = html;
}

function pickColor(colorId) {
  document.getElementById("selected-color").value = colorId;

  const options = document.querySelectorAll(".color-option");
  for (const opt of options) {
    if (opt.dataset.val === colorId) {
      opt.classList.add("ring-2", "ring-indigo-500", "ring-offset-2");
    } else {
      opt.classList.remove("ring-2", "ring-indigo-500", "ring-offset-2");
    }
  }
}

function initCurrencySelector() {
  const dropdown = document.getElementById("currency-selector");
  if (!dropdown) return;

  let html = "";

  for (let i = 0; i < supportedCurrencyCodes.length; i++) {
    const code = supportedCurrencyCodes[i];
    const curr = currencies[code];
    const selected = (code === selectedCurrency) ? " selected" : "";
    html += '<option value="' + code + '"' + selected + '>' + curr.symbol + ' ' + code + ' - ' + curr.name + '</option>';
  }

  dropdown.innerHTML = html;
  dropdown.addEventListener("change", function(e) {
    saveCurrency(e.target.value);
  });
}

function initFormCurrencySelector() {
  const dropdown = document.getElementById("sub-currency");
  if (!dropdown) return;

  let html = "";

  for (let i = 0; i < supportedCurrencyCodes.length; i++) {
    const code = supportedCurrencyCodes[i];
    const curr = currencies[code];
    html += '<option value="' + code + '">' + curr.symbol + ' ' + code + '</option>';
  }

  dropdown.innerHTML = html;
  dropdown.value = selectedCurrency;

  const manualMarketCurrency = document.getElementById("manual-investment-market-currency");
  if (manualMarketCurrency) {
    manualMarketCurrency.innerHTML = html;
    manualMarketCurrency.value = selectedCurrency;
  }

  const savingBalanceCurrency = document.getElementById("saving-balance-currency");
  if (savingBalanceCurrency) {
    savingBalanceCurrency.innerHTML = html;
    savingBalanceCurrency.value = selectedCurrency;
  }
}

function handleFormSubmit(evt) {
  evt.preventDefault();

  const existingId = document.getElementById("entry-id").value;
  const kind = document.getElementById("current-kind").value || "outcome";
  const existingItem = existingId ? financeItems.find(i => i.id === existingId) : null;
  const investmentMode = document.getElementById("investment-mode").value || currentInvestmentMode || "stock_etf";
  const monthlyCurrency = document.getElementById("sub-currency").value;
  let metadataProvider = document.getElementById("investment-metadata-provider").value;
  let marketCurrency = document.getElementById("investment-market-currency").value || monthlyCurrency || selectedCurrency;
  const ticker = document.getElementById("ticker").value.trim().toUpperCase();

  if (kind === "investment" && (!metadataProvider || !document.getElementById("investment-manual-price").value)) {
    const manualVisible = !document.getElementById("manual-investment-fields").classList.contains("hidden");
    const manualName = document.getElementById("manual-investment-name").value.trim();
    const manualPrice = parseFloat(document.getElementById("manual-investment-price").value);
    if (investmentMode === "stock_etf" && manualVisible && manualName && manualPrice) {
      metadataProvider = "manual";
      marketCurrency = document.getElementById("manual-investment-market-currency").value || monthlyCurrency || selectedCurrency;
      fillInvestmentMetadata({
        ticker: ticker || manualName.toUpperCase(),
        fullName: manualName,
        assetType: "etf",
        investmentMode: "stock_etf",
        manualPrice,
        marketCurrency,
        countryCode: "",
        icon: "ph:chart-pie-slice-bold",
        logoUrl: "",
        iconMode: "manual",
        metadataProvider: "manual",
        quoteFetchedAt: new Date().toISOString(),
        cryptoManualOverride: false
      });
    } else {
      alert(investmentMode === "crypto" ? "Select a crypto first." : "Lookup ticker first or fill manual override.");
      return;
    }
  }

  const baseItem = {
    id: existingId || Date.now().toString(),
    kind: kind,
    name: kind === "investment"
      ? (document.getElementById("investment-full-name").value || ticker)
      : document.getElementById("name").value,
    amount: parseFloat(document.getElementById("price").value),
    currency: monthlyCurrency,
    cycle: document.getElementById("cycle").value,
    color: kind === "investment" ? "blue" : (document.getElementById("selected-color").value || randColor().id),
    icon: document.getElementById("selected-icon").value || "ph:cube-bold",
    date: document.getElementById("date").value || "",
    order: existingItem && existingItem.kind === kind ? existingItem.order : getNextOrder(kind)
  };

  if (kind === "outcome") {
    baseItem.url = document.getElementById("url").value.trim();
    baseItem.logoUrl = document.getElementById("logo-url").value;
    baseItem.iconMode = document.getElementById("icon-mode").value || "manual";
  }

  if (kind === "saving") {
    baseItem.savingType = document.getElementById("saving-type").value || "savings_account";
    baseItem.currentBalance = parseFloat(document.getElementById("saving-current-balance").value) || 0;
    baseItem.balanceCurrency = document.getElementById("saving-balance-currency").value || monthlyCurrency;
  }

  // Add investment-specific fields
  if (kind === "investment") {
    baseItem.ticker = document.getElementById("ticker").value.trim().toUpperCase();
    baseItem.fullName = document.getElementById("investment-full-name").value;
    baseItem.assetType = document.getElementById("investment-asset-type").value || "stock";
    baseItem.investmentMode = investmentMode;
    baseItem.owned = parseFloat(document.getElementById("owned").value) || 0;
    baseItem.manualPrice = parseFloat(document.getElementById("investment-manual-price").value) || 0;
    baseItem.marketCurrency = marketCurrency;
    baseItem.countryCode = document.getElementById("investment-country-code").value.toUpperCase();
    baseItem.logoUrl = document.getElementById("investment-logo-url").value;
    baseItem.iconMode = document.getElementById("investment-icon-mode").value || "manual";
    baseItem.metadataProvider = document.getElementById("investment-metadata-provider").value || metadataProvider;
    baseItem.providerSymbol = document.getElementById("investment-provider-symbol").value;
    baseItem.cryptoId = document.getElementById("investment-crypto-id").value;
    baseItem.quoteFetchedAt = document.getElementById("investment-quote-fetched-at").value;
    baseItem.cryptoManualOverride = document.getElementById("investment-crypto-manual-override").value === "true";
    baseItem.monthlyInvestmentAmount = baseItem.amount;
  }

  if (existingId) {
    const index = financeItems.findIndex(i => i.id === existingId);
    if (index !== -1) {
      financeItems[index] = baseItem;
    }
  } else {
    financeItems.push(baseItem);
  }

  save();
  hideModal();
  renderItemList();
}

document.addEventListener("DOMContentLoaded", async () => {
  await window.initRates();
  load();
  loadCurrency();
  initColorPicker();
  initCurrencySelector();
  initFormCurrencySelector();
  initIconPicker();
  renderPresets();
  initMarketDataSettings();
  renderItemList();
  document.getElementById("date").value = new Date().toISOString().split("T")[0];

  // Initialize step 3 currency selector if it exists
  initStep3CurrencySelector();
  initMarketCurrencySelector();
});

function initMarketDataSettings() {
  const input = document.getElementById("eodhd-api-key");
  if (input && typeof loadEodhdApiKey === "function") {
    input.value = loadEodhdApiKey();
  }
}

function saveMarketDataSettings() {
  const input = document.getElementById("eodhd-api-key");
  if (!input || typeof saveEodhdApiKey !== "function") return;
  saveEodhdApiKey(input.value);
  alert("EODHD API key saved locally.");
}

function initMarketCurrencySelector() {
  const dropdown = document.getElementById("manual-investment-market-currency");
  if (!dropdown) return;

  let html = "";

  for (let i = 0; i < supportedCurrencyCodes.length; i++) {
    const code = supportedCurrencyCodes[i];
    const curr = currencies[code];
    html += '<option value="' + code + '">' + curr.symbol + ' ' + code + '</option>';
  }
  dropdown.innerHTML = html;
  dropdown.value = selectedCurrency;
}

function initStep3CurrencySelector() {
  const dropdown = document.getElementById("step-3-currency-select");
  if (!dropdown) return;

  let html = '<option value="">Base</option>';

  for (let i = 0; i < supportedCurrencyCodes.length; i++) {
    html += '<option value="' + supportedCurrencyCodes[i] + '">' + supportedCurrencyCodes[i] + '</option>';
  }
  dropdown.innerHTML = html;
}

function togglePinnedCurrency() {
  const sel = document.getElementById("step-3-currency-select");
  if (!sel) return;

  if (pinnedDisplayCurrency === sel.value) {
    pinnedDisplayCurrency = null;
  } else {
    pinnedDisplayCurrency = sel.value || null;
  }
  updatePinnedCurrencyBadge();
  if (step === 3) setView(currentView);
}

function updatePinnedCurrencyBadge() {
  const badge = document.getElementById("pinned-currency-badge");
  const nameSpan = document.getElementById("pinned-curr-name");
  if (!badge) return;

  if (pinnedDisplayCurrency) {
    badge.classList.remove("hidden");
    if (nameSpan) nameSpan.innerText = pinnedDisplayCurrency;
  } else {
    badge.classList.add("hidden");
  }
}

function getDisplayCurrency() {
  return pinnedDisplayCurrency || selectedCurrency;
}
