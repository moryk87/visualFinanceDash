// localstorage keys - using vexly prefix for namespacing
// (this was the old name of the project)
const STORAGE_KEY = "vexly_flow_data";
const CURRENCY_KEY = "vexly_currency";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);

      // Handle legacy format: { subscriptions: [...] }
      if (data.subscriptions && !data.financeItems) {
        financeItems = data.subscriptions.map(normalizeFinanceItem);
      } else {
        financeItems = (data.financeItems || []).map(normalizeFinanceItem);
      }
      assignMissingOrders();
    }
  } catch (err) {
    console.warn("failed to load saved data:", err);
    financeItems = [];
  }
}

function normalizeFinanceItem(item) {
  const normalized = {
    ...item,
    id: item.id || Date.now().toString() + Math.random().toString(36).slice(2),
    kind: item.kind || "outcome",
    name: item.name || item.fullName || item.ticker || "",
    amount: item.amount || item.price || 0,
    currency: item.currency || "USD",
    cycle: item.cycle || "Monthly",
    color: item.color || randColor().id,
    icon: item.icon || "ph:cube-bold",
    date: item.date || "",
    order: Number.isFinite(Number(item.order)) ? Number(item.order) : null
  };

  if (normalized.kind === "investment") {
    normalized.owned = Number(item.owned ?? item.quantity) || 0;
    normalized.manualPrice = Number(item.manualPrice) || 0;
    normalized.marketCurrency = item.marketCurrency || normalized.currency;
    normalized.fullName = item.fullName || normalized.name;
    normalized.assetType = item.assetType || "stock";
    normalized.investmentMode = item.investmentMode || (normalized.assetType === "crypto" ? "crypto" : "stock_etf");
  }

  if (normalized.kind === "outcome") {
    normalized.url = item.url || "";
    normalized.logoUrl = item.logoUrl || "";
    normalized.iconMode = item.iconMode || (item.logoUrl ? "logo" : "manual");
  }

  if (normalized.kind === "saving") {
    normalized.savingType = item.savingType || "savings_account";
    normalized.currentBalance = Number(item.currentBalance) || 0;
    normalized.balanceCurrency = item.balanceCurrency || normalized.currency;
  }

  return normalized;
}

function assignMissingOrders() {
  const counters = {};
  financeItems.forEach((item, index) => {
    const kind = item.kind || "outcome";
    if (!counters[kind]) counters[kind] = 0;
    if (item.order === null || item.order === undefined || Number.isNaN(Number(item.order))) {
      item.order = counters[kind] + index / 10000;
    }
    counters[kind] = Math.max(counters[kind], Number(item.order) + 1);
  });
  ["income", "outcome", "saving", "investment"].forEach(kind => {
    financeItems
      .filter(item => item.kind === kind)
      .sort((a, b) => compareOrder(a, b))
      .forEach((item, index) => { item.order = index; });
  });
}

function save() {
  assignMissingOrders();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ financeItems }));
  renderItemList();
}

function loadCurrency() {
  const saved = localStorage.getItem(CURRENCY_KEY);

  // make sure it's a valid currency code
  if (saved && currencies[saved]) {
    selectedCurrency = saved;
  } else {
    selectedCurrency = "USD";
  }
}

function saveCurrency(code) {
  selectedCurrency = code;
  localStorage.setItem(CURRENCY_KEY, code);

  renderItemList();
  if (step === 3) setView(currentView);
}

function exportData() {
  const exportObj = {
    version: 2,
    exportedAt: new Date().toISOString(),
    currency: selectedCurrency,
    pinnedDisplayCurrency: pinnedDisplayCurrency,
    financeItems: financeItems
  };

  const jsonStr = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = "finance-dash-backup-" + new Date().toISOString().split("T")[0] + ".json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(blobUrl);
}

function importData(evt) {
  const file = evt.target.files && evt.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);

      // Support both v1 (subscriptions) and v2 (financeItems) formats
      let items = data.financeItems || [];
      const isV1 = !data.financeItems && data.subscriptions && Array.isArray(data.subscriptions);

      if (isV1) {
        // Migrate v1 format
        items = data.subscriptions.map(normalizeFinanceItem);
      }

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Invalid file format: no items found");
      }

      let replaceExisting = true;
      if (financeItems.length > 0) {
        replaceExisting = confirm(
          "You have " + financeItems.length + " existing item(s).\n\n" +
          "Click OK to replace them with " + items.length + " imported item(s).\n\n" +
          "Click Cancel to merge (add imported to existing)."
        );
      }

      if (replaceExisting || financeItems.length === 0) {
        financeItems = items.map(normalizeFinanceItem);
      } else {
        for (let i = 0; i < items.length; i++) {
          const imported = normalizeFinanceItem(items[i]);
          financeItems.push({
            ...imported,
            id: Date.now().toString() + Math.random().toString(36).slice(2)
          });
        }
      }
      assignMissingOrders();

      if (data.currency && currencies[data.currency]) {
        saveCurrency(data.currency);
      }

      if (data.pinnedDisplayCurrency) {
        pinnedDisplayCurrency = data.pinnedDisplayCurrency;
        updatePinnedCurrencyBadge();
      }

      save();
      closeSettings();
      alert("Successfully imported " + items.length + " item(s)!");

    } catch (err) {
      alert("Failed to import: " + err.message);
    }
  };

  reader.readAsText(file);

  // reset the input so they can import the same file again if needed
  evt.target.value = "";
}
