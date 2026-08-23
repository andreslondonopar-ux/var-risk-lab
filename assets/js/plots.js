// Helpers de Plotly.js — mismo sistema de diseño que el resto de la serie.

const Plots = (() => {
  const COLORS = {
    bg: "#0f1420",
    paper: "#0f1420",
    grid: "#232b3d",
    text: "#c9d1e0",
    accent: "#fb923c",
    accent2: "#f6ad55",
    accent3: "#f56565",
    muted: "#5a6478",
  };

  const CONFIG = {
    scrollZoom: true,
    displayModeBar: true,
    doubleClick: "reset+autosize",
    responsive: true,
    displaylogo: false,
  };

  function baseLayout(title, extra = {}) {
    return {
      title: title ? { text: title, font: { color: COLORS.text, size: 15 } } : undefined,
      paper_bgcolor: COLORS.paper,
      plot_bgcolor: COLORS.bg,
      font: { color: COLORS.text, family: "Inter, system-ui, sans-serif" },
      margin: { t: title ? 40 : 20, r: 20, b: 45, l: 55 },
      dragmode: "pan",
      hovermode: "x unified",
      xaxis: { gridcolor: COLORS.grid, zerolinecolor: COLORS.grid, ...(extra.xaxis || {}) },
      yaxis: { gridcolor: COLORS.grid, zerolinecolor: COLORS.grid, ...(extra.yaxis || {}) },
      legend: { font: { color: COLORS.text }, bgcolor: "rgba(0,0,0,0)" },
      ...extra,
    };
  }

  // Histograma de retornos diarios del portafolio, con líneas verticales marcando
  // -VaR y -ES (el umbral de pérdida, no de retorno).
  function renderReturnsHistogram(el, returns, varEstimate, esEstimate, xLabel, yLabel) {
    const trace = {
      x: returns,
      type: "histogram",
      nbinsx: 60,
      marker: { color: COLORS.muted },
      opacity: 0.85,
      hovertemplate: "%{y}<extra></extra>",
    };
    const layout = baseLayout(null, {
      hovermode: "closest",
      shapes: [
        { type: "line", x0: -varEstimate, x1: -varEstimate, y0: 0, y1: 1, yref: "paper", line: { color: COLORS.accent, width: 2, dash: "dash" } },
        { type: "line", x0: -esEstimate, x1: -esEstimate, y0: 0, y1: 1, yref: "paper", line: { color: COLORS.accent3, width: 2, dash: "dot" } },
      ],
      annotations: [
        { x: -varEstimate, y: 1, yref: "paper", text: "VaR", showarrow: false, yshift: 10, font: { color: COLORS.accent, size: 11 } },
        { x: -esEstimate, y: 1, yref: "paper", text: "ES", showarrow: false, yshift: 10, font: { color: COLORS.accent3, size: 11 } },
      ],
      xaxis: { title: xLabel, gridcolor: COLORS.grid, tickformat: ".1%" },
      yaxis: { title: yLabel, gridcolor: COLORS.grid },
    });
    Plotly.newPlot(el, [trace], layout, CONFIG);
  }

  // Comparación de VaR (y ES) entre los 3 métodos — barra horizontal simple, misma
  // magnitud, mismo tono.
  function renderMethodComparison(el, labels, varValues, esValues, varLabel, esLabel) {
    const traceVar = {
      y: labels, x: varValues, type: "bar", orientation: "h", name: varLabel,
      marker: { color: COLORS.accent },
      text: varValues.map((v) => (v * 100).toFixed(2) + "%"), textposition: "outside",
      textfont: { color: COLORS.text, size: 12 },
    };
    const traceEs = {
      y: labels, x: esValues, type: "bar", orientation: "h", name: esLabel,
      marker: { color: COLORS.accent3 },
      text: esValues.map((v) => (v * 100).toFixed(2) + "%"), textposition: "outside",
      textfont: { color: COLORS.text, size: 12 },
    };
    const layout = baseLayout(null, {
      dragmode: false,
      hovermode: "closest",
      barmode: "group",
      margin: { t: 20, r: 60, b: 45, l: 130 },
      xaxis: { title: I18N.t("charts.lossAxis"), gridcolor: COLORS.grid, tickformat: ".1%" },
      yaxis: { gridcolor: "transparent" },
    });
    Plotly.newPlot(el, [traceVar, traceEs], layout, { ...CONFIG, scrollZoom: false });
  }

  // Serie de tiempo de retornos con la línea de -VaR y las excepciones (días donde la
  // pérdida real superó el VaR) resaltadas.
  function renderBacktestChart(el, dates, returns, varEstimate, xLabel, yLabel, exceptionLabel) {
    const threshold = -varEstimate;
    const exceptionsX = [], exceptionsY = [];
    dates.forEach((d, i) => {
      if (returns[i] < threshold) {
        exceptionsX.push(d);
        exceptionsY.push(returns[i]);
      }
    });
    const traces = [
      {
        x: dates, y: returns, type: "scatter", mode: "lines", name: yLabel,
        line: { color: COLORS.muted, width: 1 }, hovertemplate: "%{y:.2%}<extra></extra>",
      },
      {
        x: exceptionsX, y: exceptionsY, type: "scatter", mode: "markers", name: exceptionLabel,
        marker: { color: COLORS.accent3, size: 7 }, hovertemplate: "%{y:.2%}<extra></extra>",
      },
    ];
    const layout = baseLayout(null, {
      shapes: [{ type: "line", x0: dates[0], x1: dates[dates.length - 1], y0: threshold, y1: threshold, line: { color: COLORS.accent, width: 1.5, dash: "dash" } }],
      xaxis: { title: xLabel, gridcolor: COLORS.grid },
      yaxis: { title: yLabel, gridcolor: COLORS.grid, tickformat: ".1%" },
    });
    Plotly.newPlot(el, traces, layout, CONFIG);
  }

  return { COLORS, CONFIG, baseLayout, renderReturnsHistogram, renderMethodComparison, renderBacktestChart };
})();
