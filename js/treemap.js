/*
 * squarified treemap layout
 * based on the bruls et al. algorithm
 * https://www.win.tue.nl/~vanwijk/stm.pdf
 */
class Treemap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cellGap = 4; // gap between cells in px
  }

  layout(items) {
    if (items.length === 0) return [];

    let total = 0;
    for (let i = 0; i < items.length; i++) {
      total += items[i].val;
    }

    const normalized = [];
    const totalArea = this.width * this.height;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      normalized.push({
        id: item.id,
        name: item.name,
        url: item.url,
        color: item.color,
        price: item.price,
        currency: item.currency,
        cycle: item.cycle,
        cost: item.cost,
        val: item.val,
        idx: item.idx,
        area: (item.val / total) * totalArea
      });
    }

    const rectangles = [];
    this._squarify(normalized, [], 0, 0, this.width, this.height, rectangles);
    return rectangles;
  }

  // recursive squarification - tries to make cells as square as possible
  _squarify(remaining, currentRow, x, y, w, h, output) {
    if (remaining.length === 0) {
      this._layoutRow(currentRow, x, y, w, h, output);
      return;
    }

    const next = remaining[0];
    const withNext = currentRow.concat([next]);

    if (currentRow.length === 0 || this._worstRatio(currentRow, w, h) >= this._worstRatio(withNext, w, h)) {
      this._squarify(remaining.slice(1), withNext, x, y, w, h, output);
    } else {
      const bounds = this._layoutRow(currentRow, x, y, w, h, output);
      this._squarify(remaining, [], bounds.nx, bounds.ny, bounds.nw, bounds.nh, output);
    }
  }

  _worstRatio(row, w, h) {
    if (row.length === 0) return Infinity;

    let areaSum = 0;
    for (let i = 0; i < row.length; i++) {
      areaSum += row[i].area;
    }

    const shortSide = Math.min(w, h);
    const rowThickness = areaSum / shortSide;

    let worstRatio = 0;
    for (let i = 0; i < row.length; i++) {
      const itemLength = row[i].area / rowThickness;
      const ratio = Math.max(rowThickness / itemLength, itemLength / rowThickness);
      if (ratio > worstRatio) {
        worstRatio = ratio;
      }
    }

    return worstRatio;
  }

  _layoutRow(row, x, y, w, h, output) {
    if (row.length === 0) {
      return { nx: x, ny: y, nw: w, nh: h };
    }

    let areaSum = 0;
    for (let i = 0; i < row.length; i++) {
      areaSum += row[i].area;
    }

    const horizontal = (w >= h);
    const shortSide = horizontal ? h : w;
    const thickness = areaSum / shortSide;
    const gap = this.cellGap;

    let offset = 0;

    for (let i = 0; i < row.length; i++) {
      const item = row[i];
      const length = item.area / thickness;

      if (horizontal) {
        output.push({
          id: item.id,
          name: item.name,
          url: item.url,
          color: item.color,
          price: item.price,
          currency: item.currency,
          cycle: item.cycle,
          cost: item.cost,
          val: item.val,
          idx: item.idx,
          area: item.area,
          x: x + gap / 2,
          y: y + offset + gap / 2,
          w: thickness - gap,
          h: length - gap
        });
      } else {
        output.push({
          id: item.id,
          name: item.name,
          url: item.url,
          color: item.color,
          price: item.price,
          currency: item.currency,
          cycle: item.cycle,
          cost: item.cost,
          val: item.val,
          idx: item.idx,
          area: item.area,
          x: x + offset + gap / 2,
          y: y + gap / 2,
          w: length - gap,
          h: thickness - gap
        });
      }

      offset += length;
    }

    if (horizontal) {
      return { nx: x + thickness, ny: y, nw: w - thickness, nh: h };
    } else {
      return { nx: x, ny: y + thickness, nw: w, nh: h - thickness };
    }
  }
}

function renderGrid() {
  const gridEl = document.getElementById("bento-grid");
  if (!gridEl) return;

  const displayCurr = getDisplayCurrency();
  const totals = getTotals(displayCurr);
  const incomeTotal = totals.income;
  const outcomeTotal = totals.outcome;
  const investmentMonthlyTotal = totals.investment;
  const savingMonthlyTotal = totals.saving;

  // Build items array with kind info
  const items = [];
  const visibleItems = getFilteredVisualizationItems();

  for (let i = 0; i < visibleItems.length; i++) {
    const item = visibleItems[i];
    const monthlyCost = getMonthlyInCurrency(item, displayCurr);

    items.push({
      id: item.id,
      name: item.name,
      kind: item.kind,
      icon: item.icon || "ph:cube-bold",
      logoUrl: item.logoUrl || "",
      iconMode: item.iconMode || "manual",
      color: item.color,
      amount: item.amount,
      currency: item.currency,
      cycle: item.cycle,
      cost: monthlyCost,
      // Investment-specific
      ticker: item.ticker,
      fullName: item.fullName,
      assetType: item.assetType,
      owned: getItemOwned(item),
      manualPrice: item.manualPrice,
      marketCurrency: item.marketCurrency,
      currentBalance: item.currentBalance,
      balanceCurrency: item.balanceCurrency
    });
  }

  // Update step 3 summary totals
  const incomeEl = document.getElementById("step-3-income-total");
  const outcomeEl = document.getElementById("step-3-outcome-total");
  const investEl = document.getElementById("step-3-investment-total");
  const savingEl = document.getElementById("step-3-saving-total");
  const balanceEl = document.getElementById("step-3-balance");

  if (incomeEl) incomeEl.innerText = formatCurrencyFor(incomeTotal, displayCurr, 0);
  if (outcomeEl) outcomeEl.innerText = formatCurrencyFor(outcomeTotal, displayCurr, 0);
  if (investEl) investEl.innerText = formatCurrencyFor(investmentMonthlyTotal, displayCurr, 0);
  if (savingEl) savingEl.innerText = formatCurrencyFor(savingMonthlyTotal, displayCurr, 0);
  if (balanceEl) balanceEl.innerText = formatCurrencyFor(incomeTotal - outcomeTotal - investmentMonthlyTotal - savingMonthlyTotal, displayCurr, 0);

  const totalFlow = items.reduce(function(total, item) { return total + item.cost; }, 0);

  items.sort(function(a, b) { return b.cost - a.cost; });

  if (items.length === 0 || totalFlow <= 0) {
    gridEl.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400">No ' + getStep3FilterLabel() + ' to show</div>';
    return;
  }

  const bounds = gridEl.getBoundingClientRect();
  const safeInset = (bounds.width || 600) < 500 ? 8 : 12;
  const gridWidth = Math.max(100, (bounds.width || 600) - safeInset * 2);
  const gridHeight = Math.max(100, (bounds.height || 450) - safeInset * 2);

  const treemapData = [];
  for (let i = 0; i < items.length; i++) {
    treemapData.push({
      id: items[i].id,
      name: items[i].name,
      kind: items[i].kind,
      icon: items[i].icon,
      logoUrl: items[i].logoUrl,
      iconMode: items[i].iconMode,
      color: items[i].color,
      amount: items[i].amount,
      currency: items[i].currency,
      cycle: items[i].cycle,
      ticker: items[i].ticker,
      fullName: items[i].fullName,
      assetType: items[i].assetType,
      owned: items[i].owned,
      manualPrice: items[i].manualPrice,
      marketCurrency: items[i].marketCurrency,
      currentBalance: items[i].currentBalance,
      balanceCurrency: items[i].balanceCurrency,
      cost: items[i].cost,
      val: items[i].cost,
      idx: i
    });
  }

  const treemap = new Treemap(gridWidth, gridHeight);
  const cells = treemap.layout(treemapData);

  let html = "";

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const item = items[cell.idx];
    const percent = (cell.cost / totalFlow) * 100;
    const colorPalette = getColor(item.color);

    // Kind border color
    let borderStyle = "";
    if (item.kind === "income") borderStyle = "border: 2px solid #22c55e;";
    else if (item.kind === "outcome") borderStyle = "border: 2px solid #ef4444;";
    else if (item.kind === "investment") borderStyle = "border: 2px solid #3b82f6;";
    else if (item.kind === "saving") borderStyle = "border: 2px solid #0d9488;";

    const minDim = Math.min(cell.w, cell.h);
    const clampedPct = Math.max(3, Math.min(60, percent));

    const padding = Math.round(Math.max(6, Math.min(minDim * 0.08, 16)) + (clampedPct / 60) * 8);
    const borderRadius = Math.round(Math.max(6, Math.min(minDim * 0.12, 20)) + (clampedPct / 60) * 6);

    const innerWidth = cell.w - padding * 2;
    const innerHeight = cell.h - padding * 2;

    const maxPriceFont = Math.min(Math.floor(innerWidth * 0.16), Math.floor(innerHeight * 0.28));
    const priceFont = Math.max(10, Math.min(12 + (clampedPct / 60) * 36, maxPriceFont, 48));
    const titleFont = Math.max(8, Math.min(9 + (clampedPct / 60) * 15, priceFont * 0.55, 24));
    const iconSize = Math.max(14, Math.min(18 + (clampedPct / 60) * 30, innerHeight * 0.3, innerWidth * 0.35, 48));

    const isMicro = minDim < 40 || (cell.w < 50 && cell.h < 50);
    const isTiny = minDim < 55 || (cell.w < 65 && cell.h < 65);
    const isSmall = minDim < 85 || cell.w < 95;

    const formattedMonthly = formatCurrencyFor(item.cost, displayCurr, 0);

    let cellContent = "";

    if (isMicro) {
      const sz = Math.max(12, Math.min(iconSize, minDim * 0.5));
      cellContent = '<div class="flex items-center justify-center h-full w-full">' + renderTreemapIcon(item, sz) + '</div>';

    } else if (isTiny) {
      const sz = Math.max(14, Math.min(iconSize, minDim * 0.4));
      const ps = Math.max(9, Math.min(priceFont, 13, innerWidth * 0.16));
      cellContent = '<div class="flex flex-col items-center justify-center h-full w-full gap-1">';
      cellContent += renderTreemapIcon(item, sz);
      cellContent += '<div class="font-bold text-slate-900" style="font-size:' + ps + 'px">' + formattedMonthly + '</div>';
      cellContent += '</div>';

    } else if (isSmall) {
      const sz = Math.max(16, Math.min(iconSize, innerWidth * 0.35, innerHeight * 0.25));
      const ts = Math.max(8, Math.min(titleFont, 11, innerWidth * 0.12));
      const ps = Math.max(11, Math.min(priceFont, 18, innerWidth * 0.18));

      const displayName = (item.kind === "investment" && item.ticker)
        ? getItemDisplayName(item, 15)
        : item.name;

      cellContent = '<div class="flex flex-col items-center justify-center h-full w-full gap-1 text-center">';
      cellContent += renderTreemapIcon(item, sz);
      cellContent += '<div class="min-w-0 w-full">';
      cellContent += '<div class="font-semibold text-slate-900 treemap-cell-name" style="font-size:' + ts + 'px">' + displayName + '</div>';
      cellContent += '<div class="font-black text-slate-900" style="font-size:' + ps + 'px">' + formattedMonthly + '</div>';
      cellContent += '</div></div>';

    } else {
      const showPercentBadge = cell.w > 80 && cell.h > 70;
      const showYearlyEstimate = cell.h > 130 && cell.w > 110 && percent > 8;

      const displayName = (item.kind === "investment" && item.ticker)
        ? getItemDisplayName(item, 20)
        : item.name;

      // For investments, show monthly + current value
      let investmentInfo = "";
      if (item.kind === "investment" && getItemOwned(item) && item.manualPrice) {
        const currentVal = getPortfolioValueInCurrency(item, displayCurr);
        investmentInfo = '<div class="text-xs font-medium text-blue-600 mt-1">Value: ' + formatCurrencyFor(currentVal, displayCurr, 0) + '</div>';
      }
      if (item.kind === "saving" && Number(item.currentBalance)) {
        investmentInfo = '<div class="text-xs font-medium text-teal-600 mt-1">Saved: ' + formatCurrencyFor(Number(item.currentBalance), item.balanceCurrency || displayCurr, 0) + '</div>';
      }

      cellContent = '<div class="flex justify-between items-start">';
      cellContent += renderTreemapIcon(item, iconSize);
      if (showPercentBadge) {
        cellContent += '<span class="text-[10px] font-bold bg-white/70 px-2 py-1 rounded-full text-slate-700">' + Math.round(percent) + '%</span>';
      }
      cellContent += '</div>';
      cellContent += '<div class="mt-auto min-w-0">';
      cellContent += '<div class="font-bold text-slate-900 treemap-cell-name" style="font-size:' + titleFont + 'px">' + displayName + '</div>';
      cellContent += '<div class="font-black text-slate-900 tracking-tight leading-none" style="font-size:' + priceFont + 'px">' + formattedMonthly + '</div>';
      if (investmentInfo) {
        cellContent += investmentInfo;
      } else if (showYearlyEstimate) {
        cellContent += '<div class="text-xs font-medium text-slate-500 mt-1">~' + formatCurrencyFor(item.cost * 12, displayCurr, 0) + '/yr</div>';
      }
      cellContent += '</div>';
    }

    html += '<div class="treemap-cell" data-id="' + cell.id + '" style="left:' + (cell.x + safeInset) + 'px;top:' + (cell.y + safeInset) + 'px;width:' + cell.w + 'px;height:' + cell.h + 'px;border-radius:' + borderRadius + 'px;' + borderStyle + '">';
    html += '<div class="treemap-cell-inner" style="background:linear-gradient(135deg,' + colorPalette.bg + ' 0%,' + colorPalette.accent + ' 100%);padding:' + padding + 'px;border-radius:' + Math.max(4, borderRadius - 3) + 'px">';
    html += cellContent;
    html += '</div></div>';
  }

  gridEl.innerHTML = html;
}

function renderTreemapIcon(item, size) {
  if (item.logoUrl && item.iconMode === "logo") {
    return '<img src="' + escapeHtml(item.logoUrl) + '" alt="" class="shrink-0 rounded-lg object-contain bg-white p-1" style="width:' + size + 'px;height:' + size + 'px" referrerpolicy="no-referrer" />';
  }
  return '<span class="iconify text-slate-500 shrink-0" style="width:' + size + 'px;height:' + size + 'px" data-icon="' + escapeHtml(item.icon || "ph:cube-bold") + '"></span>';
}

async function exportAsImage() {
  const exportContainer = document.getElementById("export-container");
  if (!exportContainer) return;

  const btn = event.target.closest("button");
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<span class="iconify h-5 w-5 animate-spin" data-icon="ph:spinner-bold"></span> Exporting...';
  btn.disabled = true;

  try {
    // using modern-screenshot library for this
    const pngUrl = await modernScreenshot.domToPng(exportContainer, {
      scale: 2, // 2x for retina
      backgroundColor: "#ffffff",
      style: {
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        borderRadius: "2.5rem",
        overflow: "hidden"
      },
      onCloneNode: function(node) {
        // force font family on all cloned elements
        // otherwise the screenshot sometimes uses weird fonts
        if (node.style) {
          node.style.fontFamily = "system-ui, -apple-system, sans-serif";
        }
        if (node.querySelectorAll) {
          var elements = node.querySelectorAll("*");
          for (var i = 0; i < elements.length; i++) {
            if (elements[i].style) {
              elements[i].style.fontFamily = "system-ui, -apple-system, sans-serif";
            }
          }
        }
        return node;
      },
      fetch: { bypassingCache: true }
    });

    var downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "finance-grid-" + new Date().toISOString().split("T")[0] + ".png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

  } catch (err) {
    console.error("export failed:", err);
    alert("Export failed: " + err.message);
  }

  btn.innerHTML = originalHtml;
  btn.disabled = false;
}
