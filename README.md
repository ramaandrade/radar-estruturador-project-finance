# 🏗️ Passo 6 — Radar do Estruturador: Financiamento de Projetos (Project Finance)

> 📱 **Formato:** App Web Mobile (*Single-Page Scroller*) Mobile-First & Fast Page  
> 🧭 **Posição na Trilha:** Passo 6 de 6 (Encerramento da jornada sobre grandes captações de capital)  
> 🏛️ **Público-Alvo:** Estudantes de Finanças Corporativas, Engenharia Financeira, Administração e Mercado de Capitais  
> 🎨 **Identidade Visual:** Verde Institucional (`#064E3B` / `#059669` / `#10B981`), alto contraste (WCAG AAA) e blocos alternados  
> ⚡ **Performance & UX:** FCP < 400ms, Rodapé 100% limpo (zero botões fixos), Conclusão Silenciosa via sensor de rolagem (> 3s), DNS Prefetching e PWA Offline  

---

## 🎯 1. Visão Geral e Alinhamento com o PRD

Este projeto implementa integralmente os requisitos do **Documento de Requisitos de Produto (PRD)** para o encerramento da jornada de captações de capital com o tema de **Project Finance**.

O objetivo pedagógico é transportar o estudante da visão tradicional de empréstimos corporativos para a **engenharia financeira complexa** por trás da construção de rodovias, usinas de energia, ferrovias e saneamento básico, desmistificando como projetos bilionários saem do papel **sem quebrar as empresas que os patrocinam**, demonstrando que **o contrato é a verdadeira garantia**.

---

## 📱 2. Especificações de UI/UX Atendidas

* **Layout *Fast Page*:** Estrutura *single-page* de rolagem contínua, desenhada para ser consumida em menos de 2 minutos. Foco absoluto no texto, com uso de negrito e acentos esmeralda para destacar os jargões essenciais.
* **Cards Expansíveis (Acordeões):** Conteúdo segmentado em blocos que o aluno pode abrir com um toque ergonômico (mínimo de 48px de área de toque touch), organizando o mapa mental do tema.
* **Interface Sem Bloqueios (Atenção Estrita à Restrição):** Atendendo expressamente à restrição do PRD, **esta página NÃO possui o botão verde fixo "Estou Pronto: Iniciar Avaliação"**. A interface é **100% limpa no rodapé**. Não há barras inferiores flutuantes, popups, nem modais bloqueando a tela.
* **Passagem Fluida para a Avaliação:** A transição ocorre por meio de um discreto link de texto ao final do último parágrafo: *"Concluir leitura e avançar"*, garantindo foco absoluto e leitura ininterrupta.

---

## 📚 3. Conteúdo Curado: O "Aulão" de Project Finance

### 🏛️ Card A: O Mindset (A Engenharia e o Isolamento)
1. **O Projeto é o Rei (*Non-Recourse*):** Em *Project Finance*, a dívida é paga exclusivamente pelo caixa gerado pelo próprio projeto (os pedágios de uma rodovia, a energia vendida de uma usina). Se o projeto fracassar, os credores ficam com o projeto, mas **não podem (em regra) tomar os bens das empresas patrocinadoras (*Sponsors*)**.
2. **A Blindagem da SPE:** Criação de um CNPJ virgem de **Sociedade de Propósito Específico (SPE)** exclusivamente para construir e operar o empreendimento. Impede contaminação patrimonial recíproca entre a matriz e o megaprojeto.
3. **O Jogo do Risco (A Matriz):** Alocação contratual cirúrgica de riscos para quem tem melhor capacidade de gerenciar cada etapa:
   * **Risco de Construção e Atraso:** Transferido à empreiteira via **Contrato EPC (*Engineering, Procurement & Construction*) *Turnkey***;
   * **Risco de Demanda e Comercialização:** Transferido ao comprador de longo prazo via **Contrato PPA (*Power Purchase Agreement*)** ou Concessão Pública;
   * **Risco de Operação e Manutenção:** Coberto por **Contrato O&M** com operador qualificado;
   * O banco só libera os recursos se a **Matriz de Riscos** estiver 100% amarrada contratualmente.

### ⚙️ Card B: A Mecânica Prática (Ações do Estruturador)
1. **A Mágica da Alavancagem:** Projetos de infraestrutura são caros demais para capital próprio. O arranjo comum estrutura **70% a 80% de Dívida** (bancos/debêntures) e apenas **20% a 30% de *Equity*** (dinheiro dos sócios). A alta alavancagem potencializa a TIR do acionista investindo o mínimo possível. *(Inclui simulador interativo de capital).*
2. **O Indicador de Ouro (DSCR):** Esqueça o EBITDA. Os credores olham fanaticamente para o **DSCR (*Debt Service Coverage Ratio* — Índice de Cobertura do Serviço da Dívida = CFADS / Serviço da Dívida)**. Se for 1.0x, não sobra margem para erro. Os bancos exigem "gordura" (mínimo de 1.25x a 1.35x). *(Inclui termômetro interativo do DSCR com feedback em tempo real).*
3. **Debêntures de Infraestrutura:** O BNDES não atua mais sozinho. A grande revolução atual é a captação maciça no mercado de capitais emitindo **Debêntures Incentivadas (Lei 12.431/11)** e **Debêntures de Infraestrutura (Lei 14.801/24)**, isentas de IR para pessoas físicas. O investidor comum financia usinas e saneamento direto na Bolsa.

### 🌐 Card C: Toolkit da Internet (Radar de Infraestrutura)
Apresentados como links externos rápidos, estilizados e confortáveis:
* **Portal do PPI (Programa de Parcerias de Investimentos):** O site oficial do Governo Federal onde estão listados todos os leilões, privatizações e concessões que vão precisar de *Project Finance* no Brasil.
* **BNDES (Canal do Desenvolvedor):** Hub obrigatório para entender a Taxa de Longo Prazo (TLP), linhas de crédito e critérios socioambientais/ESG para liberação de financiamento.
* **ABDIB (Associação Brasileira da Infraestrutura):** O radar dos grandes *players*. Relatórios macroeconômicos, estudos sobre gargalos regulatórios e volumes de investimento projetados por setor.

---

## ⚡ 4. Requisitos Técnicos ("Fast Page")

### ⏱️ Métrica de Conclusão Silenciosa (Card C > 3 segundos)
* Implementado em `js/analytics.js` via `IntersectionObserver`.
* Assim que o sensor detecta que o último cartão (**Card C**) permaneceu visível no *viewport* por **mais de 3 segundos consecutivos**, o sistema dispara silenciosamente o registro de conclusão para o *back-end* (`navigator.sendBeacon` e `localStorage`), liberando o avanço sem interromper o aluno.
* O link discreto *"Concluir leitura e avançar"* atualiza sutilmente seu estado para indicar validação, sem modais ou pop-ups na tela.

### 🚀 Lazy Loading & DNS Prefetching
Tags no `<head>` realizam pré-resolução de DNS e pré-conexão dos domínios externos do Toolkit:
```html
<link rel="dns-prefetch" href="https://www.ppi.gov.br">
<link rel="preconnect" href="https://www.ppi.gov.br" crossorigin>
<link rel="dns-prefetch" href="https://www.bndes.gov.br">
<link rel="preconnect" href="https://www.bndes.gov.br" crossorigin>
<link rel="dns-prefetch" href="https://www.abdib.org.br">
<link rel="preconnect" href="https://www.abdib.org.br" crossorigin>
```
Ao aproximar o dedo ou o mouse dos botões, o app dispara *prefetching* preventivo da rota para abertura quase instantânea.

### 📊 Painel de Telemetria do Docente
No canto superior direito, o pequeno botão de telemetria abre uma gaveta (*drawer*) lateral discreta e não-bloqueante:
* Profundidade máxima de scroll (25%, 50%, 75%, 100%);
* Tempo ativo vs. inativo da sessão;
* Status do sensor silencioso (aguardando vs. validado);
* Botão para **Copiar Relatório JSON para o LMS** (Canvas, Google Classroom, Moodle).

---

## 💻 5. Como Executar Localmente

```bash
# 1. Navegue até o diretório do projeto:
cd C:\Users\ramal\.gemini\antigravity\scratch\radar-estruturador-project-finance

# 2. Inicie o servidor local:
python serve.py
```

Abra no navegador:  
👉 **http://localhost:8088/index.html**
