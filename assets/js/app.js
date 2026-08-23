// Orquestación: un solo pipeline. Portafolio (tickers + pesos) -> precios en vivo ->
// matriz de covarianza (reutilizando markowitz.js) -> VaR/ES por 3 métodos ->
// comparación -> backtesting. Bilingüe desde el arranque — todo string generado acá
// pasa por I18N.t().

const TRADING_DAYS_LOCAL = 252;

const DEFAULT_PORTFOLIO = [
  { ticker: "AAPL", weight: 40 },
  { ticker: "MSFT", weight: 30 },
  { ticker: "SPY", weight: 30 },
];

(function () {
  const el = (id) => document.getElementById(id);

  const portfolioRowsEl = el("portfolio-rows");
  const addRowBtn = el("add-row-btn");
  const confidenceSelect = el("confidence-select");
  const horizonInput = el("horizon-input");
  const yearsInput = el("years-input");
  const recalcBtn = el("recalc-btn");
  const statusLineEl = el("status-line");
  const langToggleBtn = el("lang-toggle");
  const normalizedNoteEl = el("normalized-note");

  const dailyMeanEl = el("daily-mean");
  const dailyVolEl = el("daily-vol");
  const annualVolEl = el("annual-vol");

  const histVarEl = el("hist-var");
  const histEsEl = el("hist-es");
  const histogramEl = el("returns-histogram");
  const paso5TextEl = el("paso5-text");
  const paso7TextEl = el("paso7-text");

  const paramVarEl = el("param-var");
  const paramEsEl = el("param-es");

  const mcVarEl = el("mc-var");
  const mcEsEl = el("mc-es");

  const comparisonChartEl = el("comparison-chart");

  const backtestExceptionsEl = el("backtest-exceptions");
  const backtestExpectedEl = el("backtest-expected");
  const backtestZoneEl = el("backtest-zone");
  const backtestChartEl = el("backtest-chart");

  let state = null;

  function fmtPct(x, d = 2) {
    return (x * 100).toFixed(d) + "%";
  }
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
  function toISO(d) {
    return d.toISOString().slice(0, 10);
  }
  function setStatus(msg, isError = false) {
    statusLineEl.textContent = msg;
    statusLineEl.classList.toggle("error", !!isError);
  }
  function setBusy(b) {
    recalcBtn.disabled = b;
    document.body.classList.toggle("is-recalculating", b);
  }

  async function fetchPrices(tickers, years) {
    const end = new Date();
    const start = new Date(end.getFullYear() - years, end.getMonth(), end.getDate());
    const url = `/api/prices?tickers=${encodeURIComponent(tickers.join(","))}&start=${toISO(start)}&end=${toISO(end)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || I18N.t("app.unexpectedError"));
    return json;
  }

  // --- Filas de portafolio (ticker + peso) ---

  function renderPortfolioRows(rows) {
    portfolioRowsEl.innerHTML = "";
    rows.forEach((r) => {
      const div = document.createElement("div");
      div.className = "portfolio-row";
      div.innerHTML = `
        <input class="port-ticker" type="text" value="${r.ticker}" />
        <input class="port-weight" type="number" step="1" value="${r.weight}" />
        <button type="button" class="port-remove" aria-label="${I18N.t("app.removeRow")}">×</button>
      `;
      div.querySelector(".port-remove").addEventListener("click", () => {
        div.remove();
      });
      portfolioRowsEl.appendChild(div);
    });
  }

  function readPortfolioRows() {
    const rows = Array.from(portfolioRowsEl.querySelectorAll(".portfolio-row"));
    return rows
      .map((row) => ({
        ticker: row.querySelector(".port-ticker").value.trim().toUpperCase(),
        weight: parseFloat(row.querySelector(".port-weight").value) || 0,
      }))
      .filter((r) => r.ticker && r.weight > 0);
  }

  addRowBtn.addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "portfolio-row";
    div.innerHTML = `
      <input class="port-ticker" type="text" value="" placeholder="Ej. GOOGL" />
      <input class="port-weight" type="number" step="1" value="10" />
      <button type="button" class="port-remove" aria-label="${I18N.t("app.removeRow")}">×</button>
    `;
    div.querySelector(".port-remove").addEventListener("click", () => div.remove());
    portfolioRowsEl.appendChild(div);
  });

  // --- Render completo ---

  function renderFromState() {
    if (!state) return;
    const {
      tickers, weights, portfolioReturns, dailyMean, dailyVol, annualVol,
      histVar, histEs, paramVar, paramEs, mc, backtest, dates, confidence, tailPct,
    } = state;

    normalizedNoteEl.textContent = I18N.t("paso1.normalizedNote", {
      list: tickers.map((t, i) => `${t} ${(weights[i] * 100).toFixed(1)}%`).join(", "),
    });

    dailyMeanEl.textContent = fmtPct(dailyMean, 3);
    dailyVolEl.textContent = fmtPct(dailyVol, 3);
    annualVolEl.textContent = fmtPct(annualVol);

    paso5TextEl.innerHTML = I18N.t("paso5.p", { tailPct });
    paso7TextEl.innerHTML = I18N.t("paso7.p", { tailPct });

    histVarEl.textContent = fmtPct(histVar);
    histEsEl.textContent = fmtPct(histEs);
    Plots.renderReturnsHistogram(histogramEl, portfolioReturns, histVar, histEs, I18N.t("charts.dailyReturnAxis"), I18N.t("charts.frequencyAxis"));

    paramVarEl.textContent = fmtPct(paramVar);
    paramEsEl.textContent = fmtPct(paramEs);

    mcVarEl.textContent = fmtPct(mc.varEstimate);
    mcEsEl.textContent = fmtPct(mc.esEstimate);

    Plots.renderMethodComparison(
      comparisonChartEl,
      [I18N.t("app.statHistVar").replace(" VaR", "").trim(), I18N.t("app.statParamVar").replace(" VaR", "").trim(), I18N.t("app.statMcVar").replace(" VaR", "").trim()],
      [histVar, paramVar, mc.varEstimate],
      [histEs, paramEs, mc.esEstimate],
      `VaR (${(confidence * 100).toFixed(0)}%)`,
      "ES"
    );

    backtestExceptionsEl.textContent = backtest.exceptions;
    backtestExpectedEl.textContent = backtest.expected.toFixed(1);
    const zoneKey = backtest.zone === "green" ? "paso7.zoneGreen" : backtest.zone === "yellow" ? "paso7.zoneYellow" : "paso7.zoneRed";
    backtestZoneEl.textContent = I18N.t(zoneKey);
    backtestZoneEl.className = "value " + (backtest.zone === "green" ? "up" : "down");
    Plots.renderBacktestChart(backtestChartEl, dates, portfolioReturns, histVar, I18N.t("charts.dateAxis"), I18N.t("charts.returnAxis"), I18N.t("charts.exceptionLabel"));
  }

  async function runPipeline() {
    setBusy(true);

    try {
      const rows = readPortfolioRows();
      if (rows.length < 1) throw new Error(I18N.t("app.needOneAsset"));

      const totalWeight = rows.reduce((a, r) => a + r.weight, 0);
      const tickers = rows.map((r) => r.ticker);
      const weights = rows.map((r) => r.weight / totalWeight);

      setStatus(I18N.t("app.fetching", { tickers: tickers.join(", ") }));
      const years = clamp(parseInt(yearsInput.value, 10) || 3, 1, 15);
      const json = await fetchPrices(tickers, years);
      const data = json.data || {};
      const errors = json.errors || {};

      const validTickers = tickers.filter((t) => data[t]);
      if (validTickers.length !== tickers.length) {
        throw new Error(I18N.t("app.notEnoughValid") + Object.entries(errors).map(([t, e]) => `${t}: ${e}`).join(" | "));
      }

      const aligned = Markowitz.alignPrices(Object.fromEntries(tickers.map((t) => [t, data[t]])));
      if (aligned.dates.length < 60) throw new Error(I18N.t("app.tooFewDates"));

      // Reordenar pesos según el orden de `aligned.tickers` (alignPrices puede no
      // preservar el orden de inserción del objeto).
      const orderedWeights = aligned.tickers.map((t) => weights[tickers.indexOf(t)]);

      const returnsMatrix = Markowitz.logReturnsMatrix(aligned.prices);
      const annualMean = Markowitz.annualizedMean(returnsMatrix);
      const annualCov = Markowitz.annualizedCov(returnsMatrix);
      const dailyMeanVec = annualMean.map((m) => m / TRADING_DAYS_LOCAL);
      const dailyCov = annualCov.map((row) => row.map((v) => v / TRADING_DAYS_LOCAL));

      const portfolioReturns = returnsMatrix.map((row) => row.reduce((sum, r, i) => sum + r * orderedWeights[i], 0));
      const dailyMean = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length;
      let dailyVar = 0;
      for (let i = 0; i < orderedWeights.length; i++) {
        for (let j = 0; j < orderedWeights.length; j++) {
          dailyVar += orderedWeights[i] * orderedWeights[j] * dailyCov[i][j];
        }
      }
      const dailyVol = Math.sqrt(dailyVar);
      const annualVol = dailyVol * Math.sqrt(TRADING_DAYS_LOCAL);

      const confidence = parseFloat(confidenceSelect.value);
      const horizon = clamp(parseInt(horizonInput.value, 10) || 1, 1, 250);
      const horizonScale = Math.sqrt(horizon);
      const tailPct = fmtPct(1 - confidence, 0);

      const histVar1d = VaR.historicalVaR(portfolioReturns, confidence);
      const histEs1d = VaR.historicalES(portfolioReturns, confidence);
      const paramVar1d = VaR.parametricVaR(dailyMean, dailyVol, confidence);
      const paramEs1d = VaR.parametricES(dailyMean, dailyVol, confidence);
      const mc1d = VaR.monteCarloVaR(dailyMeanVec, dailyCov, orderedWeights, confidence, 5000);

      const backtest = VaR.backtest(portfolioReturns, histVar1d, confidence);

      state = {
        tickers: aligned.tickers, weights: orderedWeights, dates: aligned.dates.slice(1),
        portfolioReturns, dailyMean, dailyVol, annualVol,
        histVar: histVar1d * horizonScale, histEs: histEs1d * horizonScale,
        paramVar: paramVar1d * horizonScale, paramEs: paramEs1d * horizonScale,
        mc: { varEstimate: mc1d.varEstimate * horizonScale, esEstimate: mc1d.esEstimate * horizonScale },
        backtest, confidence, tailPct,
      };
      renderFromState();
      setStatus(I18N.t("app.ready"));
    } catch (err) {
      setStatus(err.message || I18N.t("app.unexpectedError"), true);
    } finally {
      setBusy(false);
    }
  }

  recalcBtn.addEventListener("click", runPipeline);
  [confidenceSelect, horizonInput, yearsInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runPipeline();
    });
  });

  langToggleBtn.addEventListener("click", () => {
    const next = I18N.getLocale() === "es" ? "en" : "es";
    I18N.setLocale(next);
    langToggleBtn.textContent = next === "es" ? "EN" : "ES";
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
        ],
      });
    }
    if (state) {
      renderFromState();
      setStatus(I18N.t("app.ready"));
    } else {
      setStatus(I18N.t("controls.loadingDefault"));
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    I18N.applyStaticTranslations();
    langToggleBtn.textContent = I18N.getLocale() === "es" ? "EN" : "ES";
    renderPortfolioRows(DEFAULT_PORTFOLIO);
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
        ],
      });
    }
    runPipeline();
  });
})();
