// Diccionario ES/EN + helpers. Mismo patrón que el resto de la serie.

const I18N = (() => {
  const STORAGE_KEY = "varrisklab-locale";

  const dict = {
    "nav.intro": { es: "Intro", en: "Intro" },
    "nav.paso1": { es: "1. Portafolio", en: "1. Portfolio" },
    "nav.paso2": { es: "2. Retornos", en: "2. Returns" },
    "nav.paso3": { es: "3. VaR Histórico", en: "3. Historical VaR" },
    "nav.paso4": { es: "4. VaR Paramétrico", en: "4. Parametric VaR" },
    "nav.paso5": { es: "5. Monte Carlo", en: "5. Monte Carlo" },
    "nav.paso6": { es: "6. Comparación", en: "6. Comparison" },
    "nav.paso7": { es: "7. Backtesting", en: "7. Backtesting" },
    "nav.limites": { es: "Límites", en: "Limits" },
    "nav.creador": { es: "Creador", en: "Creator" },

    "hero.eyebrow": { es: "Proyecto educativo · Value at Risk", en: "Educational project · Value at Risk" },
    "hero.h1": { es: "VaR Dashboard: cuánto se puede perder, paso a paso", en: "VaR Dashboard: how much you could lose, step by step" },
    "hero.lead": {
      es: `El Value at Risk responde una pregunta muy concreta: <strong>con X% de
        confianza, ¿cuánto podría perder este portafolio en N días?</strong> No es una
        cifra mágica — es una estimación que depende del método usado, y este sitio
        calcula las 3 formas estándar de estimarla (histórica, paramétrica, Monte Carlo)
        sobre un portafolio real, con datos reales, y las pone a competir contra lo que
        de verdad pasó.`,
      en: `Value at Risk answers a very concrete question: <strong>with X% confidence,
        how much could this portfolio lose over N days?</strong> It's not a magic number —
        it's an estimate that depends on the method used, and this site computes the 3
        standard ways to estimate it (historical, parametric, Monte Carlo) on a real
        portfolio, with real data, and puts them up against what actually happened.`,
    },

    "controls.confidenceLabel": { es: "Nivel de confianza", en: "Confidence level" },
    "controls.horizonLabel": { es: "Horizonte (días)", en: "Horizon (days)" },
    "controls.yearsLabel": { es: "Años de histórico", en: "Years of history" },
    "controls.recalcBtn": { es: "Recalcular", en: "Recalculate" },
    "controls.loadingDefault": { es: "Cargando ejemplo por defecto…", en: "Loading default example…" },
    "controls.hint": {
      es: "Todos los campos de esta página alimentan el mismo cálculo — cambia cualquiera y presiona \"Recalcular\" arriba.",
      en: "Every field on this page feeds the same calculation — change any of them and press \"Recalculate\" above.",
    },

    "paso1.badge": { es: "PASO 1", en: "STEP 1" },
    "paso1.title": { es: "El portafolio", en: "The portfolio" },
    "paso1.p": {
      es: `El VaR es una propiedad del <strong>portafolio completo</strong>, no de cada
        activo por separado — la correlación entre activos importa tanto como su
        volatilidad individual. Arma tu portafolio con tickers reales y sus pesos (se
        normalizan automáticamente para sumar 100%).`,
      en: `VaR is a property of the <strong>whole portfolio</strong>, not each asset on
        its own — correlation between assets matters as much as each one's individual
        volatility. Build your portfolio with real tickers and their weights (they're
        automatically normalized to sum to 100%).`,
    },
    "paso1.tickerHeader": { es: "Ticker", en: "Ticker" },
    "paso1.weightHeader": { es: "Peso (%)", en: "Weight (%)" },
    "paso1.addRow": { es: "+ Agregar activo", en: "+ Add asset" },
    "paso1.normalizedNote": {
      es: "Pesos normalizados a 100%: {list}",
      en: "Weights normalized to 100%: {list}",
    },

    "paso2.badge": { es: "PASO 2", en: "STEP 2" },
    "paso2.title": { es: "Retornos del portafolio combinado", en: "Combined portfolio returns" },
    "paso2.p": {
      es: `Con los pesos ya definidos, cada retorno diario del portafolio es el promedio
        ponderado de los retornos de cada activo ese día. El histograma de abajo muestra
        esa distribución real — todo lo que sigue intenta resumirla en un solo número.`,
      en: `With the weights defined, each daily portfolio return is the weighted average
        of each asset's return that day. The histogram below shows that real
        distribution — everything that follows tries to summarize it into a single
        number.`,
    },
    "paso2.dailyMeanLabel": { es: "Retorno diario promedio", en: "Average daily return" },
    "paso2.dailyVolLabel": { es: "Volatilidad diaria", en: "Daily volatility" },
    "paso2.annualVolLabel": { es: "Volatilidad anualizada", en: "Annualized volatility" },

    "paso3.badge": { es: "PASO 3", en: "STEP 3" },
    "paso3.title": { es: "VaR Histórico", en: "Historical VaR" },
    "paso3.p": {
      es: `El método más simple y menos sujeto a supuestos: ordenar todos los retornos
        históricos reales y tomar el percentil correspondiente al nivel de confianza
        elegido. No asume ninguna distribución — pero solo es tan bueno como la historia
        de la que se toma, y no anticipa nada que no haya pasado ya.`,
      en: `The simplest method, and the one with the fewest assumptions: sort all the
        real historical returns and take the percentile matching the chosen confidence
        level. It assumes no distribution — but it's only as good as the history it's
        drawn from, and it doesn't anticipate anything that hasn't already happened.`,
    },

    "paso4.badge": { es: "PASO 4", en: "STEP 4" },
    "paso4.title": { es: "VaR Paramétrico (varianza-covarianza)", en: "Parametric VaR (variance-covariance)" },
    "paso4.p": {
      es: `Asume que los retornos del portafolio siguen una <strong>distribución
        normal</strong> — con eso, el VaR se calcula directo de la media y la desviación
        estándar, sin necesitar toda la historia punto por punto. Es rápido y suave, pero
        subestima el riesgo real cuando los retornos tienen colas más gordas de lo normal
        (ver Límites).`,
      en: `Assumes portfolio returns follow a <strong>normal distribution</strong> —
        with that, VaR is computed directly from the mean and standard deviation, without
        needing the full point-by-point history. It's fast and smooth, but underestimates
        real risk when returns have fatter tails than normal (see Limits).`,
    },
    "paso4.formula": {
      es: "$$ VaR_\\alpha = -(\\mu_p + z_\\alpha \\, \\sigma_p) $$",
      en: "$$ VaR_\\alpha = -(\\mu_p + z_\\alpha \\, \\sigma_p) $$",
    },

    "paso5.badge": { es: "PASO 5", en: "STEP 5" },
    "paso5.title": { es: "VaR Monte Carlo y Expected Shortfall", en: "Monte Carlo VaR and Expected Shortfall" },
    "paso5.p": {
      es: `En vez de asumir una fórmula cerrada, se simulan miles de escenarios
        sintéticos correlacionados (descomposición de Cholesky de la matriz de
        covarianza + números aleatorios normales) y se mide el percentil sobre esas
        simulaciones — el mismo espíritu del paramétrico, pero sin necesitar una fórmula
        exacta, útil cuando el portafolio tiene productos no lineales (ver
        <a href="https://black-scholes-lab.vercel.app" target="_blank" rel="noopener">Black-Scholes Lab</a>
        para opciones). De paso se calcula el <strong>Expected Shortfall</strong> (o CVaR):
        el promedio de las pérdidas más allá del VaR — cuánto se pierde, en promedio,
        en el peor {tailPct} de los casos.`,
      en: `Instead of assuming a closed-form formula, thousands of synthetic correlated
        scenarios are simulated (Cholesky decomposition of the covariance matrix + normal
        random numbers) and the percentile is measured over those simulations — same
        spirit as the parametric method, but without needing an exact formula, useful
        when the portfolio has non-linear products (see
        <a href="https://black-scholes-lab.vercel.app" target="_blank" rel="noopener">Black-Scholes Lab</a>
        for options). Along the way, the <strong>Expected Shortfall</strong> (or CVaR) is
        computed: the average loss beyond the VaR — how much is lost, on average, in the
        worst {tailPct} of cases.`,
    },

    "paso6.badge": { es: "PASO 6", en: "STEP 6" },
    "paso6.title": { es: "Los 3 métodos, comparados", en: "All 3 methods, compared" },
    "paso6.p": {
      es: `Cuando los 3 métodos coinciden, hay más confianza en la estimación. Cuando
        difieren bastante, suele ser porque los retornos reales se alejan de la
        normalidad (asimetría, colas gordas) — el paramétrico y el Monte Carlo (que aquí
        también asume normalidad) tienden a subestimar el riesgo frente al histórico en
        esos casos.`,
      en: `When all 3 methods agree, there's more confidence in the estimate. When they
        differ a lot, it's usually because real returns deviate from normality (skew, fat
        tails) — the parametric and Monte Carlo methods (which here also assume
        normality) tend to underestimate risk versus the historical one in those cases.`,
    },

    "paso7.badge": { es: "PASO 7", en: "STEP 7" },
    "paso7.title": { es: "Backtesting", en: "Backtesting" },
    "paso7.p": {
      es: `La prueba de fuego de cualquier VaR: ¿cuántas veces la pérdida real superó lo
        que el modelo decía que pasaría solo el {tailPct} de las veces? Si pasa muchas más
        veces de las esperadas, el modelo subestima el riesgo — la idea detrás del
        semáforo de Basel para bancos (esta es una versión simplificada, no la tabla
        oficial de Basel a 99%/250 días).`,
      en: `The acid test for any VaR: how many times did the real loss exceed what the
        model said should only happen {tailPct} of the time? If it happens much more
        often than expected, the model is underestimating risk — the idea behind the
        Basel traffic-light system for banks (this is a simplified version, not the
        official Basel 99%/250-day table).`,
    },
    "paso7.exceptionsLabel": { es: "Excepciones reales", en: "Actual exceptions" },
    "paso7.expectedLabel": { es: "Excepciones esperadas", en: "Expected exceptions" },
    "paso7.zoneLabel": { es: "Semáforo", en: "Traffic light" },
    "paso7.zoneGreen": { es: "Verde — el modelo es consistente con lo que pasó", en: "Green — the model is consistent with what happened" },
    "paso7.zoneYellow": { es: "Amarillo — más excepciones de las esperadas, revisar el modelo", en: "Yellow — more exceptions than expected, review the model" },
    "paso7.zoneRed": { es: "Rojo — muchas más excepciones de las esperadas, el modelo subestima el riesgo", en: "Red — far more exceptions than expected, the model underestimates risk" },

    "limits.badge": { es: "LÍMITES", en: "LIMITS" },
    "limits.title": { es: "Limitaciones y para seguir leyendo", en: "Limitations and further reading" },
    "limits.callout": {
      es: `Este sitio es material educativo, no asesoría financiera. El VaR tiene
        límites conocidos y ampliamente discutidos: los retornos reales rara vez son
        normales (tienen <strong>colas más gordas</strong> — eventos extremos son más
        frecuentes de lo que la normal predice, y más asimétricos), las
        <strong>correlaciones entre activos suben en crisis</strong> (justo cuando más
        importaría que se mantuvieran bajas, la diversificación falla), y el VaR
        <strong>no dice nada sobre qué tan mala puede ser la pérdida más allá del
        umbral</strong> — dos portafolios pueden tener el mismo VaR con colas de pérdida
        radicalmente distintas (por eso el Expected Shortfall del Paso 5 es un
        complemento importante, y por eso Basel III migró su marco regulatorio hacia
        Expected Shortfall). El VaR histórico, además, solo "sabe" lo que ya pasó en la
        ventana de datos usada.`,
      en: `This site is educational material, not financial advice. VaR has known,
        widely discussed limitations: real returns are rarely normal (they have
        <strong>fatter tails</strong> — extreme events are more frequent than normal
        predicts, and more skewed), <strong>correlations between assets rise in
        crises</strong> (exactly when it would matter most for them to stay low,
        diversification fails), and VaR <strong>says nothing about how bad the loss can
        get beyond the threshold</strong> — two portfolios can have the same VaR with
        radically different loss tails (which is why the Expected Shortfall from Step 5
        is an important complement, and why Basel III moved its regulatory framework
        toward Expected Shortfall). Historical VaR, additionally, only "knows" what has
        already happened in the data window used.`,
    },
    "limits.reading": {
      es: `Para profundizar: Philippe Jorion, <em>"Value at Risk: The New Benchmark for
        Managing Financial Risk"</em>, el texto de referencia estándar; los criterios de
        Basel III sobre Expected Shortfall;
        <a href="https://markowitz-portfolio-lab.vercel.app" target="_blank" rel="noopener">Markowitz Portfolio Lab</a>
        (de donde sale la matriz de covarianza que usa este sitio); y el resto de la
        serie de sitios sobre finanzas cuantitativas (ver Creador, abajo).`,
      en: `To go deeper: Philippe Jorion, <em>"Value at Risk: The New Benchmark for
        Managing Financial Risk"</em>, the standard reference text; the Basel III
        criteria on Expected Shortfall;
        <a href="https://markowitz-portfolio-lab.vercel.app" target="_blank" rel="noopener">Markowitz Portfolio Lab</a>
        (where this site's covariance matrix comes from); and the rest of the
        quantitative finance series (see Creator, below).`,
    },

    "creator.badge": { es: "CREADOR", en: "CREATOR" },
    "creator.title": { es: "Sobre el creador", en: "About the creator" },
    "creator.text": { es: "Hecho por Andrés Londoño.", en: "Made by Andrés Londoño." },

    "footer.text": {
      es: "VaR Dashboard — proyecto educativo independiente, cuarto de una serie de sitios sobre finanzas cuantitativas (ver Creador para los demás). Datos: Yahoo Finance. Cómputo: 100% en el navegador (JavaScript).",
      en: "VaR Dashboard — an independent educational project, fourth in a series of quantitative finance sites (see Creator for the rest). Data: Yahoo Finance. Computation: 100% in the browser (JavaScript).",
    },

    // --- Generado por JS ---
    "app.computing": { es: "Calculando…", en: "Computing…" },
    "app.fetching": { es: "Trayendo precios de {tickers}…", en: "Fetching prices for {tickers}…" },
    "app.notEnoughValid": { es: "No se pudieron obtener datos suficientes. ", en: "Could not get enough data. " },
    "app.tooFewDates": { es: "Muy pocas fechas en común entre los activos elegidos.", en: "Too few common dates between the chosen assets." },
    "app.needOneAsset": { es: "Agrega al menos 1 activo con ticker y peso.", en: "Add at least 1 asset with a ticker and weight." },
    "app.ready": { es: "Listo.", en: "Ready." },
    "app.unexpectedError": { es: "Error inesperado.", en: "Unexpected error." },
    "app.removeRow": { es: "Quitar", en: "Remove" },
    "app.statHistVar": { es: "VaR Histórico", en: "Historical VaR" },
    "app.statHistEs": { es: "ES Histórico", en: "Historical ES" },
    "app.statParamVar": { es: "VaR Paramétrico", en: "Parametric VaR" },
    "app.statParamEs": { es: "ES Paramétrico", en: "Parametric ES" },
    "app.statMcVar": { es: "VaR Monte Carlo", en: "Monte Carlo VaR" },
    "app.statMcEs": { es: "ES Monte Carlo", en: "Monte Carlo ES" },

    // --- Gráficas (plots.js) ---
    "charts.dailyReturnAxis": { es: "Retorno diario del portafolio", en: "Daily portfolio return" },
    "charts.frequencyAxis": { es: "Frecuencia", en: "Frequency" },
    "charts.lossAxis": { es: "Pérdida", en: "Loss" },
    "charts.dateAxis": { es: "Fecha", en: "Date" },
    "charts.returnAxis": { es: "Retorno", en: "Return" },
    "charts.exceptionLabel": { es: "Excepción (superó el VaR)", en: "Exception (breached VaR)" },
  };

  let locale = (localStorage.getItem(STORAGE_KEY) === "en") ? "en" : "es";

  function t(key, vars) {
    const entry = dict[key];
    let str = entry ? entry[locale] || entry.es : key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.replaceAll(`{${k}}`, vars[k]);
      });
    }
    return str;
  }

  function getLocale() {
    return locale;
  }

  function setLocale(newLocale) {
    locale = newLocale === "en" ? "en" : "es";
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    applyStaticTranslations();
  }

  function applyStaticTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.innerHTML = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });
  }

  return { t, getLocale, setLocale, applyStaticTranslations };
})();
