/**
 * app.js - Passo 6: Radar do Estruturador (Project Finance)
 * Interatividade pedagógica, acordeões, micro-simuladores e integração de interface.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. REGISTRO DO SERVICE WORKER (PWA & OFFLINE)
  // =========================================================================
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registrado com sucesso no escopo:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Falha ao registrar Service Worker:', err);
        });
    });
  }

  // =========================================================================
  // 2. RELÓGIO DINÂMICO & STATUS DE REDE NO CHASSIS MOBILE
  // =========================================================================
  function updatePhoneClock() {
    const clockEl = document.getElementById('phone-clock');
    if (!clockEl) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}`;
  }
  updatePhoneClock();
  setInterval(updatePhoneClock, 10000);

  function updateNetworkStatus() {
    const pill = document.getElementById('offline-status-pill');
    if (!pill) return;
    if (navigator.onLine) {
      pill.classList.remove('is-offline');
      pill.innerHTML = '<span class="status-dot"></span><span class="status-text">Online • Cache Ativo</span>';
    } else {
      pill.classList.add('is-offline');
      pill.innerHTML = '<span class="status-dot offline-dot"></span><span class="status-text">Offline • Modo Local</span>';
    }
  }
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  updateNetworkStatus();

  // =========================================================================
  // 3. ALTERNÂNCIA DE MOLDURA DE SMARTPHONE (DESKTOP)
  // =========================================================================
  const frameToggleBtn = document.getElementById('frame-toggle-btn');
  const chassisEl = document.getElementById('smartphone-chassis');
  let isChassisActive = true;

  if (frameToggleBtn && chassisEl) {
    frameToggleBtn.addEventListener('click', () => {
      isChassisActive = !isChassisActive;
      if (isChassisActive) {
        chassisEl.classList.remove('fullscreen-mode');
        frameToggleBtn.innerHTML = '🖥️ Tela Cheia';
        frameToggleBtn.setAttribute('title', 'Alternar para visualização de tela cheia');
      } else {
        chassisEl.classList.add('fullscreen-mode');
        frameToggleBtn.innerHTML = '📱 Moldura Celular';
        frameToggleBtn.setAttribute('title', 'Alternar para moldura de smartphone');
      }
    });
  }

  // =========================================================================
  // 4. CARDS EXPANSÍVEIS (ACORDEÕES ERGONÔMICOS)
  // =========================================================================
  const cards = document.querySelectorAll('.modular-card');
  const toggleAllBtn = document.getElementById('toggle-all-btn');
  let allExpanded = false;

  function updateReadingProgress() {
    const totalCards = cards.length;
    let openCards = 0;
    cards.forEach(card => {
      if (card.classList.contains('is-open')) openCards++;
    });

    const progressFill = document.getElementById('reading-progress-fill');
    const progressText = document.getElementById('reading-progress-text');

    if (progressFill && progressText) {
      const pct = Math.round((openCards / totalCards) * 100);
      progressFill.style.width = `${pct}%`;
      progressText.textContent = `${openCards}/${totalCards} explorados`;
    }
  }

  cards.forEach(card => {
    const headerBtn = card.querySelector('.card-header');
    if (!headerBtn) return;

    headerBtn.addEventListener('click', () => {
      const isOpen = card.classList.contains('is-open');
      if (isOpen) {
        card.classList.remove('is-open');
        headerBtn.setAttribute('aria-expanded', 'false');
      } else {
        card.classList.add('is-open');
        headerBtn.setAttribute('aria-expanded', 'true');
        if (window.ProjectFinanceAnalytics) {
          window.ProjectFinanceAnalytics.logEvent('card_expanded', {
            cardId: card.getAttribute('data-card-id')
          });
        }
      }
      updateReadingProgress();
    });
  });

  if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', () => {
      allExpanded = !allExpanded;
      cards.forEach(card => {
        const headerBtn = card.querySelector('.card-header');
        if (allExpanded) {
          card.classList.add('is-open');
          if (headerBtn) headerBtn.setAttribute('aria-expanded', 'true');
        } else {
          card.classList.remove('is-open');
          if (headerBtn) headerBtn.setAttribute('aria-expanded', 'false');
        }
      });
      toggleAllBtn.textContent = allExpanded ? 'Recolher todos' : 'Expandir todos';
      updateReadingProgress();
    });
  }
  updateReadingProgress();

  // =========================================================================
  // 5. INTERATIVIDADE DO CARD A: MATRIZ DE RISCOS (O JOGO DO RISCO)
  // =========================================================================
  const riskButtons = document.querySelectorAll('.risk-tab-btn');
  const riskDetailTitle = document.getElementById('risk-detail-title');
  const riskDetailBearer = document.getElementById('risk-detail-bearer');
  const riskDetailContract = document.getElementById('risk-detail-contract');
  const riskDetailExplain = document.getElementById('risk-detail-explain');

  const riskData = {
    construction: {
      title: 'Risco de Construção, Atraso e Sobrecusto (Completion Risk)',
      bearer: 'Empreiteira / Construtora (EPCista)',
      contract: 'Contrato EPC (Engineering, Procurement & Construction) Turnkey',
      explain: 'Se a obra estourar o orçamento ou atrasar 1 ano, quem paga a conta é a empreiteira por meio de garantias de performance (Performance Bonds) e penalidades contratuais. O banco credor não aceita que a dívida aumente por ineficiência da obra.'
    },
    demand: {
      title: 'Risco de Mercado, Volume e Demanda (Offtake Risk)',
      bearer: 'Comprador de Longo Prazo / Concedente Público',
      contract: 'Contrato PPA (Power Purchase Agreement) ou Contrato de Concessão',
      explain: 'Uma usina solar ou eólica só é financiada se tiver contratos prévios garantindo a compra da energia gerada por 15 a 20 anos. O risco de preço ou de não ter para quem vender é transferido para os clientes no mercado livre ou regulado.'
    },
    operation: {
      title: 'Risco de Falha Operacional e Manutenção (O&M Risk)',
      bearer: 'Operador Especializado do Ativo',
      contract: 'Contrato de Operação e Manutenção (O&M)',
      explain: 'Após a inauguração, turbinas quebram e rodovias desgastam. Um operador profissional assume métricas de disponibilidade técnica sob pena de multas, assegurando que o caixa continue fluindo ininterruptamente.'
    },
    regulatory: {
      title: 'Risco Regulatório e Ambiental (Licensing Risk)',
      bearer: 'SPE com Seguros e Cláusulas de Reequilíbrio Econômico',
      contract: 'Contrato de Concessão & Licenças Ambientais Prévias',
      explain: 'Alterações em regras tarifárias ou atrasos na emissão de licenças pelo órgão ambiental acionam cláusulas expressas de Reequilíbrio Econômico-Financeiro com o poder concedente, blindando o fluxo de caixa do projeto.'
    }
  };

  riskButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const riskKey = btn.getAttribute('data-risk');
      riskButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const data = riskData[riskKey];
      if (data && riskDetailTitle) {
        riskDetailTitle.textContent = data.title;
        if (riskDetailBearer) riskDetailBearer.textContent = data.bearer;
        if (riskDetailContract) riskDetailContract.textContent = data.contract;
        if (riskDetailExplain) riskDetailExplain.textContent = data.explain;
      }

      if (window.ProjectFinanceAnalytics) {
        window.ProjectFinanceAnalytics.logEvent('risk_matrix_explored', { riskKey });
      }
    });
  });

  // =========================================================================
  // 6. INTERATIVIDADE DO CARD B: ALAVANCAGEM & TERMÔMETRO DO DSCR
  // =========================================================================
  
  // 6.1 Simulador de Estrutura de Capital (Alavancagem 70/30 vs 80/20)
  const leverageSlider = document.getElementById('leverage-slider');
  const debtPctVal = document.getElementById('debt-pct-val');
  const equityPctVal = document.getElementById('equity-pct-val');
  const debtMoneyVal = document.getElementById('debt-money-val');
  const equityMoneyVal = document.getElementById('equity-money-val');
  const roeMultiplierVal = document.getElementById('roe-multiplier-val');

  function updateLeverageSim() {
    if (!leverageSlider) return;
    const debtPct = parseInt(leverageSlider.value, 10);
    const equityPct = 100 - debtPct;
    const totalCapex = 1000; // R$ 1.000 Milhões = R$ 1 Bilhão

    const debtAmount = (totalCapex * debtPct) / 100;
    const equityAmount = (totalCapex * equityPct) / 100;

    if (debtPctVal) debtPctVal.textContent = `${debtPct}%`;
    if (equityPctVal) equityPctVal.textContent = `${equityPct}%`;
    if (debtMoneyVal) debtMoneyVal.textContent = `R$ ${debtAmount}M`;
    if (equityMoneyVal) equityMoneyVal.textContent = `R$ ${equityAmount}M`;

    // Multiplicador de Alavancagem = Total / Equity
    const leverageFactor = (totalCapex / equityAmount).toFixed(1);
    if (roeMultiplierVal) {
      roeMultiplierVal.textContent = `${leverageFactor}x`;
    }
  }

  if (leverageSlider) {
    leverageSlider.addEventListener('input', updateLeverageSim);
    updateLeverageSim();
  }

  // 6.2 O Indicador de Ouro: Termômetro do DSCR
  const dscrSlider = document.getElementById('dscr-slider');
  const dscrNumberVal = document.getElementById('dscr-number-val');
  const dscrStatusTag = document.getElementById('dscr-status-tag');
  const dscrMeterBar = document.getElementById('dscr-meter-bar');
  const dscrExplainText = document.getElementById('dscr-explain-text');

  function updateDscrTermometer() {
    if (!dscrSlider) return;
    const val = parseFloat(dscrSlider.value);
    if (dscrNumberVal) dscrNumberVal.textContent = `${val.toFixed(2)}x`;

    // Calcula largura da barra (range 0.8x a 2.0x mapeado em 0% a 100%)
    const pct = Math.min(100, Math.max(0, ((val - 0.8) / (2.0 - 0.8)) * 100));
    if (dscrMeterBar) dscrMeterBar.style.width = `${pct}%`;

    if (!dscrStatusTag || !dscrExplainText) return;

    if (val < 1.0) {
      dscrStatusTag.className = 'status-badge-dscr danger';
      dscrStatusTag.textContent = '🚨 Déficit Crítico (< 1.0x)';
      dscrExplainText.innerHTML = '<strong>Alerta de Calote:</strong> O caixa gerado pelo projeto é insuficiente para pagar o principal e juros da dívida no ano. A SPE precisará queimar reservas ou entrará em recuperação judicial.';
    } else if (val < 1.25) {
      dscrStatusTag.className = 'status-badge-dscr warning';
      dscrStatusTag.textContent = '⚠️ Margem Estreita (1.0x - 1.24x)';
      dscrExplainText.innerHTML = '<strong>Sem Gordura:</strong> O caixa cobre a dívida na vírgula, mas qualquer oscilação na receita (ex: seca na usina hidrelétrica ou queda de tráfego) estoura os <em>covenants</em> bancários.';
    } else if (val <= 1.55) {
      dscrStatusTag.className = 'status-badge-dscr safe';
      dscrStatusTag.textContent = '✅ Grau Bancável Padrão (1.25x - 1.55x)';
      dscrExplainText.innerHTML = '<strong>Zona Ideal do Estruturador:</strong> Existe margem de segurança de 25% a 55% acima da prestação da dívida. Atende com folga os critérios do BNDES e das agências de rating para debêntures.';
    } else {
      dscrStatusTag.className = 'status-badge-dscr excellent';
      dscrStatusTag.textContent = '💎 Superávit Robusto (> 1.55x)';
      dscrExplainText.innerHTML = '<strong>Estrutura Ultra-Segura:</strong> Caixa ultra-confortável. O projeto gera fluxo excedente que pode ser distribuído como dividendos antecipados aos sócios após amortização.';
    }
  }

  if (dscrSlider) {
    dscrSlider.addEventListener('input', () => {
      updateDscrTermometer();
      if (window.ProjectFinanceAnalytics) {
        window.ProjectFinanceAnalytics.logEvent('dscr_slider_changed', { value: dscrSlider.value });
      }
    });
    updateDscrTermometer();
  }

  // =========================================================================
  // 7. PREFETCHING PROATIVO NOS LINKS EXTERNOS DO CARD C (TOOLKIT)
  // =========================================================================
  const toolkitLinks = document.querySelectorAll('.toolkit-link-btn');
  toolkitLinks.forEach(link => {
    link.addEventListener('mouseenter', () => prefetchUrl(link.href), { passive: true });
    link.addEventListener('touchstart', () => prefetchUrl(link.href), { passive: true });
    link.addEventListener('click', () => {
      if (window.ProjectFinanceAnalytics) {
        window.ProjectFinanceAnalytics.logEvent('toolkit_link_opened', {
          url: link.href,
          title: link.querySelector('.toolkit-link-title')?.textContent || 'link'
        });
      }
    });
  });

  function prefetchUrl(url) {
    if (!url || document.querySelector(`link[rel="prefetch"][href="${url}"]`)) return;
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    } catch (e) {
      // Ignora falhas de prefetch
    }
  }

  // =========================================================================
  // 8. PAINEL DE TELEMETRIA DISCRETO DO PROFESSOR (DRAWER LATERAL NÃO BLOQUEANTE)
  // =========================================================================
  const openInspectorBtn = document.getElementById('open-inspector-btn');
  const inspectorDrawer = document.getElementById('inspector-drawer');
  const closeInspectorBtn = document.getElementById('close-inspector-btn');
  const copyMetricsBtn = document.getElementById('copy-metrics-btn');

  function openInspector() {
    if (!inspectorDrawer) return;
    inspectorDrawer.classList.add('is-open');
    refreshInspectorData();
  }

  function closeInspector() {
    if (!inspectorDrawer) return;
    inspectorDrawer.classList.remove('is-open');
  }

  function refreshInspectorData() {
    if (!window.ProjectFinanceAnalytics) return;
    const state = window.ProjectFinanceAnalytics.getState();

    const maxScrollEl = document.getElementById('inspector-max-scroll');
    const sessionTimeEl = document.getElementById('inspector-session-time');
    const silentStatusEl = document.getElementById('inspector-silent-status');
    const eventsCountEl = document.getElementById('inspector-events-count');
    const eventsListEl = document.getElementById('inspector-events-list');

    if (maxScrollEl) maxScrollEl.textContent = `${state.maxScrollDepth}%`;
    if (sessionTimeEl) {
      const sec = Math.floor(state.activeTimeMs / 1000);
      sessionTimeEl.textContent = `${sec}s`;
    }
    if (silentStatusEl) {
      if (state.silentCompletionAchieved) {
        silentStatusEl.innerHTML = '<span class="status-verified-text">✅ Concluído (> 3s no Card C)</span>';
      } else {
        silentStatusEl.innerHTML = '<span class="status-pending-text">⏳ Aguardando leitura de 3s no Card C</span>';
      }
    }
    if (eventsCountEl) eventsCountEl.textContent = String(state.events.length);

    if (eventsListEl) {
      if (state.events.length === 0) {
        eventsListEl.innerHTML = '<p class="empty-events-text">Nenhum evento registrado ainda.</p>';
      } else {
        eventsListEl.innerHTML = state.events.slice(-8).reverse().map(e => `
          <div class="telemetry-log-item">
            <span class="log-time">${e.timestamp}</span>
            <strong class="log-type">${e.type}</strong>
            <span class="log-detail">${JSON.stringify(e.detail).replace(/[{"}]/g, '')}</span>
          </div>
        `).join('');
      }
    }
  }

  if (openInspectorBtn) openInspectorBtn.addEventListener('click', openInspector);
  if (closeInspectorBtn) closeInspectorBtn.addEventListener('click', closeInspector);

  if (copyMetricsBtn) {
    copyMetricsBtn.addEventListener('click', () => {
      if (!window.ProjectFinanceAnalytics) return;
      const json = window.ProjectFinanceAnalytics.getExportJSON();
      navigator.clipboard.writeText(json).then(() => {
        const originalText = copyMetricsBtn.innerHTML;
        copyMetricsBtn.innerHTML = '✅ Copiado com Sucesso!';
        setTimeout(() => {
          copyMetricsBtn.innerHTML = originalText;
        }, 2200);
      }).catch(() => {
        alert('Não foi possível copiar automaticamente para a área de transferência.');
      });
    });
  }

});
