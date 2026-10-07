/**
 * analytics.js - Passo 6: Radar do Estruturador (Project Finance)
 * Implementa:
 * 1. Métrica de Conclusão Silenciosa (IntersectionObserver: Card C visível > 3s)
 * 2. Micro-tracking de tempo de leitura ativo e profundidade de scroll
 * 3. Envio em background (Beacon API / LocalStorage / LMS Integration)
 * 4. Zero modais bloqueantes ou popups invasivos (Leitura 100% contínua)
 */

(function () {
  'use strict';

  // Chaves de armazenamento
  const STORAGE_KEY_STATUS = 'project_finance_status';
  const STORAGE_KEY_TIMESTAMP = 'project_finance_completed_at';
  const STORAGE_KEY_SESSION_DATA = 'project_finance_session_data';

  // Estado interno da telemetria
  const state = {
    sessionStartTime: Date.now(),
    activeTimeMs: 0,
    lastActiveCheck: Date.now(),
    isUserActive: true,
    maxScrollDepth: 0,
    cardCVisibleStart: null,
    cardCVisibleTimer: null,
    cardCTargetDurationMs: 3000, // 3 segundos requeridos pelo PRD
    silentCompletionAchieved: false,
    completionTimestamp: null,
    events: [],
    visitedSections: new Set()
  };

  // Recupera status anterior, se houver
  try {
    const savedStatus = localStorage.getItem(STORAGE_KEY_STATUS);
    if (savedStatus === 'completed') {
      state.silentCompletionAchieved = true;
      state.completionTimestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
    }
  } catch (e) {
    console.warn('[Analytics] LocalStorage indisponível:', e);
  }

  /**
   * Registra eventos de telemetria
   */
  function logEvent(type, detail = {}) {
    const eventObj = {
      type,
      detail,
      activeSeconds: Math.floor(state.activeTimeMs / 1000),
      totalSeconds: Math.floor((Date.now() - state.sessionStartTime) / 1000),
      timestamp: new Date().toLocaleTimeString('pt-BR')
    };
    state.events.push(eventObj);

    // Dispara evento customizado para UI caso necessário
    window.dispatchEvent(new CustomEvent('project-finance-telemetry', { detail: eventObj }));
  }

  /**
   * Monitoramento de atividade do usuário (evita contar tempo em abas em segundo plano)
   */
  function initActivityTracking() {
    let activityTimeout;
    const resetActivity = () => {
      state.isUserActive = true;
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        state.isUserActive = false;
      }, 45000); // 45s de inatividade
    };

    ['scroll', 'touchstart', 'touchmove', 'click', 'mousemove', 'keydown'].forEach(evt => {
      window.addEventListener(evt, resetActivity, { passive: true });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        state.isUserActive = false;
      } else {
        resetActivity();
        state.lastActiveCheck = Date.now();
      }
    });

    setInterval(() => {
      const now = Date.now();
      if (state.isUserActive && !document.hidden) {
        state.activeTimeMs += (now - state.lastActiveCheck);
      }
      state.lastActiveCheck = now;
      updateHeaderTelemetry();
    }, 1000);
  }

  /**
   * Atualiza indicadores discretos no topo
   */
  function updateHeaderTelemetry() {
    const badge = document.getElementById('telemetry-scroll-badge');
    if (badge) {
      badge.textContent = `${state.maxScrollDepth}%`;
    }

    const timeBadge = document.getElementById('telemetry-time-badge');
    if (timeBadge) {
      const seconds = Math.floor(state.activeTimeMs / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timeBadge.textContent = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    }
  }

  /**
   * Sensor de Scroll Depth (Profundidade de Leitura)
   */
  function initScrollDepthTracking() {
    const scrollContainer = document.getElementById('phone-scrollable-area') || window;

    function handleScroll() {
      let scrollY, scrollHeight, clientHeight;

      if (scrollContainer === window) {
        scrollY = window.scrollY || window.pageYOffset;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      } else {
        scrollY = scrollContainer.scrollTop;
        scrollHeight = scrollContainer.scrollHeight;
        clientHeight = scrollContainer.clientHeight;
      }

      const totalScrollable = scrollHeight - clientHeight;
      if (totalScrollable <= 0) return;

      const currentDepth = Math.min(100, Math.round((scrollY / totalScrollable) * 100));

      if (currentDepth > state.maxScrollDepth) {
        state.maxScrollDepth = currentDepth;

        // Registra marcos de leitura (25%, 50%, 75%, 100%)
        [25, 50, 75, 100].forEach(milestone => {
          if (state.maxScrollDepth >= milestone && !state.visitedSections.has(`scroll_${milestone}`)) {
            state.visitedSections.add(`scroll_${milestone}`);
            logEvent('scroll_milestone', { milestone: `${milestone}%` });
          }
        });
      }
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /**
   * REQUISITO PRD: Métrica de Conclusão Silenciosa (Card C visível > 3 segundos)
   * Utiliza IntersectionObserver na seção do Card C e dispara telemetria de conclusão no back-end
   */
  function initSilentCompletionSensor() {
    const cardC = document.getElementById('card-c-toolkit');
    const finalSection = document.getElementById('final-reading-section');

    if (!cardC) {
      console.warn('[Analytics] Elemento card-c-toolkit não encontrado para o sensor silencioso.');
      return;
    }

    // Configura observer com limiar de visibilidade confortável
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          // Card C entrou na tela! Inicia contador contínuo de 3 segundos se ainda não completou
          if (!state.silentCompletionAchieved && !state.cardCVisibleTimer) {
            state.cardCVisibleStart = Date.now();
            logEvent('card_c_entered_viewport', { ratio: Math.round(entry.intersectionRatio * 100) });

            state.cardCVisibleTimer = setTimeout(() => {
              triggerSilentCompletion();
            }, state.cardCTargetDurationMs);
          }
        } else {
          // Se o usuário rolou para fora antes de 3 segundos, cancela o timer
          if (state.cardCVisibleTimer && !state.silentCompletionAchieved) {
            clearTimeout(state.cardCVisibleTimer);
            state.cardCVisibleTimer = null;
            logEvent('card_c_exited_early', {
              durationHeldMs: Date.now() - state.cardCVisibleStart
            });
          }
        }
      });
    }, {
      threshold: [0.25, 0.5, 0.75]
    });

    observer.observe(cardC);
    if (finalSection) {
      observer.observe(finalSection);
    }
  }

  /**
   * Conclusão silenciosa alcançada: envia telemetria e atualiza estado sem interromper a navegação
   */
  function triggerSilentCompletion() {
    if (state.silentCompletionAchieved) return;

    state.silentCompletionAchieved = true;
    state.completionTimestamp = new Date().toISOString();

    logEvent('silent_completion_achieved', {
      criteria: 'Card C visível por mais de 3 segundos',
      activeSeconds: Math.floor(state.activeTimeMs / 1000),
      timestamp: state.completionTimestamp
    });

    // Salva no LocalStorage
    try {
      localStorage.setItem(STORAGE_KEY_STATUS, 'completed');
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, state.completionTimestamp);
    } catch (e) {
      // Ignora falhas de quota ou storage privado
    }

    // Disparo em background para o back-end (sem travar a interface)
    sendTelemetryPayload({
      event: 'module_completion',
      module: 'passo-6-project-finance',
      status: 'completed',
      completionMethod: 'silent_scroll_sensor_3s',
      activeTimeSeconds: Math.floor(state.activeTimeMs / 1000),
      maxScrollDepth: state.maxScrollDepth,
      timestamp: state.completionTimestamp
    });

    // Atualiza sutilmente a UI (estiliza o link discreto "Concluir leitura e avançar")
    updateAdvanceLinkState(true);
  }

  /**
   * Envia payload via Beacon ou Fetch em segundo plano
   */
  function sendTelemetryPayload(data) {
    const payload = JSON.stringify(data);
    const endpoint = '/api/telemetry/project-finance';

    // Tenta navigator.sendBeacon primeiro (ideal para telemetria não bloqueante)
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
      } catch (e) {
        // Fallback para fetch se sendBeacon falhar
        sendFetchFallback(endpoint, payload);
      }
    } else {
      sendFetchFallback(endpoint, payload);
    }
  }

  function sendFetchFallback(endpoint, payload) {
    try {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {
        // Falha silenciosa normal em ambientes estáticos/locais
      });
    } catch (e) {
      // Ignora
    }
  }

  /**
   * Atualiza o estado visual do link discreto ao final do último parágrafo
   */
  function updateAdvanceLinkState(isCompleted) {
    const advanceLink = document.getElementById('advance-reading-link');
    const advanceStatus = document.getElementById('advance-reading-status');

    if (advanceLink) {
      if (isCompleted) {
        advanceLink.classList.add('is-ready');
        advanceLink.setAttribute('data-status', 'ready');
        advanceLink.setAttribute('title', 'Leitura concluída com sucesso. Clique para avançar.');
      }
    }

    if (advanceStatus) {
      if (isCompleted) {
        advanceStatus.innerHTML = `
          <span class="status-verified-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Leitura validada silenciosamente • Pronto para avançar
          </span>
        `;
      }
    }
  }

  /**
   * Manipulador do link discreto de avanço
   */
  function setupAdvanceLink() {
    const advanceLink = document.getElementById('advance-reading-link');
    if (!advanceLink) return;

    advanceLink.addEventListener('click', (e) => {
      e.preventDefault();

      logEvent('advance_link_clicked', {
        wasCompleted: state.silentCompletionAchieved,
        activeSeconds: Math.floor(state.activeTimeMs / 1000)
      });

      // Se ainda não tinha completado os 3s, valida agora
      if (!state.silentCompletionAchieved) {
        triggerSilentCompletion();
      }

      // Mostra feedback sutil e não intrusivo (sem modais ou popups)
      const feedbackContainer = document.getElementById('advance-reading-feedback');
      if (feedbackContainer) {
        feedbackContainer.classList.remove('hidden');
        feedbackContainer.classList.add('visible');
        feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  /**
   * API Pública do Módulo de Telemetria
   */
  window.ProjectFinanceAnalytics = {
    getState: () => ({ ...state }),
    isCompleted: () => state.silentCompletionAchieved,
    logEvent,
    triggerCompletion: triggerSilentCompletion,
    getExportJSON: () => JSON.stringify({
      aluno: 'Aluno Autenticado (Sessão LMS)',
      disciplina: 'Mercado de Capitais & Finanças Corporativas',
      recurso: 'Passo 6: Radar do Estruturador - Project Finance',
      conclusaoSilenciosa: state.silentCompletionAchieved,
      timestampConclusao: state.completionTimestamp,
      tempoLeituraAtivoSegundos: Math.floor(state.activeTimeMs / 1000),
      profundidadeScrollMaximo: `${state.maxScrollDepth}%`,
      eventosTotais: state.events.length,
      historicoEventos: state.events
    }, null, 2)
  };

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initActivityTracking();
      initScrollDepthTracking();
      initSilentCompletionSensor();
      setupAdvanceLink();
      if (state.silentCompletionAchieved) {
        updateAdvanceLinkState(true);
      }
    });
  } else {
    initActivityTracking();
    initScrollDepthTracking();
    initSilentCompletionSensor();
    setupAdvanceLink();
    if (state.silentCompletionAchieved) {
      updateAdvanceLinkState(true);
    }
  }

})();
