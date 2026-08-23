// Value at Risk y Expected Shortfall de un portafolio: histórico, paramétrico, Monte
// Carlo (Cholesky + Box-Muller), y backtesting de exceptions.

const VaR = (() => {
  // --- Normal estándar (mismo patrón que blackscholes.js de Black-Scholes Lab) ---

  function erf(x) {
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const t = 1 / (1 + p * x);
    const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }

  function normCdf(x) {
    return 0.5 * (1 + erf(x / Math.SQRT2));
  }

  function normPdf(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  }

  // Cuantil normal inverso por bisección sobre normCdf — robusto, sin necesitar una
  // aproximación racional aparte.
  function invNormCdf(p) {
    if (p <= 0) return -8;
    if (p >= 1) return 8;
    let lo = -8, hi = 8;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (normCdf(mid) < p) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  // --- Descomposición de Cholesky (Sigma = L * L^T), matriz simétrica definida positiva ---

  function cholesky(cov) {
    const n = cov.length;
    const L = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        let sum = 0;
        for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
        if (i === j) {
          L[i][j] = Math.sqrt(Math.max(cov[i][i] - sum, 0));
        } else {
          L[i][j] = L[j][j] === 0 ? 0 : (cov[i][j] - sum) / L[j][j];
        }
      }
    }
    return L;
  }

  // Box-Muller: par de normales estándar independientes a partir de 2 uniformes.
  function boxMuller() {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random();
    u2 = Math.random();
    const mag = Math.sqrt(-2 * Math.log(u1));
    return [mag * Math.cos(2 * Math.PI * u2), mag * Math.sin(2 * Math.PI * u2)];
  }

  function standardNormalVector(n) {
    const z = new Array(n);
    for (let i = 0; i < n; i += 2) {
      const [a, b] = boxMuller();
      z[i] = a;
      if (i + 1 < n) z[i + 1] = b;
    }
    return z;
  }

  // Simula nSim vectores de retornos correlacionados ~ N(meanVec, cov) vía Cholesky.
  function simulateMultivariateNormal(meanVec, cov, nSim) {
    const L = cholesky(cov);
    const n = meanVec.length;
    const sims = new Array(nSim);
    for (let s = 0; s < nSim; s++) {
      const z = standardNormalVector(n);
      const x = new Array(n);
      for (let i = 0; i < n; i++) {
        let sum = meanVec[i];
        for (let k = 0; k <= i; k++) sum += L[i][k] * z[k];
        x[i] = sum;
      }
      sims[s] = x;
    }
    return sims;
  }

  // --- VaR / ES ---

  // Percentil empírico (interpolación lineal) de un arreglo ya ordenado ascendente.
  function percentile(sortedArr, p) {
    const idx = p * (sortedArr.length - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return sortedArr[lo];
    return sortedArr[lo] + (sortedArr[hi] - sortedArr[lo]) * (idx - lo);
  }

  // VaR histórico: percentil (1-confidence) de los retornos reales, expresado como
  // pérdida positiva.
  function historicalVaR(returns, confidence) {
    const sorted = [...returns].sort((a, b) => a - b);
    return -percentile(sorted, 1 - confidence);
  }

  function historicalES(returns, confidence) {
    const sorted = [...returns].sort((a, b) => a - b);
    const cutoffIdx = Math.max(1, Math.round((1 - confidence) * sorted.length));
    const tail = sorted.slice(0, cutoffIdx);
    const avg = tail.reduce((a, b) => a + b, 0) / tail.length;
    return -avg;
  }

  // VaR paramétrico (varianza-covarianza, normal): VaR = -(mean + z_alpha * vol)
  function parametricVaR(mean, vol, confidence) {
    const z = invNormCdf(1 - confidence);
    return -(mean + z * vol);
  }

  // Expected Shortfall paramétrico (fórmula cerrada, normal): ES = -mean + vol*phi(z)/alpha
  function parametricES(mean, vol, confidence) {
    const alpha = 1 - confidence;
    const z = invNormCdf(alpha);
    return -mean + (vol * normPdf(z)) / alpha;
  }

  // VaR/ES Monte Carlo: simula escenarios multivariados correlacionados y aplica el
  // mismo percentil empírico sobre los retornos de portafolio simulados.
  function monteCarloVaR(assetMeanVec, assetCov, weights, confidence, nSim = 5000) {
    const sims = simulateMultivariateNormal(assetMeanVec, assetCov, nSim);
    const portfolioReturns = sims.map((x) => x.reduce((sum, xi, i) => sum + xi * weights[i], 0));
    return {
      varEstimate: historicalVaR(portfolioReturns, confidence),
      esEstimate: historicalES(portfolioReturns, confidence),
      simulatedReturns: portfolioReturns,
    };
  }

  // Backtesting simplificado (no es el test de Kupiec formal): cuenta cuántos días la
  // pérdida real superó el VaR estimado, compara contra el número esperado, y da un
  // semáforo aproximado por razón actual/esperado.
  function backtest(returns, varEstimate, confidence) {
    const threshold = -varEstimate;
    const exceptions = returns.filter((r) => r < threshold).length;
    const expected = (1 - confidence) * returns.length;
    const ratio = expected > 0 ? exceptions / expected : 0;
    let zone;
    if (ratio <= 1.5) zone = "green";
    else if (ratio <= 2.5) zone = "yellow";
    else zone = "red";
    return { exceptions, expected, ratio, zone, n: returns.length };
  }

  return {
    erf, normCdf, normPdf, invNormCdf, cholesky, simulateMultivariateNormal,
    percentile, historicalVaR, historicalES, parametricVaR, parametricES,
    monteCarloVaR, backtest,
  };
})();
