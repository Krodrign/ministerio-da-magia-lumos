document.addEventListener("DOMContentLoaded", () => {
  const crimes = window.PENAL_CRIMES || [];
  const selectedCrimes = [];
  const selectedMitigating = [];

  const mitigatingOptions = [
    {
      id: "reu-primario",
      nome: "Réu Primário",
      descricao:
        "Primeira infração registrada nos arquivos oficiais do Ministério da Magia.",
      reducao: 30,
    },
    {
      id: "colaboracao-investigacao",
      nome: "Colaboração com a Investigação",
      descricao:
        "Cooperação ativa com Aurores ou contribuição relevante para esclarecimento dos fatos.",
      reducao: 20,
    },
    {
      id: "confissao-espontanea",
      nome: "Confissão Espontânea",
      descricao:
        "Admissão voluntária da infração antes da prisão formal ou do início do julgamento.",
      reducao: 15,
    },
  ];

  const levelSelect = document.querySelector("#crimeLevel");
  const crimeSelect = document.querySelector("#crimeSelect");
  const addButton = document.querySelector("#addCrimeButton");
  const mitigatingOptionsList = document.querySelector("#mitigatingOptionsList");
  const summaryInfo = document.querySelector("#crimeSummaryInfo");
  const summaryList = document.querySelector("#crimeSummaryList");
  const mitigatingSummaryList = document.querySelector("#mitigatingSummaryList");
  const reductionDetails = document.querySelector("#reductionDetails");
  const basePenalty = document.querySelector("#basePenalty");
  const baseFine = document.querySelector("#baseFine");
  const reductionApplied = document.querySelector("#reductionApplied");
  const reductionLimit = document.querySelector("#reductionLimit");
  const totalPenalty = document.querySelector("#totalPenalty");
  const totalFine = document.querySelector("#totalFine");
  const totalBail = document.querySelector("#totalBail");
  const totalService = document.querySelector("#totalService");
  const totalDictamos = document.querySelector("#totalDictamos");
  const calculationWarnings = document.querySelector("#calculationWarnings");
  const copyButton = document.querySelector("#copyReportButton");
  const clearButton = document.querySelector("#clearCalculationButton");
  const feedback = document.querySelector("#calculatorFeedback");
  const extraordinaryWarning = document.querySelector("#extraordinaryWarning");
  const reportRequiredInfo = document.querySelector("#reportRequiredInfo");
  const criminalNameInput = document.querySelector("#criminalName");
  const aurorReporterInput = document.querySelector("#aurorReporter");
  const reportDateInput = document.querySelector("#reportDate");
  const customCalendar = document.querySelector("#customCalendar");
  const mitigatingOptionsBox = document.querySelector(".mitigating-options");
  const customSelects = new Map();
  let calendarViewDate = new Date();

  if (
    !levelSelect ||
    !crimeSelect ||
    !addButton ||
    !mitigatingOptionsList ||
    !summaryInfo ||
    !summaryList ||
    !mitigatingSummaryList ||
    !reductionDetails ||
    !basePenalty ||
    !baseFine ||
    !reductionApplied ||
    !reductionLimit ||
    !totalPenalty ||
    !totalFine ||
    !totalBail ||
    !totalService ||
    !totalDictamos ||
    !calculationWarnings ||
    !copyButton ||
    !clearButton ||
    !feedback ||
    !extraordinaryWarning ||
    !reportRequiredInfo ||
    !criminalNameInput ||
    !aurorReporterInput ||
    !reportDateInput ||
    !customCalendar ||
    !mitigatingOptionsBox
  ) {
    return;
  }

  function formatSicles(value) {
    return `${new Intl.NumberFormat("pt-BR").format(value)} sicles`;
  }

  function formatPenalty(crime) {
    return crime.nivel === "imperdoavel" ? "Azkaban / Perpétua" : `${crime.pena} meses`;
  }

  function formatReportDate(value) {
    if (!value) return "Não informado";

    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  function toInputDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getDateFromInput() {
    if (!reportDateInput.value) return new Date();

    const [year, month, day] = reportDateInput.value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function getReportMeta() {
    return {
      offenderName: criminalNameInput.value.trim() || "Não informado",
      aurorReporter: aurorReporterInput.value.trim() || "Não informado",
      reportDate: formatReportDate(reportDateInput.value),
    };
  }

  function hasRequiredReportFields() {
    return Boolean(criminalNameInput.value.trim() && reportDateInput.value);
  }

  function syncCopyButtonState() {
    const canCopy = selectedCrimes.length > 0 && hasRequiredReportFields();
    copyButton.disabled = !canCopy;
    reportRequiredInfo.classList.toggle("is-complete", canCopy);
  }

  function showFeedback(message) {
    feedback.textContent = message;

    window.clearTimeout(showFeedback.timeout);
    showFeedback.timeout = window.setTimeout(() => {
      feedback.textContent = "";
    }, 2200);
  }

  function getCrimeId(crime) {
    return `${crime.artigo}-${crime.nome}`.toLowerCase().replace(/\s+/g, "-");
  }

  function closeCustomSelects(exceptSelect = null) {
    customSelects.forEach((customSelect, select) => {
      if (select !== exceptSelect) {
        customSelect.wrapper.classList.remove("open");
      }
    });
  }

  function renderCustomSelect(select) {
    const customSelect = customSelects.get(select);
    if (!customSelect) return;

    const selectedOption =
      select.options[select.selectedIndex] || select.querySelector("option");

    customSelect.button.textContent = selectedOption
      ? selectedOption.textContent
      : "";
    customSelect.options.innerHTML = "";

    Array.from(select.options).forEach((option) => {
      const optionButton = document.createElement("button");
      optionButton.className = "custom-select-option";
      optionButton.type = "button";
      optionButton.textContent = option.textContent;
      optionButton.disabled = option.disabled;

      if (option.value === select.value) {
        optionButton.classList.add("is-selected");
      }

      optionButton.addEventListener("click", () => {
        if (option.disabled) return;

        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        customSelect.wrapper.classList.remove("open");
        renderCustomSelect(select);
      });

      customSelect.options.appendChild(optionButton);
    });
  }

  function refreshCustomSelect(select) {
    renderCustomSelect(select);
  }

  function enhanceSelect(select) {
    const wrapper = document.createElement("div");
    const button = document.createElement("button");
    const options = document.createElement("div");

    wrapper.className = "custom-select";
    button.className = "custom-select-button";
    button.type = "button";
    options.className = "custom-select-options";

    select.classList.add("native-select-hidden");
    select.insertAdjacentElement("afterend", wrapper);
    wrapper.append(button, options);

    customSelects.set(select, { wrapper, button, options });

    button.addEventListener("click", () => {
      const isOpen = wrapper.classList.contains("open");
      closeCustomSelects(select);
      wrapper.classList.toggle("open", !isOpen);
    });

    renderCustomSelect(select);
  }

  function renderCalendar() {
    const selectedDate = getDateFromInput();
    const today = new Date();
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    customCalendar.innerHTML = `
      <button class="calendar-button" type="button">${formatReportDate(reportDateInput.value)}</button>
      <div class="calendar-panel">
        <div class="calendar-header">
          <button class="calendar-nav" type="button" data-calendar-prev>‹</button>
          <div class="calendar-title-group">
            <strong class="calendar-title">${monthNames[month]}</strong>
            <select class="calendar-year" data-calendar-year>
              ${Array.from({ length: 21 }, (_, index) => year - 10 + index)
                .map(
                  (yearOption) =>
                    `<option value="${yearOption}" ${yearOption === year ? "selected" : ""}>${yearOption}</option>`,
                )
                .join("")}
            </select>
          </div>
          <button class="calendar-nav" type="button" data-calendar-next>›</button>
        </div>
        <div class="calendar-weekdays">
          ${weekdays.map((weekday) => `<span>${weekday}</span>`).join("")}
        </div>
        <div class="calendar-days"></div>
      </div>
    `;

    const daysContainer = customCalendar.querySelector(".calendar-days");

    for (let index = 0; index < 42; index += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);

      const button = document.createElement("button");
      button.className = "calendar-day";
      button.type = "button";
      button.textContent = date.getDate();
      button.dataset.date = toInputDate(date);

      if (date.getMonth() !== month) {
        button.classList.add("is-muted");
      }

      if (toInputDate(date) === toInputDate(today)) {
        button.classList.add("is-today");
      }

      if (toInputDate(date) === toInputDate(selectedDate)) {
        button.classList.add("is-selected");
      }

      daysContainer.appendChild(button);
    }
  }

  function setupCalendar() {
    calendarViewDate = getDateFromInput();
    renderCalendar();

    customCalendar.addEventListener("click", (event) => {
      event.stopPropagation();

      const toggleButton = event.target.closest(".calendar-button");
      const previousButton = event.target.closest("[data-calendar-prev]");
      const nextButton = event.target.closest("[data-calendar-next]");
      const dayButton = event.target.closest(".calendar-day");

      if (toggleButton) {
        customCalendar.classList.toggle("open");
        closeCustomSelects();
        return;
      }

      if (previousButton) {
        calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
        renderCalendar();
        customCalendar.classList.add("open");
        return;
      }

      if (nextButton) {
        calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
        renderCalendar();
        customCalendar.classList.add("open");
        return;
      }

      if (dayButton) {
        reportDateInput.value = dayButton.dataset.date;
        calendarViewDate = getDateFromInput();
        reportDateInput.dispatchEvent(new Event("input", { bubbles: true }));
        renderCalendar();
        customCalendar.classList.remove("open");
      }
    });

    customCalendar.addEventListener("change", (event) => {
      const yearSelect = event.target.closest("[data-calendar-year]");
      if (!yearSelect) return;

      calendarViewDate.setFullYear(Number(yearSelect.value));
      renderCalendar();
      customCalendar.classList.add("open");
    });
  }

  function loadCrimesByLevel() {
    const level = levelSelect.value;
    const crimesByLevel = crimes.filter((crime) => crime.nivel === level);

    crimeSelect.innerHTML =
      '<option value="" disabled selected>Selecione uma infração</option>';

    crimesByLevel.forEach((crime) => {
      const option = document.createElement("option");
      option.value = getCrimeId(crime);
      option.textContent = `${crime.artigo} — ${crime.nome}`;
      crimeSelect.appendChild(option);
    });

    refreshCustomSelect(crimeSelect);
  }

  function renderMitigatingOptions() {
    mitigatingOptionsList.innerHTML = "";

    mitigatingOptions.forEach((mitigating) => {
      const label = document.createElement("label");
      label.className = "mitigating-option";
      label.innerHTML = `
        <input type="checkbox" value="${mitigating.id}" />
        <div>
          <strong>${mitigating.nome}</strong>
          <span>Redução: -${mitigating.reducao}%</span>
          <p>${mitigating.descricao}</p>
        </div>
      `;

      mitigatingOptionsList.appendChild(label);
    });
  }

  function getSelectedCrime() {
    return crimes.find((crime) => getCrimeId(crime) === crimeSelect.value);
  }

  function addCrime() {
    const crime = getSelectedCrime();

    if (!levelSelect.value || !crime) {
      return;
    }

    const alreadyAdded = selectedCrimes.some(
      (selectedCrime) => getCrimeId(selectedCrime) === getCrimeId(crime),
    );

    if (alreadyAdded) {
      showFeedback("Infração já adicionada.");
      return;
    }

    selectedCrimes.push(crime);
    crimeSelect.value = "";
    refreshCustomSelect(crimeSelect);
    showFeedback("");
    renderCrimeList();
  }

  function clearCalculation() {
    selectedCrimes.splice(0, selectedCrimes.length);
    selectedMitigating.splice(0, selectedMitigating.length);
    levelSelect.value = "";
    crimeSelect.innerHTML =
      '<option value="" disabled selected>Selecione uma infração</option>';
    refreshCustomSelect(levelSelect);
    refreshCustomSelect(crimeSelect);
    mitigatingOptionsList
      .querySelectorAll('input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = false;
        checkbox.disabled = false;
      });
    renderMitigatingList();
    renderCrimeList();
    showFeedback("Cálculo limpo.");
  }

  function removeCrime(crimeId) {
    const crimeIndex = selectedCrimes.findIndex(
      (crime) => getCrimeId(crime) === crimeId,
    );

    if (crimeIndex >= 0) {
      selectedCrimes.splice(crimeIndex, 1);
      renderCrimeList();
    }
  }

  function addMitigating(mitigatingId) {
    const totals = calculateTotals();
    syncMitigatingAvailability(totals);
    if (totals.hasUnforgivable) {
      const checkbox = mitigatingOptionsList.querySelector(
        `input[value="${mitigatingId}"]`,
      );
      if (checkbox) {
        checkbox.checked = false;
      }
      return;
    }

    const mitigating = mitigatingOptions.find((option) => option.id === mitigatingId);

    if (!mitigating) {
      return;
    }

    const alreadyAdded = selectedMitigating.some(
      (selectedOption) => selectedOption.id === mitigating.id,
    );

    if (alreadyAdded) {
      return;
    }

    selectedMitigating.push(mitigating);
    renderMitigatingList();
    renderCrimeList();
  }

  function removeMitigating(mitigatingId) {
    const mitigatingIndex = selectedMitigating.findIndex(
      (mitigating) => mitigating.id === mitigatingId,
    );

    if (mitigatingIndex >= 0) {
      selectedMitigating.splice(mitigatingIndex, 1);
      const checkbox = mitigatingOptionsList.querySelector(
        `input[value="${mitigatingId}"]`,
      );
      if (checkbox) {
        checkbox.checked = false;
      }
      renderMitigatingList();
      renderCrimeList();
    }
  }

  const COMMON_PENALTY_LIMIT = 60;
  const COMMON_FINE_LIMIT = 30000;
  const DICTAMOS_PER_10_MONTHS_EXCESS = 100;
  const BAIL_MULTIPLIER = 1.5;
  const BAIL_DISQUALIFY_PATTERNS = [
    /viol[eê]ncia/i,
    /amea[cç]a/i,
    /magia proibida/i,
    /arma trouxa/i,
    /risco.*v[eê]u/i,
    /v[eê]u/i,
    /sequestro/i,
    /inva[oõ]o institucional/i,
  ];

  function calculatePenalty() {
    const hasUnforgivable = selectedCrimes.some(
      (crime) => crime.nivel === "imperdoavel",
    );

    const baseMonths = selectedCrimes.reduce((total, crime) => {
      if (crime.nivel === "imperdoavel") return total;
      return total + crime.pena;
    }, 0);

    const reductionPercent = hasUnforgivable
      ? 0
      : selectedMitigating.reduce(
          (total, mitigating) => total + mitigating.reducao,
          0,
        );
    const cappedReductionPercent = Math.min(reductionPercent, 50);
    const reductionFactor = (100 - cappedReductionPercent) / 100;

    const reducedMonths = Math.ceil(baseMonths * reductionFactor);
    const exceededMonths = Math.max(0, reducedMonths - COMMON_PENALTY_LIMIT);
    const finalMonths = hasUnforgivable
      ? null
      : Math.min(reducedMonths, COMMON_PENALTY_LIMIT);

    return {
      hasUnforgivable,
      baseMonths,
      reductionPercent,
      reductionPercentApplied: cappedReductionPercent,
      reductionExceeded: reductionPercent > cappedReductionPercent,
      reducedMonths,
      finalMonths,
      exceededMonths,
      penaltyWarning: exceededMonths > 0
        ? `A pena excede o limite comum de ${COMMON_PENALTY_LIMIT} meses.`
        : "",
    };
  }

  function calculateFine(penaltyTotals) {
    const baseFine = selectedCrimes.reduce(
      (total, crime) => total + crime.multa,
      0,
    );
    const reductionPercent = penaltyTotals.hasUnforgivable
      ? 0
      : selectedMitigating.reduce(
          (total, mitigating) => total + mitigating.reducao,
          0,
        );
    const cappedReductionPercent = Math.min(reductionPercent, 50);
    const reductionFactor = (100 - cappedReductionPercent) / 100;

    const reducedFine = Math.ceil(baseFine * reductionFactor);
    const exceededFine = Math.max(0, reducedFine - COMMON_FINE_LIMIT);
    const finalFine = Math.min(reducedFine, COMMON_FINE_LIMIT);

    return {
      baseFine,
      reductionPercent,
      reductionPercentApplied: cappedReductionPercent,
      reductionExceeded: reductionPercent > cappedReductionPercent,
      reducedFine,
      finalFine,
      exceededFine,
      fineWarning: exceededFine > 0
        ? `A multa ultrapassa o limite comum de ${formatSicles(COMMON_FINE_LIMIT)}.`
        : "",
    };
  }

  function calculateCommunityService(penaltyTotals) {
    if (penaltyTotals.hasUnforgivable || penaltyTotals.exceededMonths === 0) {
      return {
        dictamos: 0,
        description: penaltyTotals.hasUnforgivable
          ? "Medida extraordinária"
          : "Sem conversão",
      };
    }

    const dictamos = Math.ceil(
      penaltyTotals.exceededMonths / 10,
    ) * DICTAMOS_PER_10_MONTHS_EXCESS;

    return {
      dictamos,
      description: `Excedente convertido em ${dictamos} dictamos.`,
    };
  }

  function hasBailDisqualification(crime) {
    const text = `${crime.nome} ${crime.descricao}`;
    return BAIL_DISQUALIFY_PATTERNS.some((pattern) => pattern.test(text));
  }

  function calculateBail(fineTotals, penaltyTotals) {
    const hasCommonOrModerate = selectedCrimes.some(
      (crime) => crime.nivel === "leve" || crime.nivel === "moderada",
    );
    const hasImperdoavel = penaltyTotals.hasUnforgivable;
    const disqualifyingGrave = selectedCrimes.some(
      (crime) => crime.nivel === "grave" && hasBailDisqualification(crime),
    );

    if (hasImperdoavel || !hasCommonOrModerate) {
      return {
        allowed: false,
        amount: 0,
        reason: hasImperdoavel
          ? "Fiança não disponível para infrações imperdoáveis."
          : "Fiança automática só está disponível para infrações leves e moderadas.",
      };
    }

    if (disqualifyingGrave) {
      return {
        allowed: false,
        amount: 0,
        reason:
          "Fiança bloqueada por crime grave com agravantes como violência, ameaça ou uso de magia proibida.",
      };
    }

    return {
      allowed: true,
      amount: Math.ceil(fineTotals.finalFine * BAIL_MULTIPLIER),
      reason: `Fiança fixada em 150% da multa final (${BAIL_MULTIPLIER}x).`,
    };
  }

  function calculateTotals() {
    const penaltyTotals = calculatePenalty();
    const fineTotals = calculateFine(penaltyTotals);
    const serviceTotals = calculateCommunityService(penaltyTotals);
    const bailTotals = calculateBail(fineTotals, penaltyTotals);

    return {
      ...penaltyTotals,
      ...fineTotals,
      serviceTotals,
      bailTotals,
    };
  }

  function syncMitigatingAvailability(totals) {
    const isDisabled = totals.hasUnforgivable;
    const mitigatingInfo = mitigatingOptionsBox.querySelector(
      ".mitigating-options-header p",
    );

    mitigatingOptionsBox.classList.toggle("is-disabled", isDisabled);

    mitigatingOptionsList
      .querySelectorAll('input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.disabled = isDisabled;
        if (isDisabled) {
          checkbox.checked = false;
        }
      });

    if (isDisabled && selectedMitigating.length > 0) {
      selectedMitigating.splice(0, selectedMitigating.length);
      renderMitigatingList();
    }

    if (mitigatingInfo) {
      mitigatingInfo.textContent = isDisabled
        ? "Atenuantes não se aplicam a crimes imperdoáveis."
        : "Selecione uma ou mais condições aplicáveis ao caso.";
    }
  }

  function renderCrimeList() {
    summaryList.innerHTML = "";

    const totals = calculateTotals();
    syncMitigatingAvailability(totals);
    reductionDetails.classList.toggle(
      "is-visible",
      selectedMitigating.length > 0 && !totals.hasUnforgivable,
    );
    extraordinaryWarning.classList.toggle(
      "is-visible",
      selectedCrimes.length > 0 && totals.hasUnforgivable,
    );

    if (selectedCrimes.length === 0) {
      summaryInfo.textContent = "Nenhuma infração selecionada.";
      basePenalty.textContent = "0 meses";
      baseFine.textContent = "0 sicles";
      reductionApplied.textContent = "0%";
      reductionLimit.textContent = "Até 50%";
      totalPenalty.textContent = "0 meses";
      totalFine.textContent = "0 sicles";
      totalBail.textContent = "0 sicles";
      totalService.textContent = "Sem conversão";
      totalDictamos.textContent = "0 dictamos";
      calculationWarnings.textContent = "";
      copyButton.textContent = "Copiar Relatório";
      syncCopyButtonState();
      return;
    }

    const penaltySummary = totals.hasUnforgivable
      ? "Azkaban / Perpétua"
      : `${totals.reducedMonths} meses de pena`;
    const reductionText =
      totals.reductionPercentApplied > 0
        ? ` Redução aplicada: ${totals.reductionPercentApplied}%.`
        : "";

    summaryInfo.textContent = `${selectedCrimes.length} infração(ões), ${penaltySummary}, ${formatSicles(totals.finalFine)}.${reductionText}`;

    selectedCrimes.forEach((crime) => {
      const card = document.createElement("article");
      card.className = "summary-card";
      card.innerHTML = `
        <div class="summary-card-left">
          <span class="summary-card-article">${crime.artigo}</span>
          <strong class="summary-card-title">${crime.nome}</strong>
          <span class="summary-card-note">${crime.descricao}</span>
          <div class="summary-card-meta">
            <span>Pena: ${formatPenalty(crime)}</span>
            <span>Multa: ${formatSicles(crime.multa)}</span>
            <span>${crime.conversao}</span>
          </div>
        </div>
        <button class="summary-card-remove" type="button" data-remove-crime="${getCrimeId(crime)}">
          Remover
        </button>
      `;

      summaryList.appendChild(card);
    });

    totalPenalty.textContent = totals.hasUnforgivable
      ? "Azkaban / Perpétua"
      : `${totals.finalMonths} meses`;
    basePenalty.textContent = totals.hasUnforgivable
      ? "Azkaban / Perpétua"
      : `${totals.baseMonths} meses`;
    baseFine.textContent = formatSicles(totals.baseFine);
    reductionApplied.textContent = totals.hasUnforgivable
      ? "Não aplicável"
      : `${totals.reductionPercentApplied}%`;
    reductionLimit.textContent = totals.hasUnforgivable
      ? "Não aplicável"
      : totals.reductionExceeded
        ? `Excedeu ${totals.reductionPercent}% e foi limitada a 50%`
        : "Até 50%";
    totalFine.textContent = formatSicles(totals.finalFine);
    totalBail.textContent = totals.bailTotals.allowed
      ? formatSicles(totals.bailTotals.amount)
      : "Sem fiança";
    totalService.textContent = totals.serviceTotals.description;
    totalDictamos.textContent = totals.serviceTotals.dictamos
      ? `${totals.serviceTotals.dictamos} dictamos`
      : totals.serviceTotals.description;
    const warningMessages = [
      totals.penaltyWarning,
      totals.fineWarning,
      totals.bailTotals.allowed ? "" : totals.bailTotals.reason,
    ]
      .filter(Boolean)
      .join(" ");

    calculationWarnings.textContent = warningMessages;

    copyButton.textContent = "Copiar Relatório";
    syncCopyButtonState();
  }

  function renderMitigatingList() {
    mitigatingSummaryList.innerHTML = "";

    selectedMitigating.forEach((mitigating) => {
      const card = document.createElement("article");
      card.className = "summary-card";
      card.innerHTML = `
        <div class="summary-card-left">
          <span class="summary-card-article">Atenuante</span>
          <strong class="summary-card-title">${mitigating.nome}</strong>
          <span class="summary-card-note">${mitigating.descricao}</span>
          <div class="summary-card-meta">
            <span>Redução: -${mitigating.reducao}%</span>
          </div>
        </div>
        <button class="summary-card-remove" type="button" data-remove-mitigating="${mitigating.id}">
          Remover
        </button>
      `;

      mitigatingSummaryList.appendChild(card);
    });
  }

  function generateReport() {
    const totals = calculateTotals();
    const reportMeta = getReportMeta();
    const penaltyText = totals.hasUnforgivable
      ? "Azkaban / Perpétua"
      : `${totals.finalMonths} meses`;
    const communityServiceLabel = totals.serviceTotals.description;
    const bailLabel = totals.bailTotals.allowed
      ? formatSicles(totals.bailTotals.amount)
      : "Sem fiança";
    const infractions = selectedCrimes
      .map(
        (crime) =>
          `* ${crime.artigo} — ${crime.nome}\n  Pena: ${formatPenalty(crime)}\n  Multa: ${formatSicles(crime.multa)}`,
      )
      .join("\n\n");
    const mitigatingReport =
      selectedMitigating.length > 0
        ? selectedMitigating
            .map(
              (mitigating) =>
                `* ${mitigating.nome}\n  Redução: -${mitigating.reducao}%\n  ${mitigating.descricao}`,
            )
            .join("\n\n")
        : "Nenhuma atenuante aplicada.";

    return `MINISTÉRIO DA MAGIA
CIDADE DE LUMOS
RELATÓRIO PENAL

Infrator: ${reportMeta.offenderName}
Auror Relator: ${reportMeta.aurorReporter}
Data: ${reportMeta.reportDate}

Infrações:

${infractions}

Atenuantes:

${mitigatingReport}

Resultado:
Pena antes das atenuantes: ${totals.hasUnforgivable ? "Azkaban / Perpétua" : `${totals.baseMonths} meses`}
Multa antes das atenuantes: ${formatSicles(totals.baseFine)}
Redução solicitada: ${totals.hasUnforgivable ? "Não aplicável a crimes imperdoáveis" : `${totals.reductionPercent}%`}
Redução aplicada: ${totals.hasUnforgivable ? "Não aplicável a crimes imperdoáveis" : `${totals.reductionPercentApplied}%`}
Limite de redução: ${totals.hasUnforgivable ? "Não aplicável" : totals.reductionExceeded ? "A soma das atenuantes excede o limite legal; foi aplicada a redução máxima de 50%." : "Dentro do limite legal de 50%."}
Pena após atenuantes: ${penaltyText}
Multa após atenuantes: ${formatSicles(totals.finalFine)}
Fiança: ${bailLabel}
Serviço Comunitário: ${communityServiceLabel}
Dictamos: ${totals.serviceTotals.dictamos || 0} dictamos
Observações: ${totals.bailTotals.allowed ? "Fiança calculada com base na multa final." : totals.bailTotals.reason}
${totals.penaltyWarning || totals.fineWarning ? `Avisos: ${[totals.penaltyWarning, totals.fineWarning].filter(Boolean).join("; ")}` : "Sem avisos adicionais."}`;
  }

  function copyReport() {
    if (selectedCrimes.length === 0 || !hasRequiredReportFields()) {
      return;
    }

    const report = generateReport();
    const copyPromise = navigator.clipboard
      ? navigator.clipboard.writeText(report)
      : new Promise((resolve) => {
          const textarea = document.createElement("textarea");
          textarea.value = report;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          textarea.remove();
          resolve();
        });

    copyPromise.then(() => {
      copyButton.textContent = "Relatório Copiado";

      setTimeout(() => {
        copyButton.textContent = "Copiar Relatório";
      }, 1800);
    });
  }

  levelSelect.addEventListener("change", loadCrimesByLevel);
  addButton.addEventListener("click", addCrime);
  clearButton.addEventListener("click", clearCalculation);
  criminalNameInput.addEventListener("input", syncCopyButtonState);
  reportDateInput.addEventListener("input", syncCopyButtonState);
  copyButton.addEventListener("click", copyReport);
  mitigatingOptionsList.addEventListener("change", (event) => {
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (!checkbox) return;

    if (checkbox.checked) {
      addMitigating(checkbox.value);
    } else {
      removeMitigating(checkbox.value);
    }
  });
  summaryList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-crime]");
    if (removeButton) {
      removeCrime(removeButton.dataset.removeCrime);
    }
  });
  mitigatingSummaryList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-mitigating]");
    if (removeButton) {
      removeMitigating(removeButton.dataset.removeMitigating);
    }
  });
  document.addEventListener("click", (event) => {
    const clickedInsideCustomSelect = event.target.closest(".custom-select");
    const clickedInsideCalendar = event.target.closest(".custom-calendar");
    if (!clickedInsideCustomSelect) {
      closeCustomSelects();
    }
    if (!clickedInsideCalendar) {
      customCalendar.classList.remove("open");
    }
  });

  reportDateInput.value = new Date().toISOString().slice(0, 10);
  loadCrimesByLevel();
  enhanceSelect(levelSelect);
  enhanceSelect(crimeSelect);
  refreshCustomSelect(crimeSelect);
  setupCalendar();
  renderMitigatingOptions();
  renderCrimeList();
  renderMitigatingList();
});
