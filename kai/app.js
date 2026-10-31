/* =========================================================
   DEFAULT CATEGORIES & FINANCIAL TIPS
   ========================================================= */
const DEFAULT_CATEGORIES = {
  Housing:         { icon: '⌂', color: '#00FFB0', bucket: 'need', subs: ['Rent', 'Mortgage', 'Property Taxes', 'Maintenance'] },
  Transportation:  { icon: '◈', color: '#FFD700', bucket: 'need', subs: ['Fuel', 'Public Transit', 'Car Maintenance', 'Insurance'] },
  Food:            { icon: '◉', color: '#00BFFF', bucket: 'need', subs: ['Groceries', 'Dining Out', 'Coffee Shops'] },
  Utilities:       { icon: '⚡', color: '#38BDF8', bucket: 'need', subs: ['Electricity', 'Water', 'Internet', 'Phone Bill'] },
  'Personal Care': { icon: '✦', color: '#DA70D6', bucket: 'want', subs: ['Haircuts', 'Gym', 'Clothing'] },
  Entertainment:   { icon: '❖', color: '#A855F7', bucket: 'want', subs: ['Movies', 'Concerts', 'Hobbies'] },
  Subscriptions:   { icon: '↻', color: '#FF6F61', bucket: 'want', subs: ['Streaming Services', 'Software', 'Memberships'] },
  Financial:       { icon: '↗', color: '#00FA9A', bucket: 'save', subs: ['Savings', 'Investments', 'Debt Payments'] }
};

const ICON_PRESETS = ['⌂', '◈', '◉', '⚡', '✦', '❖', '↻', '↗', '★', '♥', '☕', '✈', '🛒', '⚕', '🐾', '🎮'];

const FINANCIAL_TIPS = [
  "Paying a credit card down below 10% utilization 3 days before the statement closing date maximizes your credit score boost.",
  "When Needs stay under 50%, sweeping the unspent buffer automatically into High-Yield Savings or Stocks compounds effortlessly.",
  "Rotating 5% cashback categories earn 2.5x more than a flat 2% card—activate your monthly PayPal Debit & quarterly categories on the 1st.",
  "Any unspent Daily Allowance automatically rolls over into tomorrow's pool, increasing your safe daily spend for the rest of the month.",
  "Avalanche debt payoff saves the most in APR interest; Snowball knocks out small balances fastest for psychological momentum."
];

const INITIAL_STATE = {
  theme: 'dark',
  skyOverride: 'auto',
  activeTab: 'dashboard',
  subPage: null,
  expandedTile: null,
  notifExpanded: false,
  dismissedNotifs: [],
  tipIndex: 0,
  streakDays: 16,
  lastLoggedDate: '2026-10-24',
  collapsedSections: {},
  expandedNotes: {},
  categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),

  allocator: {
    savingsPct: 20,
    investPct: 15,
    resetDayOfMonth: 1,
    rolloverPool: 0
  },

  acorns: {
    enabled: true,
    primaryCheckingId: 'chk_suncoast',
    multiplier: 3,
    evenDollarPull: 1.00,
    weeklyPull: 7.00,
    iraLastDayPull: 5.00,
    checkingFirstDayPull: 5.00,
    investBalance: 1480.00,
    iraBalance: 625.00,
    acornsCheckingBalance: 260.00
  },

  stocks: {
    portfolioBalance: 3200.00,
    recurringTransfers: [
      { id: 'stk_1', name: 'VOO S&P 500 ETF', amount: 100.00, dayOfMonth: 15, fromAccountId: 'chk_suncoast', autopay: true }
    ]
  },

  accounts: [
    { id: 'chk_suncoast', name: 'Suncoast Checking', type: 'Checking', initialBalance: 3420.00, apy: 0.50, acornsLinked: true },
    { id: 'chk_interest', name: 'High-APR Checking', type: 'Checking', initialBalance: 1250.00, apy: 2.50, acornsLinked: true },
    { id: 'sav_hy', name: 'High-Yield Savings', type: 'Savings', initialBalance: 7100.00, apy: 4.65, acornsLinked: false },
    { id: 'cash_hand', name: 'Cash on Hand', type: 'Cash', initialBalance: 160.00, apy: 0.00, acornsLinked: false }
  ],

  cards: [
    {
      id: 'card_paypal',
      name: 'PayPal Debit Card',
      type: 'Debit',
      linkedAccountIds: ['chk_suncoast'],
      initialBalance: 0,
      limit: 0,
      stdApr: 0,
      promoApr: null,
      promoExp: '',
      acornsLinked: true,
      notes: 'Choose 5% monthly cashback category on the 1st of every month (up to $1,000 monthly spend). No foreign fee on debit.',
      rotations: [
        { categories: ['Food'], rate: 5, durationLabel: '1 Month', expDate: '2026-10-31' }
      ]
    },
    {
      id: 'card_chase',
      name: 'Chase Freedom Flex',
      type: 'Credit',
      linkedAccountIds: ['chk_suncoast'],
      initialBalance: 1450.00,
      limit: 10000.00,
      stdApr: 20.49,
      promoApr: 0.0,
      promoExp: '2026-11-15',
      acornsLinked: true,
      notes: '5% quarterly rotating categories (up to $1,500/qtr). 3% on Dining & Drugstores year-round. 3% foreign transaction fee.',
      rotations: [
        { categories: ['Transportation', 'Entertainment'], rate: 5, durationLabel: '1 Quarter', expDate: '2026-12-31' },
        { categories: ['Food'], rate: 3, durationLabel: '1 Year', expDate: '2027-12-31' }
      ]
    },
    {
      id: 'card_apple',
      name: 'Apple Card',
      type: 'Credit',
      linkedAccountIds: ['chk_suncoast'],
      initialBalance: 1920.00,
      limit: 6000.00,
      stdApr: 22.49,
      promoApr: null,
      promoExp: '',
      acornsLinked: false,
      notes: 'Zero foreign transaction fees. 2% Daily Cash whenever using Apple Pay, 3% at select merchants.',
      rotations: [
        { categories: ['Personal Care'], rate: 3, durationLabel: '1 Year', expDate: '2027-06-30' }
      ]
    }
  ],

  budgets: {
    Housing:         { limit: 1400, rollover: 50 },
    Transportation:  { limit: 320,  rollover: 20 },
    Food:            { limit: 500,  rollover: 0 },
    Utilities:       { limit: 260,  rollover: 15 },
    'Personal Care': { limit: 150,  rollover: 10 },
    Entertainment:   { limit: 200,  rollover: 0 },
    Subscriptions:   { limit: 95,   rollover: 0 },
    Financial:       { limit: 800,  rollover: 0 }
  },

  bills: [
    { id: 'bill_1', merchant: 'Netflix', category: 'Subscriptions', amount: 22.99, dueDay: 28, sourceId: 'card_chase', autopay: true },
    { id: 'bill_2', merchant: 'Electric & Water', category: 'Utilities', amount: 142.50, dueDay: 26, sourceId: 'chk_suncoast', autopay: false },
    { id: 'bill_3', merchant: 'Gym Membership', category: 'Personal Care', amount: 34.99, dueDay: 1, sourceId: 'card_apple', autopay: true }
  ],

  transactions: [
    {
      id: 'tx_101',
      type: 'income',
      merchant: 'Direct Deposit Paycheck',
      description: 'Bi-Weekly Payroll Split',
      category: 'Financial',
      amount: 3400.00,
      date: '2026-10-16T09:00:00',
      sourceId: 'chk_suncoast',
      incomeSplits: [
        { accountId: 'chk_suncoast', amount: 2700.00 },
        { accountId: 'sav_hy', amount: 700.00 }
      ],
      archived: false
    },
    {
      id: 'tx_102',
      type: 'expense',
      merchant: 'Wawa',
      description: 'Orlando, FL • Fuel & Snacks',
      category: 'Transportation',
      amount: 42.80,
      date: '2026-10-22T14:15:00',
      sourceId: 'card_chase',
      isSplitReceipt: true,
      receiptSplits: [
        { category: 'Transportation', desc: 'Fuel', preTax: 30.00, amount: 32.10 },
        { category: 'Food', desc: 'Snacks', preTax: 10.00, amount: 10.70 }
      ],
      acornsRoundUp: 0.60,
      cashbackPct: 5,
      archived: false
    },
    {
      id: 'tx_103',
      type: 'expense',
      merchant: 'Publix Super Markets',
      description: 'Tampa, FL • Weekly Groceries',
      category: 'Food',
      amount: 94.00,
      date: '2026-10-20T17:40:00',
      sourceId: 'card_paypal',
      acornsRoundUp: 3.00,
      cashbackPct: 5,
      archived: false
    },
    {
      id: 'tx_104',
      type: 'payment',
      merchant: 'Credit Card Payment',
      description: 'Statement Paydown',
      category: 'Financial',
      amount: 100.00,
      date: '2026-10-24T14:13:00',
      sourceId: 'chk_suncoast',
      fromAccountId: 'chk_suncoast',
      toCardId: 'card_chase',
      archived: false
    },
    {
      id: 'tx_105',
      type: 'expense',
      merchant: 'Chipotle Mexican Grill',
      description: 'Tampa, FL • Burrito Bowl',
      category: 'Food',
      amount: 13.81,
      date: '2026-09-18T12:30:00',
      sourceId: 'card_apple',
      acornsRoundUp: 0,
      cashbackPct: 2,
      archived: false
    },
    {
      id: 'tx_106',
      type: 'expense',
      merchant: 'KLM Royal Dutch Airlines',
      description: 'Flight Booking',
      category: 'Transportation',
      amount: 410.00,
      date: '2025-11-14T11:15:00',
      sourceId: 'card_apple',
      acornsRoundUp: 0,
      cashbackPct: 2,
      archived: false
    }
  ],

  historyFilter: {
    search: '',
    merchant: 'ALL',
    category: 'ALL',
    sourceId: 'ALL',
    sortBy: 'date_desc',
    drillFolder: null,
    showArchived: false
  },

  debtStrategy: 'avalanche',
  extraDebtBudget: 250
};

function loadStateSafely() {
  try {
    const raw = localStorage.getItem('mintglass_pwa_state_v3');
    if (!raw) return JSON.parse(JSON.stringify(INITIAL_STATE));
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_STATE,
      ...parsed,
      categories: { ...DEFAULT_CATEGORIES, ...(parsed.categories || {}) },
      allocator: { ...INITIAL_STATE.allocator, ...(parsed.allocator || {}) },
      acorns: { ...INITIAL_STATE.acorns, ...(parsed.acorns || {}) },
      stocks: { ...INITIAL_STATE.stocks, ...(parsed.stocks || {}) },
      historyFilter: { ...INITIAL_STATE.historyFilter, ...(parsed.historyFilter || {}) }
    };
  } catch (e) {
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }
}

let state = loadStateSafely();
function persistState() {
  try {
    localStorage.setItem('mintglass_pwa_state_v3', JSON.stringify(state));
  } catch (e) {}
}

/* =========================================================
   FORMATTERS & HELPERS
   ========================================================= */
function fmtCurrency(n) {
  const val = Number(n) || 0;
  const sign = val < 0 ? '-' : '';
  return sign + '$' + Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtHumanDate(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let hrs = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, '0');
  const ampm = hrs >= 12 ? 'pm' : 'am';
  hrs = hrs % 12 || 12;
  return `${hrs}:${mins} ${ampm} ${days[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
}

function fmtAppleSlashDate(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
}

function fmtShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T12:00:00');
  const mos = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${mos[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function daysUntilDate(dateStr) {
  if (!dateStr) return 999;
  const target = new Date(dateStr + 'T23:59:59');
  const now = new Date();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function getDaysRemainingInMonth() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, lastDay - now.getDate() + 1);
}

function getCatMeta(cat) {
  return state.categories[cat] || { icon: '◈', color: '#00FFB0', bucket: 'want', subs: [] };
}

function renderCatBadge(cat) {
  const m = getCatMeta(cat);
  return `<span class="cat-chip" style="background:${m.color}22; color:${m.color}; border:1px solid ${m.color}44;">${m.icon}</span>`;
}

function calcAcornsRoundUp(amount) {
  const val = Number(amount) || 0;
  if (val <= 0) return 0;
  const cents = Math.round((val - Math.floor(val)) * 100);
  const basePull = cents === 0 ? (Number(state.acorns.evenDollarPull) || 1) : (100 - cents) / 100;
  return +(basePull * (Number(state.acorns.multiplier) || 1)).toFixed(2);
}

function detectCashbackPct(cardId, category) {
  const c = state.cards.find(x => x.id === cardId);
  if (!c) return 0;
  let best = c.type === 'Credit' ? 1 : 0;
  (c.rotations || []).forEach(r => {
    if ((r.categories || []).includes(category) && daysUntilDate(r.expDate) >= 0) {
      if (Number(r.rate) > best) best = Number(r.rate);
    }
  });
  return best;
}

/* =========================================================
   REACTIVE FINANCIAL ENGINE
   ========================================================= */
function computeFinancialPicture() {
  const activeTxs = state.transactions.filter(t => !t.archived);
  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();

  const acctBalances = {};
  state.accounts.forEach(a => { acctBalances[a.id] = Number(a.initialBalance) || 0; });

  const cardBalances = {};
  state.cards.forEach(c => { cardBalances[c.id] = Number(c.initialBalance) || 0; });

  let monthIncome = 0;
  let monthDirectExpense = 0;
  let monthCardPayments = 0;
  let monthRoundUps = 0;
  let monthStockContributions = 0;

  const catSpendMonth = {};
  Object.keys(state.categories).forEach(k => { catSpendMonth[k] = 0; });

  activeTxs.forEach(t => {
    const td = new Date(t.date);
    const isCurrentMonth = td.getMonth() === curMonth && td.getFullYear() === curYear;
    const amt = Number(t.amount) || 0;

    if (t.type === 'income') {
      if (isCurrentMonth) monthIncome += amt;
      if (t.incomeSplits && t.incomeSplits.length) {
        t.incomeSplits.forEach(s => {
          if (acctBalances[s.accountId] !== undefined) acctBalances[s.accountId] += Number(s.amount);
        });
      } else if (acctBalances[t.sourceId] !== undefined) {
        acctBalances[t.sourceId] += amt;
      }
    } else if (t.type === 'expense') {
      if (isCurrentMonth) monthDirectExpense += amt;

      if (isCurrentMonth) {
        if (t.isSplitReceipt && t.receiptSplits && t.receiptSplits.length) {
          t.receiptSplits.forEach(rs => {
            catSpendMonth[rs.category] = (catSpendMonth[rs.category] || 0) + Number(rs.amount);
          });
        } else {
          catSpendMonth[t.category] = (catSpendMonth[t.category] || 0) + amt;
        }
      }

      if (acctBalances[t.sourceId] !== undefined) {
        acctBalances[t.sourceId] -= amt;
      } else if (cardBalances[t.sourceId] !== undefined) {
        const cardObj = state.cards.find(c => c.id === t.sourceId);
        if (cardObj && cardObj.type === 'Debit') {
          const linkedId = (cardObj.linkedAccountIds && cardObj.linkedAccountIds[0]) || 'chk_suncoast';
          if (acctBalances[linkedId] !== undefined) acctBalances[linkedId] -= amt;
        } else {
          cardBalances[t.sourceId] += amt;
        }
      }

      // Dynamic Acorns Round-Up pull from Primary Checking into Acorns Invest
      const srcObj = [...state.accounts, ...state.cards].find(s => s.id === t.sourceId);
      const isAcornsLinked = srcObj ? srcObj.acornsLinked : false;
      const ru = isAcornsLinked && state.acorns.enabled ? calcAcornsRoundUp(amt) : 0;
      t.acornsRoundUp = ru;
      if (ru > 0 && state.acorns.enabled) {
        if (acctBalances[state.acorns.primaryCheckingId] !== undefined) {
          acctBalances[state.acorns.primaryCheckingId] -= ru;
        }
        if (isCurrentMonth) monthRoundUps += ru;
      }
    } else if (t.type === 'payment') {
      if (acctBalances[t.fromAccountId] !== undefined) acctBalances[t.fromAccountId] -= amt;
      if (cardBalances[t.toCardId] !== undefined) cardBalances[t.toCardId] = Math.max(0, cardBalances[t.toCardId] - amt);
      if (isCurrentMonth) monthCardPayments += amt;
    } else if (t.type === 'stock') {
      if (acctBalances[t.sourceId] !== undefined) acctBalances[t.sourceId] -= amt;
      if (isCurrentMonth) monthStockContributions += amt;
    }
  });

  // Total Cashflow Out = Direct Expenses + Card Payments + Acorns Round-Ups + Stock Contributions
  const monthTotalOutflow = monthDirectExpense + monthCardPayments + monthRoundUps + monthStockContributions;

  const acornsScheduledMonthly = state.acorns.enabled
    ? (Number(state.acorns.weeklyPull) * 4) + Number(state.acorns.iraLastDayPull) + Number(state.acorns.checkingFirstDayPull)
    : 0;

  const stocksRecurringMonthly = (state.stocks.recurringTransfers || []).reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

  const totalLiquidCash = Object.values(acctBalances).reduce((a, b) => a + b, 0);

  let totalCreditBalance = 0;
  let totalCreditLimit = 0;
  let totalMonthlyInterestRisk = 0;

  const enrichedCards = state.cards.map(c => {
    const bal = c.type === 'Credit' ? (cardBalances[c.id] || 0) : 0;
    const lim = Number(c.limit) || 0;
    const util = lim > 0 ? (bal / lim) * 100 : 0;
    const promoValid = c.promoApr !== null && c.promoApr !== '' && daysUntilDate(c.promoExp) >= 0;
    const activeApr = promoValid ? Number(c.promoApr) : Number(c.stdApr);
    const monthlyInterest = c.type === 'Credit' ? (bal * (activeApr / 100)) / 12 : 0;

    if (c.type === 'Credit') {
      totalCreditBalance += bal;
      totalCreditLimit += lim;
      totalMonthlyInterestRisk += monthlyInterest;
    }
    return { ...c, liveBalance: bal, util, activeApr, promoValid, monthlyInterest };
  });

  const overallCreditUtil = totalCreditLimit > 0 ? (totalCreditBalance / totalCreditLimit) * 100 : 0;

  // Pay-Yourself-First & Safe-to-Spend Daily Allowance (Auto-tracks calendar month days left)
  const daysLeftInCycle = getDaysRemainingInMonth();
  const saveTargetAmount = monthIncome * ((Number(state.allocator.savingsPct) || 0) / 100);
  const investTargetAmount = monthIncome * ((Number(state.allocator.investPct) || 0) / 100);
  const totalActualInvestedMonth = monthRoundUps + acornsScheduledMonthly + monthStockContributions + stocksRecurringMonthly;
  const remainingLivingBudget = Math.max(0, monthIncome + (Number(state.allocator.rolloverPool) || 0) - saveTargetAmount - investTargetAmount - monthTotalOutflow);
  const dailyAllowance = remainingLivingBudget / daysLeftInCycle;

  // Smart Notifications
  const rawNotifs = [];
  if (overallCreditUtil >= 30) {
    rawNotifs.push({
      id: 'notif_overall_30',
      level: 'danger',
      text: `⚠️ Overall Credit Usage is ${overallCreditUtil.toFixed(1)}% (over 30% guardrail). Pay down ${fmtCurrency(totalCreditBalance - totalCreditLimit * 0.29)} to drop below 30%.`
    });
  }
  enrichedCards.forEach(c => {
    if (c.type === 'Credit' && c.util >= 30) {
      rawNotifs.push({
        id: `notif_card_30_${c.id}`,
        level: 'danger',
        text: `🚨 ${c.name} is at ${c.util.toFixed(1)}% utilization (${fmtCurrency(c.liveBalance)} / ${fmtCurrency(c.limit)}). Over 30% limit!`
      });
    }
    (c.rotations || []).forEach((r, idx) => {
      const dLeft = daysUntilDate(r.expDate);
      if (dLeft <= 14 && dLeft >= -3) {
        rawNotifs.push({
          id: `notif_rot_${c.id}_${idx}`,
          level: 'warn',
          text: `🔔 ${c.name}: ${r.rate}% cashback on ${r.categories.join(', ')} expires ${fmtShortDate(r.expDate)} (${Math.max(0, dLeft)}d left). Choose your next category soon!`
        });
      }
    });
  });

  state.bills.forEach(b => {
    const diff = b.dueDay - now.getDate();
    if (diff >= 0 && diff <= 6) {
      rawNotifs.push({
        id: `notif_bill_${b.id}`,
        level: 'info',
        text: `📅 Upcoming Bill: ${b.merchant} (${fmtCurrency(b.amount)}) due on the ${b.dueDay}th • ${b.autopay ? 'Autopay ON' : 'Manual Pay required'}.`
      });
    }
  });

  const visibleNotifs = rawNotifs.filter(n => !state.dismissedNotifs.includes(n.id));

  return {
    acctBalances,
    enrichedCards,
    totalLiquidCash,
    totalCreditBalance,
    totalCreditLimit,
    overallCreditUtil,
    totalMonthlyInterestRisk,
    monthIncome,
    monthDirectExpense,
    monthCardPayments,
    monthRoundUps,
    monthStockContributions,
    monthTotalOutflow,
    catSpendMonth,
    acornsScheduledMonthly,
    stocksRecurringMonthly,
    totalActualInvestedMonth,
    saveTargetAmount,
    investTargetAmount,
    remainingLivingBudget,
    dailyAllowance,
    daysLeftInCycle,
    visibleNotifs
  };
}

/* =========================================================
   SKY GREETING LOGIC
   ========================================================= */
function computeGreetingBanner() {
  const now = new Date();
  const isBday = (now.getMonth() === 3 && now.getDate() === 26) || state.skyOverride === 'birthday';
  const hr = now.getHours();

  let skyClass = 'sky-afternoon';
  let title = 'Good afternoon, Manny';

  if (state.skyOverride === 'morning' || (state.skyOverride === 'auto' && hr >= 5 && hr < 12)) {
    skyClass = 'sky-morning';
    title = 'Good morning, Manny';
  } else if (state.skyOverride === 'afternoon' || (state.skyOverride === 'auto' && hr >= 12 && hr < 18)) {
    skyClass = 'sky-afternoon';
    title = 'Good afternoon, Manny';
  } else if (state.skyOverride === 'night' || (state.skyOverride === 'auto' && (hr >= 18 || hr < 5))) {
    skyClass = 'sky-night';
    title = 'Good evening, Manny';
  }

  if (isBday) {
    skyClass = 'sky-birthday';
    title = '🎂 Happy Birthday, Manny!';
  }

  return { skyClass, title, timeStr: fmtHumanDate(now) };
}

/* =========================================================
   MAIN RENDER CONTROLLER
   ========================================================= */
function renderApp() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const metaTheme = document.getElementById('metaThemeColor');
  if (metaTheme) metaTheme.setAttribute('content', state.theme === 'dark' ? '#1A1A1A' : '#FFFFFF');
  const tBtn = document.getElementById('themeToggleBtn');
  if (tBtn) tBtn.textContent = state.theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  const skySel = document.getElementById('skySelector');
  if (skySel) skySel.value = state.skyOverride;

  const fin = computeFinancialPicture();
  const main = document.getElementById('viewportMain');

  if (state.subPage) {
    main.innerHTML = renderSubPageView(state.subPage, fin);
  } else if (state.activeTab === 'dashboard') {
    main.innerHTML = renderDashboardView(fin);
  } else if (state.activeTab === 'cards') {
    main.innerHTML = renderCardsAndAccountsView(fin);
  } else if (state.activeTab === 'acorns') {
    main.innerHTML = renderAcornsAndStocksView(fin);
  } else if (state.activeTab === 'history') {
    main.innerHTML = renderHistoryView(fin);
  } else if (state.activeTab === 'plan') {
    main.innerHTML = renderPlanView(fin);
  } else if (state.activeTab === 'settings') {
    main.innerHTML = renderSettingsView(fin);
  }

  renderBottomNav();
}

/* =========================================================
   VIEW 1: DASHBOARD (3-Stage Tiles, Alerts, Tips, Streak)
   ========================================================= */
function renderDashboardView(fin) {
  const greet = computeGreetingBanner();
  const netWorth = fin.totalLiquidCash + state.acorns.investBalance + state.acorns.iraBalance + state.acorns.acornsCheckingBalance + state.stocks.portfolioBalance - fin.totalCreditBalance;

  const shownNotifs = state.notifExpanded ? fin.visibleNotifs : fin.visibleNotifs.slice(0, 2);
  const hiddenCount = fin.visibleNotifs.length - 2;

  const utilColor = fin.overallCreditUtil >= 30 ? 'var(--danger)' : fin.overallCreditUtil >= 22 ? 'var(--warn)' : 'var(--income)';
  const netCashflow = fin.monthIncome - fin.monthTotalOutflow;

  return `
    <!-- 1. Dynamic Sky Greeting Banner -->
    <div class="greeting-banner ${greet.skyClass}">
      <div style="font-size:19px; font-weight:800; letter-spacing:-0.3px;">${greet.title}</div>
      <div style="font-size:12.5px; opacity:0.92; font-weight:600; margin-top:2px;">${greet.timeStr}</div>
      <div class="greeting-subbar">
        <div>
          <div style="font-size:10px; text-transform:uppercase; opacity:0.85; font-weight:700;">Total Liquid Cash</div>
          <div style="font-size:21px; font-weight:800;">${fmtCurrency(fin.totalLiquidCash)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:10px; text-transform:uppercase; opacity:0.85; font-weight:700;">Total Net Worth</div>
          <div style="font-size:16px; font-weight:700;">${fmtCurrency(netWorth)}</div>
        </div>
      </div>
    </div>

    <!-- 2. Smart Notification Stack (Max 2 visible unless expanded) -->
    <div style="margin-bottom:12px;">
      ${shownNotifs.map(n => `
        <div class="glass notif-card notif-${n.level}">
          <span>${n.text}</span>
          <button class="icon-close-btn squish" onclick="dismissNotification('${n.id}')">✕</button>
        </div>
      `).join('')}
      ${fin.visibleNotifs.length > 2 ? `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:2px 4px;">
          <button class="btn-ghost squish" onclick="toggleNotifStack()">
            ${state.notifExpanded ? '▲ Collapse Notifications' : `🔔 +${hiddenCount} More Notification${hiddenCount > 1 ? 's' : ''} (Tap to Expand)`}
          </button>
          ${state.notifExpanded ? `<button class="btn-ghost squish" onclick="dismissAllNotifications()">Clear All</button>` : ''}
        </div>
      ` : ''}
    </div>

    <!-- 3. Cycling Financial Tip Banner -->
    <div class="glass group-card" style="background:var(--tint-blue); display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 14px;">
      <div style="font-size:12px; line-height:1.4;">
        <b style="color:var(--primary-ink);">💡 Financial Tip:</b> ${FINANCIAL_TIPS[state.tipIndex % FINANCIAL_TIPS.length]}
      </div>
      <button class="btn-mint squish" onclick="cycleFinancialTip()">Next →</button>
    </div>

    <!-- 4. 3-Stage Auto-Accordion Dashboard Tiles -->
    <div class="tile-grid">

      <!-- TILE 1: CASHFLOW -->
      <div class="glass dash-tile squish ${state.expandedTile === 'cashflow' ? 'expanded' : ''}"
           style="background:var(--tint-mint);"
           onclick="toggleDashboardTile('cashflow')">
        <div>
          <div class="tile-head">
            <span>💸 CASHFLOW</span>
            <span>${state.expandedTile === 'cashflow' ? '▾' : '▸'}</span>
          </div>
          <div class="tile-val" style="color:${netCashflow >= 0 ? 'var(--income)' : 'var(--expense)'};">
            ${fmtCurrency(netCashflow)}
          </div>
          <div class="tile-meta">In: ${fmtCurrency(fin.monthIncome)} • Out: ${fmtCurrency(fin.monthTotalOutflow)}</div>
        </div>
        <div class="prog-bar">
          <div class="prog-fill" style="width:${Math.min(100, fin.monthIncome > 0 ? (fin.monthTotalOutflow / fin.monthIncome) * 100 : (fin.monthTotalOutflow > 0 ? 100 : 0))}%; background:${netCashflow >= 0 ? 'var(--income)' : 'var(--expense)'};"></div>
        </div>

        ${state.expandedTile === 'cashflow' ? `
          <div class="tile-expanded-body" onclick="event.stopPropagation()">
            <div style="font-size:12px; line-height:1.5; margin-bottom:10px; background:rgba(0,0,0,0.16); padding:9px 11px; border-radius:12px;">
              <div>• Direct Purchases: <b>${fmtCurrency(fin.monthDirectExpense)}</b></div>
              <div>• Credit Card Payments: <b>${fmtCurrency(fin.monthCardPayments)}</b></div>
              <div>• Acorns ${state.acorns.multiplier}x Round-Ups Swept: <b>${fmtCurrency(fin.monthRoundUps)}</b></div>
              <div>• Stock Contributions: <b>${fmtCurrency(fin.monthStockContributions)}</b></div>
              <div style="margin-top:4px; padding-top:4px; border-top:1px solid var(--glass-border);">
                <b>Total Monthly Outflow: ${fmtCurrency(fin.monthTotalOutflow)}</b>
              </div>
            </div>
            ${renderCategoryMiniBars(fin)}
            <div style="display:flex; justify-content:flex-end; margin-top:10px;">
              <button class="btn-mint squish" onclick="openSubPage('cashflow')">Open Full Cashflow Page ↗</button>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- TILE 2: CREDIT USAGE -->
      <div class="glass dash-tile squish ${state.expandedTile === 'credit' ? 'expanded' : ''}"
           style="background:${fin.overallCreditUtil >= 25 ? 'var(--tint-coral)' : 'var(--tint-blue)'};"
           onclick="toggleDashboardTile('credit')">
        <div>
          <div class="tile-head">
            <span>💳 CREDIT USAGE</span>
            <span>${state.expandedTile === 'credit' ? '▾' : '▸'}</span>
          </div>
          <div class="tile-val" style="color:${utilColor};">
            ${fin.overallCreditUtil.toFixed(1)}%
          </div>
          <div class="tile-meta">${fmtCurrency(fin.totalCreditBalance)} / ${fmtCurrency(fin.totalCreditLimit)}</div>
        </div>
        <div class="prog-bar">
          <div class="prog-fill" style="width:${Math.min(100, fin.overallCreditUtil)}%; background:${utilColor};"></div>
        </div>

        ${state.expandedTile === 'credit' ? `
          <div class="tile-expanded-body" onclick="event.stopPropagation()">
            <div style="font-size:12px; color:var(--muted); margin-bottom:8px;">
              30% Safe Cap: <b>${fmtCurrency(fin.totalCreditLimit * 0.3)}</b> • Est. APR Interest Risk: <b style="color:var(--expense);">${fmtCurrency(fin.totalMonthlyInterestRisk)}/mo</b>
            </div>
            ${fin.enrichedCards.filter(c => c.type === 'Credit').map(c => `
              <div style="margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
                  <span>${c.name}</span>
                  <span style="color:${c.util >= 30 ? 'var(--danger)' : 'var(--text)'};">${c.util.toFixed(1)}% (${fmtCurrency(c.liveBalance)})</span>
                </div>
                <div class="prog-bar" style="height:6px; margin-top:4px;">
                  <div class="prog-fill" style="width:${Math.min(100, c.util)}%; background:${c.util >= 30 ? 'var(--danger)' : 'var(--primary)'};"></div>
                </div>
              </div>
            `).join('')}
            <div style="display:flex; justify-content:space-between; margin-top:10px;">
              <button class="btn-ghost squish" onclick="switchTab('cards')">Manage Cards</button>
              <button class="btn-mint squish" onclick="openSubPage('credit')">Open Credit Page ↗</button>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- TILE 3: SAVE / INVEST -->
      <div class="glass dash-tile squish ${state.expandedTile === 'savings' ? 'expanded' : ''}"
           style="background:var(--tint-violet);"
           onclick="toggleDashboardTile('savings')">
        <div>
          <div class="tile-head">
            <span>🌱 SAVE / INVEST</span>
            <span>${state.expandedTile === 'savings' ? '▾' : '▸'}</span>
          </div>
          <div class="tile-val" style="color:var(--primary-ink);">
            ${fmtCurrency(fin.saveTargetAmount + fin.investTargetAmount + fin.totalActualInvestedMonth)}
          </div>
          <div class="tile-meta">${state.allocator.savingsPct}% Save • ${state.allocator.investPct}% Invest</div>
        </div>
        <div class="prog-bar">
          <div class="prog-fill" style="width:${Math.min(100, state.allocator.savingsPct + state.allocator.investPct)}%; background:var(--shopping);"></div>
        </div>

        ${state.expandedTile === 'savings' ? `
          <div class="tile-expanded-body" onclick="event.stopPropagation()">
            <div style="font-size:12px; line-height:1.5; margin-bottom:10px;">
              • Paycheck Save Target (${state.allocator.savingsPct}%): <b>${fmtCurrency(fin.saveTargetAmount)}</b><br/>
              • Paycheck Invest Target (${state.allocator.investPct}%): <b>${fmtCurrency(fin.investTargetAmount)}</b><br/>
              • Acorns ${state.acorns.multiplier}x Round-Ups + Recurring: <b>${fmtCurrency(fin.monthRoundUps + fin.acornsScheduledMonthly)}</b><br/>
              • Stock Contributions (Manual + Auto): <b>${fmtCurrency(fin.monthStockContributions + fin.stocksRecurringMonthly)}</b>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <button class="btn-ghost squish" onclick="switchTab('acorns')">Acorns & Stocks</button>
              <button class="btn-mint squish" onclick="openSubPage('savings')">Open Save/Invest Page ↗</button>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- TILE 4: DAILY ALLOWANCE -->
      <div class="glass dash-tile squish ${state.expandedTile === 'allowance' ? 'expanded' : ''}"
           style="background:var(--tint-amber);"
           onclick="toggleDashboardTile('allowance')">
        <div>
          <div class="tile-head">
            <span>🗓️ DAILY ALLOWANCE</span>
            <span>${state.expandedTile === 'allowance' ? '▾' : '▸'}</span>
          </div>
          <div class="tile-val" style="color:var(--fuel);">
            ${fmtCurrency(fin.dailyAllowance)}<span style="font-size:11px;">/d</span>
          </div>
          <div class="tile-meta">${fmtCurrency(fin.remainingLivingBudget)} over ${fin.daysLeftInCycle}d left</div>
        </div>
        <div class="prog-bar">
          <div class="prog-fill" style="width:75%; background:var(--fuel);"></div>
        </div>

        ${state.expandedTile === 'allowance' ? `
          <div class="tile-expanded-body" onclick="event.stopPropagation()">
            <div style="font-size:12px; line-height:1.45; margin-bottom:10px;">
              Your safe daily spend is <b>${fmtCurrency(fin.dailyAllowance)}/day</b> for the remaining <b>${fin.daysLeftInCycle} days</b> of this month. Any unspent dollars today automatically roll into tomorrow's allowance! Cycle resets on Day <b>${state.allocator.resetDayOfMonth}</b> of each month.
            </div>
            <div style="display:flex; justify-content:flex-end;">
              <button class="btn-mint squish" onclick="openSubPage('allowance')">Configure Daily Allowance ↗</button>
            </div>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- 5. Gamified Logging Streak Card -->
    <div class="glass group-card" style="background:var(--tint-mint); display:flex; justify-content:space-between; align-items:center; gap:10px;">
      <div>
        <div style="font-size:13.5px; font-weight:800;">🔥 ${state.streakDays}-Day Logging Streak</div>
        <div style="font-size:11.5px; color:var(--muted);">Increases +1 every day you log an entry or tap Log No-Spend Day.</div>
      </div>
      <button class="btn-mint squish" onclick="logNoSpendDayStreak()">✓ Log Today</button>
    </div>
  `;
}

function renderCategoryMiniBars(fin) {
  const list = Object.entries(fin.catSpendMonth).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  if (!list.length) return `<div style="font-size:11.5px; color:var(--muted);">No direct category purchases this month yet.</div>`;
  return list.map(([cat, val]) => {
    const m = getCatMeta(cat);
    const pct = fin.monthDirectExpense > 0 ? (val / fin.monthDirectExpense) * 100 : 0;
    return `
      <div style="margin-bottom:6px;">
        <div style="display:flex; justify-content:space-between; font-size:11.5px;">
          <span><b style="color:${m.color};">${m.icon}</b> ${cat}</span>
          <b>${fmtCurrency(val)} (${pct.toFixed(0)}%)</b>
        </div>
        <div class="prog-bar" style="height:5px; margin-top:3px;">
          <div class="prog-fill" style="width:${pct}%; background:${m.color};"></div>
        </div>
      </div>
    `;
  }).join('');
}

/* =========================================================
   DEDICATED SUBPAGES (Cashflow, Credit, Save/Invest, Allowance, How-To)
   ========================================================= */
function renderSubPageView(subPage, fin) {
  if (subPage === 'howto') return renderHowToManualView();

  const metaMap = {
    cashflow: {
      title: '💸 Full Cashflow & Outflow Breakdown',
      explain: 'Cashflow tracks all money entering your accounts minus all money leaving (Direct Purchases + Credit Card Paydowns + Acorns Round-Ups + Stock Contributions).'
    },
    credit: {
      title: '💳 Credit Usage & 30% Guardrail Engine',
      explain: 'Credit utilization is your total card balances divided by your total credit limits. Staying below 30% on each card and overall prevents credit score drops.'
    },
    savings: {
      title: '🌱 Pay-Yourself-First & Investment Breakdown',
      explain: 'Allocates your savings and investment percentages off the top of your income first, and combines them with your Acorns round-ups and Stock transfers.'
    },
    allowance: {
      title: '🗓️ Daily Safe-to-Spend & Rollover Rules',
      explain: 'Subtracts your Savings %, Investment %, and monthly outflows from your income, then divides the remaining pool across the days left in the current month.'
    }
  };
  const info = metaMap[subPage] || metaMap.cashflow;

  return `
    <div style="margin-bottom:12px;">
      <button class="btn-ghost squish" onclick="closeSubPage()">← Back to Dashboard</button>
    </div>

    <div class="glass group-card" style="background:var(--tint-mint);">
      <h2 style="margin:0 0 6px 0; font-size:17px;">${info.title}</h2>
      <p style="margin:0; font-size:12.5px; color:var(--muted); line-height:1.45;">${info.explain}</p>
    </div>

    ${subPage === 'cashflow' ? `
      <div class="glass group-card">
        <div style="font-weight:800; font-size:14px; margin-bottom:10px;">📊 Complete Outflow & Category Breakdown</div>
        <div style="font-size:12.5px; line-height:1.6; margin-bottom:12px;">
          • Monthly Income: <b style="color:var(--income);">${fmtCurrency(fin.monthIncome)}</b><br/>
          • Direct Category Purchases: <b style="color:var(--expense);">${fmtCurrency(fin.monthDirectExpense)}</b><br/>
          • Credit Card Payments: <b>${fmtCurrency(fin.monthCardPayments)}</b><br/>
          • Acorns ${state.acorns.multiplier}x Round-Ups: <b>${fmtCurrency(fin.monthRoundUps)}</b><br/>
          • Stock Contributions: <b>${fmtCurrency(fin.monthStockContributions)}</b>
        </div>
        ${renderCategoryMiniBars(fin)}
      </div>
    ` : ''}

    ${subPage === 'credit' ? `
      <div class="glass group-card">
        <div style="font-weight:800; font-size:14px; margin-bottom:10px;">💳 All Credit Cards & Monthly Interest Risk</div>
        ${fin.enrichedCards.filter(c => c.type === 'Credit').map(c => `
          <div class="glass" style="padding:12px; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; font-weight:800;">
              <span>${c.name}</span>
              <span style="color:${c.util >= 30 ? 'var(--danger)' : 'var(--income)'};">${c.util.toFixed(1)}% used</span>
            </div>
            <div style="font-size:12px; color:var(--muted); margin-top:4px;">
              Balance: <b>${fmtCurrency(c.liveBalance)}</b> / Limit: ${fmtCurrency(c.limit)}<br/>
              Active APR: <b>${c.activeApr}%</b> • Monthly Interest: <b>${fmtCurrency(c.monthlyInterest)}/mo</b>
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${(subPage === 'savings' || subPage === 'allowance') ? `
      <div class="glass group-card">
        <div style="font-weight:800; font-size:14px; margin-bottom:10px;">⚙️ Safe-to-Spend & Rollover Settings</div>
        <div class="grid-2">
          <div class="field">
            <label class="field-label">Savings Target (%)</label>
            <input class="input" type="text" inputmode="decimal" value="${state.allocator.savingsPct}" oninput="updateAllocatorField('savingsPct', this.value)" />
          </div>
          <div class="field">
            <label class="field-label">Investment Target (%)</label>
            <input class="input" type="text" inputmode="decimal" value="${state.allocator.investPct}" oninput="updateAllocatorField('investPct', this.value)" />
          </div>
        </div>
        <div class="grid-2">
          <div class="field">
            <label class="field-label">Rollover Buffer Added ($)</label>
            <input class="input" type="text" inputmode="decimal" value="${state.allocator.rolloverPool}" oninput="updateAllocatorField('rolloverPool', this.value)" />
          </div>
          <div class="field">
            <label class="field-label">Cycle Reset Day (1-28)</label>
            <input class="input" type="text" inputmode="decimal" value="${state.allocator.resetDayOfMonth}" oninput="updateAllocatorField('resetDayOfMonth', this.value)" />
          </div>
        </div>
        <div id="allocatorLiveSummary" class="glass" style="padding:12px; background:var(--tint-mint); font-size:12.5px; line-height:1.5;">
          ${renderAllocatorSummaryHTML(fin)}
        </div>
      </div>
    ` : ''}
  `;
}

function renderAllocatorSummaryHTML(fin) {
  return `
    💰 Sets aside <b>${fmtCurrency(fin.saveTargetAmount)}</b> (${state.allocator.savingsPct}%) to Savings & <b>${fmtCurrency(fin.investTargetAmount)}</b> (${state.allocator.investPct}%) to Investments first.<br/>
    🗓️ Remaining Living Pool: <b>${fmtCurrency(fin.remainingLivingBudget)}</b> divided across <b>${fin.daysLeftInCycle} days left in month</b> = <b style="color:var(--primary-ink);">${fmtCurrency(fin.dailyAllowance)}/day</b>.
  `;
}

/* =========================================================
   VIEW 2: CARDS & ACCOUNTS (Collapsible Sections & Wrapping Notes)
   ========================================================= */
function renderCardsAndAccountsView(fin) {
  const acctCollapsed = Boolean(state.collapsedSections['sec_accounts']);
  const cardsCollapsed = Boolean(state.collapsedSections['sec_cards']);

  return `
    <!-- Section 1: Checking, Savings & Cash on Hand (Mint Tint) -->
    <div class="glass group-card" style="background:var(--tint-mint);">
      <div class="group-header" onclick="toggleSectionCollapse('sec_accounts')">
        <span>🏦 Checking, Savings & Cash (${state.accounts.length})</span>
        <div style="display:flex; gap:6px; align-items:center;" onclick="event.stopPropagation()">
          <button class="btn-mint squish" onclick="openAccountModal()">+ Account</button>
          <span style="font-size:13px; cursor:pointer;" onclick="toggleSectionCollapse('sec_accounts')">${acctCollapsed ? '▸' : '▾'}</span>
        </div>
      </div>

      ${!acctCollapsed ? `
        <div class="group-body">
          ${state.accounts.map(a => {
            const bal = fin.acctBalances[a.id] || 0;
            const yearlyInterest = bal * ((Number(a.apy) || 0) / 100);
            return `
              <div class="glass" style="padding:12px; margin-bottom:9px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:800; font-size:14px;">
                    ${a.name}
                    ${a.acornsLinked ? `<span class="pill-badge" style="background:rgba(0,255,176,0.15); color:var(--income);">Acorns ${state.acorns.multiplier}x</span>` : ''}
                  </div>
                  <div style="font-size:11.5px; color:var(--muted); margin-top:2px;">
                    ${a.type} • ${a.apy > 0 ? `<span style="color:var(--income); font-weight:700;">${a.apy}% APY (+${fmtCurrency(yearlyInterest)}/yr)</span>` : '0% APY'}
                  </div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:16px; font-weight:800;">${fmtCurrency(bal)}</div>
                  <button class="btn-ghost squish" style="padding:3px 9px; font-size:10.5px; margin-top:4px;" onclick="openAccountModal('${a.id}')">Edit</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>

    <!-- Section 2: Debit & Credit Cards (Blue Tint) -->
    <div class="glass group-card" style="background:var(--tint-blue);">
      <div class="group-header" onclick="toggleSectionCollapse('sec_cards')">
        <span>💳 Debit & Credit Cards (${fin.enrichedCards.length})</span>
        <div style="display:flex; gap:6px; align-items:center;" onclick="event.stopPropagation()">
          <button class="btn-mint squish" onclick="openCardModal()">+ Add Card</button>
          <span style="font-size:13px; cursor:pointer;" onclick="toggleSectionCollapse('sec_cards')">${cardsCollapsed ? '▸' : '▾'}</span>
        </div>
      </div>

      ${!cardsCollapsed ? `
        <div class="group-body">
          ${fin.enrichedCards.map(c => {
            const linkedNames = (c.linkedAccountIds || []).map(id => {
              const found = state.accounts.find(a => a.id === id);
              return found ? found.name : '';
            }).filter(Boolean).join(', ');
            const noteOpen = Boolean(state.expandedNotes[c.id]);

            return `
              <div class="glass" style="padding:14px; margin-bottom:11px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                  <div>
                    <div style="font-weight:800; font-size:15px;">
                      ${c.name}
                      ${c.acornsLinked ? `<span class="pill-badge" style="background:rgba(0,255,176,0.15); color:var(--income);">${state.acorns.multiplier}x</span>` : ''}
                    </div>
                    <div style="font-size:11.5px; color:var(--muted); margin-top:2px;">
                      ${c.type} Card • Tied to: <b>${linkedNames || 'Suncoast Checking'}</b>
                    </div>
                  </div>
                  <div style="display:flex; gap:6px; flex-shrink:0;">
                    ${c.type === 'Credit' ? `<button class="btn-mint squish" onclick="openPayCardModal('${c.id}')">↘ Pay</button>` : ''}
                    <button class="btn-ghost squish" onclick="openCardModal('${c.id}')">Edit</button>
                  </div>
                </div>

                ${c.type === 'Credit' ? `
                  <div style="margin-top:10px; display:flex; justify-content:space-between; font-size:12px;">
                    <span>Bal: <b>${fmtCurrency(c.liveBalance)}</b> / ${fmtCurrency(c.limit)} (<b>${c.util.toFixed(1)}%</b>)</span>
                    <span style="color:${c.monthlyInterest > 0 ? 'var(--expense)' : 'var(--income)'}; font-weight:700;">
                      ${fmtCurrency(c.monthlyInterest)}/mo interest
                    </span>
                  </div>
                  <div class="prog-bar" style="height:7px;">
                    <div class="prog-fill" style="width:${Math.min(100, c.util)}%; background:${c.util >= 30 ? 'var(--danger)' : c.util >= 22 ? 'var(--warn)' : 'var(--primary)'};"></div>
                  </div>
                  <div style="margin-top:7px; font-size:11.5px; color:var(--muted);">
                    Std APR: <b>${c.stdApr}%</b>
                    ${c.promoValid ? ` • <span style="color:var(--primary-ink); font-weight:700;">Promo ${c.promoApr}% APR until ${fmtShortDate(c.promoExp)}</span>` : ''}
                  </div>
                ` : ''}

                <!-- Cashback Tiers -->
                <div style="margin-top:10px;">
                  <div style="font-size:10.5px; font-weight:800; text-transform:uppercase; color:var(--muted); margin-bottom:5px;">Active Cashback Tiers</div>
                  ${(c.rotations && c.rotations.length) ? c.rotations.map(r => `
                    <div class="pill-badge" style="background:var(--tint-mint); border:1px solid var(--glass-border); margin:2px 4px 2px 0; padding:5px 9px;">
                      ★ ${r.rate}% on ${(r.categories || []).join(' + ')} (${r.durationLabel} • Exp ${fmtShortDate(r.expDate)})
                    </div>
                  `).join('') : `<span style="font-size:11.5px; color:var(--muted);">No rotating cashback tiers</span>`}
                </div>

                <!-- Collapsible Wrapping Card Notes -->
                ${c.notes ? `
                  <div style="margin-top:9px;">
                    <button class="btn-ghost squish" style="font-size:11px; padding:4px 10px;" onclick="toggleCardNote('${c.id}')">
                      📝 ${noteOpen ? 'Hide Card Notes ▲' : 'View Card Notes & Fees ▾'}
                    </button>
                    ${noteOpen ? `<div class="note-box">${c.notes}</div>` : ''}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

/* =========================================================
   VIEW 3: ACORNS DYNAMIC MULTIPLIER & STOCK INVESTING HUB
   ========================================================= */
function renderAcornsAndStocksView(fin) {
  const acornsCollapsed = Boolean(state.collapsedSections['sec_acorns']);
  const stocksCollapsed = Boolean(state.collapsedSections['sec_stocks']);
  const primaryAcct = state.accounts.find(a => a.id === state.acorns.primaryCheckingId);
  const roundUpTxs = state.transactions.filter(t => !t.archived && t.type === 'expense' && t.acornsRoundUp > 0);
  const stockTxs = state.transactions.filter(t => !t.archived && t.type === 'stock');

  return `
    <!-- 1. Acorns Dynamic Round-Up Hub (Mint Tint) -->
    <div class="glass group-card" style="background:var(--tint-mint);">
      <div class="group-header" onclick="toggleSectionCollapse('sec_acorns')">
        <span>🌱 Acorns <span class="acorns-mult-label">${state.acorns.multiplier}x</span> Round-Up Hub</span>
        <span style="font-size:13px;">${acornsCollapsed ? '▸' : '▾'}</span>
      </div>

      ${!acornsCollapsed ? `
        <div class="group-body">
          <div style="font-size:12px; color:var(--muted); line-height:1.45; margin-bottom:12px;">
            Rounds every purchase on a connected account/card up to the nearest dollar (or <b>$${Number(state.acorns.evenDollarPull).toFixed(2)}</b> on whole-dollar amounts), multiplies by <b class="acorns-mult-label">${state.acorns.multiplier}x</b>, and sweeps from <b>${primaryAcct ? primaryAcct.name : 'Primary Checking'}</b> into your <b>Save / Invest</b> total.
          </div>

          <div class="grid-2" style="margin-bottom:12px; text-align:center;">
            <div class="glass" style="padding:10px;">
              <div style="font-size:10.5px; color:var(--muted);">This Month <span class="acorns-mult-label">${state.acorns.multiplier}x</span> Sweeps</div>
              <div style="font-size:18px; font-weight:800; color:var(--income);" id="acornsMonthSweepsVal">${fmtCurrency(fin.monthRoundUps)}</div>
            </div>
            <div class="glass" style="padding:10px;">
              <div style="font-size:10.5px; color:var(--muted);">Scheduled Monthly Auto</div>
              <div style="font-size:18px; font-weight:800; color:var(--primary-ink);" id="acornsSchedVal">${fmtCurrency(fin.acornsScheduledMonthly)}</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label class="field-label">Round-Up Multiplier (x)</label>
              <input class="input" type="text" inputmode="decimal" value="${state.acorns.multiplier}" oninput="updateAcornsSetting('multiplier', this.value)" />
            </div>
            <div class="field">
              <label class="field-label">Even-Dollar Base Pull ($)</label>
              <input class="input" type="text" inputmode="decimal" value="${state.acorns.evenDollarPull}" oninput="updateAcornsSetting('evenDollarPull', this.value)" />
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label class="field-label">Weekly Invest Pull ($)</label>
              <input class="input" type="text" inputmode="decimal" value="${state.acorns.weeklyPull}" oninput="updateAcornsSetting('weeklyPull', this.value)" />
            </div>
            <div class="field">
              <label class="field-label">Primary Checking Source</label>
              <select class="select" onchange="updateAcornsSetting('primaryCheckingId', this.value, true)">
                ${state.accounts.filter(a => a.type === 'Checking').map(a => `
                  <option value="${a.id}" ${a.id === state.acorns.primaryCheckingId ? 'selected' : ''}>${a.name}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label class="field-label">Acorns IRA (Last Day of Mo $)</label>
              <input class="input" type="text" inputmode="decimal" value="${state.acorns.iraLastDayPull}" oninput="updateAcornsSetting('iraLastDayPull', this.value)" />
            </div>
            <div class="field">
              <label class="field-label">Acorns Checking (1st of Mo $)</label>
              <input class="input" type="text" inputmode="decimal" value="${state.acorns.checkingFirstDayPull}" oninput="updateAcornsSetting('checkingFirstDayPull', this.value)" />
            </div>
          </div>

          <div style="margin-top:8px;">
            <label class="field-label">Connected Accounts & Cards (Tap to Toggle Round-Ups)</label>
            <div style="display:flex; flex-wrap:wrap; gap:7px; margin-top:6px;">
              ${state.accounts.map(a => `
                <button class="btn-ghost squish" style="border-color:${a.acornsLinked ? 'var(--income)' : 'var(--glass-border)'}; background:${a.acornsLinked ? 'var(--tint-mint)' : 'transparent'};" onclick="toggleAcornsConnection('account', '${a.id}')">
                  ${a.acornsLinked ? '✓ ' : ''}${a.name}
                </button>
              `).join('')}
              ${state.cards.map(c => `
                <button class="btn-ghost squish" style="border-color:${c.acornsLinked ? 'var(--income)' : 'var(--glass-border)'}; background:${c.acornsLinked ? 'var(--tint-mint)' : 'transparent'};" onclick="toggleAcornsConnection('card', '${c.id}')">
                  ${c.acornsLinked ? '✓ ' : ''}${c.name}
                </button>
              `).join('')}
            </div>
          </div>

          <div style="margin-top:14px;">
            <label class="field-label">Recent <span class="acorns-mult-label">${state.acorns.multiplier}x</span> Round-Up Ledger</label>
            ${roundUpTxs.map(t => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--glass-border); font-size:12px;">
                <div>
                  <b>${t.merchant}</b> (${fmtCurrency(t.amount)})
                  <div style="font-size:10.5px; color:var(--muted);">${fmtHumanDate(t.date)}</div>
                </div>
                <span class="pill-badge" style="background:var(--tint-mint); color:var(--income);">+${fmtCurrency(t.acornsRoundUp)} swept</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>

    <!-- 2. Stock & Brokerage Contributions Section (Violet Tint) -->
    <div class="glass group-card" style="background:var(--tint-violet);">
      <div class="group-header" onclick="toggleSectionCollapse('sec_stocks')">
        <span>📈 Stock & Brokerage Investing</span>
        <div style="display:flex; gap:6px; align-items:center;" onclick="event.stopPropagation()">
          <button class="btn-mint squish" onclick="openStockContribModal()">+ Log Stock Buy</button>
          <span style="font-size:13px;" onclick="toggleSectionCollapse('sec_stocks')">${stocksCollapsed ? '▸' : '▾'}</span>
        </div>
      </div>

      ${!stocksCollapsed ? `
        <div class="group-body">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div>
              <div style="font-size:11px; color:var(--muted);">Manual + Recurring Stock Contributions (Mo)</div>
              <div style="font-size:19px; font-weight:800; color:var(--primary-ink);">${fmtCurrency(fin.monthStockContributions + fin.stocksRecurringMonthly)}</div>
            </div>
            <button class="btn-ghost squish" onclick="openRecurringStockModal()">+ Recurring Transfer</button>
          </div>

          <div style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase; margin-bottom:6px;">Recurring Stock Transfers</div>
          ${(state.stocks.recurringTransfers || []).map(st => {
            const src = state.accounts.find(a => a.id === st.fromAccountId);
            return `
              <div class="glass" style="padding:10px 12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; font-size:13px;">${st.name}</div>
                  <div style="font-size:11px; color:var(--muted);">Day ${st.dayOfMonth} • ${src ? src.name : 'Checking'} • Autopay: ${st.autopay ? 'Y' : 'N'}</div>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <b>${fmtCurrency(st.amount)}/mo</b>
                  <button class="btn-danger-ghost squish" onclick="deleteRecurringStock('${st.id}')">✕</button>
                </div>
              </div>
            `;
          }).join('')}

          ${stockTxs.length ? `
            <div style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase; margin:10px 0 6px 0;">Logged One-Time Stock Contributions</div>
            ${stockTxs.map(t => `
              <div style="display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid var(--glass-border); font-size:12px;">
                <span><b>${t.merchant}</b> • ${fmtAppleSlashDate(t.date)}</span>
                <b style="color:var(--income);">${fmtCurrency(t.amount)}</b>
              </div>
            `).join('')}
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

/* =========================================================
   VIEW 4: APPLE CARD-STYLE HISTORY & ARCHIVE LEDGER
   ========================================================= */
function renderHistoryView(fin) {
  const f = state.historyFilter;
  const uniqueMerchants = Array.from(new Set(state.transactions.map(t => t.merchant).filter(Boolean))).sort();
  const allSources = [...state.cards, ...state.accounts];

  return `
    <div class="glass group-card" style="background:var(--tint-blue);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <span style="font-size:15px; font-weight:800;">🧾 Transaction History</span>
        <button class="btn-ghost squish" onclick="toggleHistoryArchiveMode()">
          ${f.showArchived ? '📂 Viewing Archived (Tap for Active)' : `🗄️ Archived (${state.transactions.filter(t => t.archived).length})`}
        </button>
      </div>

      <!-- Search Input (Updates #historyDynamicBody in-place so keyboard NEVER closes!) -->
      <div class="field">
        <input id="historySearchInput" class="input" type="text" placeholder="Search merchant, description, date, amount..." value="${f.search}" oninput="handleHistorySearchInput(this.value)" />
      </div>

      <!-- Filters & Sort Row -->
      <div class="grid-2" style="margin-bottom:8px;">
        <div>
          <label class="field-label">Filter Merchant</label>
          <select class="select" style="padding:7px 10px; font-size:13px;" onchange="updateHistoryFilterSelect('merchant', this.value)">
            <option value="ALL">All Merchants</option>
            ${uniqueMerchants.map(m => `<option value="${m}" ${f.merchant === m ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label">Filter Category</label>
          <select class="select" style="padding:7px 10px; font-size:13px;" onchange="updateHistoryFilterSelect('category', this.value)">
            <option value="ALL">All Categories</option>
            ${Object.keys(state.categories).map(c => `<option value="${c}" ${f.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid-2">
        <div>
          <label class="field-label">Card / Account</label>
          <select class="select" style="padding:7px 10px; font-size:13px;" onchange="updateHistoryFilterSelect('sourceId', this.value)">
            <option value="ALL">All Cards & Accounts</option>
            ${allSources.map(s => `<option value="${s.id}" ${f.sourceId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label">Sort By</label>
          <select class="select" style="padding:7px 10px; font-size:13px;" onchange="updateHistoryFilterSelect('sortBy', this.value)">
            <option value="date_desc" ${f.sortBy === 'date_desc' ? 'selected' : ''}>Newest First</option>
            <option value="date_asc" ${f.sortBy === 'date_asc' ? 'selected' : ''}>Oldest First</option>
            <option value="amt_desc" ${f.sortBy === 'amt_desc' ? 'selected' : ''}>Amount: High → Low</option>
            <option value="amt_asc" ${f.sortBy === 'amt_asc' ? 'selected' : ''}>Amount: Low → High</option>
            <option value="merch_az" ${f.sortBy === 'merch_az' ? 'selected' : ''}>Merchant: A → Z</option>
          </select>
        </div>
      </div>
    </div>

    <div id="historyDynamicBody">
      ${renderHistoryDynamicContent()}
    </div>
  `;
}

function renderHistoryDynamicContent() {
  const f = state.historyFilter;
  const allSources = [...state.cards, ...state.accounts];

  let list = state.transactions.filter(t => Boolean(t.archived) === Boolean(f.showArchived));

  if (f.drillFolder) {
    list = list.filter(t => {
      const d = new Date(t.date);
      if (f.drillFolder.startsWith('YEAR_')) {
        return d.getFullYear() === Number(f.drillFolder.replace('YEAR_', ''));
      }
      if (f.drillFolder.startsWith('MO_')) {
        const [, yr, mo] = f.drillFolder.split('_');
        return d.getFullYear() === Number(yr) && d.getMonth() === Number(mo);
      }
      return true;
    });
  }

  if (f.merchant !== 'ALL') list = list.filter(t => t.merchant === f.merchant);
  if (f.category !== 'ALL') list = list.filter(t => t.category === f.category);
  if (f.sourceId !== 'ALL') list = list.filter(t => t.sourceId === f.sourceId);

  if (f.search.trim()) {
    const q = f.search.toLowerCase();
    list = list.filter(t => {
      const src = allSources.find(s => s.id === t.sourceId);
      const sName = src ? src.name.toLowerCase() : '';
      return (t.merchant || '').toLowerCase().includes(q) ||
             (t.description || '').toLowerCase().includes(q) ||
             (t.category || '').toLowerCase().includes(q) ||
             sName.includes(q) ||
             fmtAppleSlashDate(t.date).includes(q) ||
             String(t.amount).includes(q);
    });
  }

  list.sort((a, b) => {
    if (f.sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
    if (f.sortBy === 'amt_desc') return Number(b.amount) - Number(a.amount);
    if (f.sortBy === 'amt_asc') return Number(a.amount) - Number(b.amount);
    if (f.sortBy === 'merch_az') return (a.merchant || '').localeCompare(b.merchant || '');
    return new Date(b.date) - new Date(a.date);
  });

  const totalIn = list.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
  const totalOut = list.filter(t => t.type !== 'income').reduce((a, b) => a + Number(b.amount) + (Number(b.acornsRoundUp) || 0), 0);

  // Build Monthly Folders for Current Year (2026) and Previous Years (2025, 2024...)
  const activeAll = state.transactions.filter(t => !t.archived);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const curYr = new Date().getFullYear();

  const monthsInCurYear = [];
  for (let m = 11; m >= 0; m--) {
    const count = activeAll.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === curYr && d.getMonth() === m;
    }).length;
    if (count > 0) monthsInCurYear.push({ monthIndex: m, name: monthNames[m], count });
  }

  const prevYearsMap = {};
  activeAll.forEach(t => {
    const y = new Date(t.date).getFullYear();
    if (y < curYr) prevYearsMap[y] = (prevYearsMap[y] || 0) + 1;
  });

  return `
    ${f.drillFolder ? `
      <div style="margin-bottom:10px;">
        <button class="btn-mint squish" onclick="setHistoryDrillFolder(null)">← Back to All Statements</button>
      </div>
    ` : ''}

    <div style="display:flex; justify-content:space-between; font-size:12px; padding:0 6px 8px 6px; color:var(--muted);">
      <span><b>${list.length}</b> transactions</span>
      <span style="color:var(--income);">Income: <b>${fmtCurrency(totalIn)}</b></span>
      <span style="color:var(--expense);">Outflow: <b>${fmtCurrency(totalOut)}</b></span>
    </div>

    <div class="apple-list-group">
      ${list.length === 0 ? `
        <div style="padding:26px; text-align:center; color:var(--muted); font-size:13px;">No matching transactions.</div>
      ` : list.map(t => {
        const src = allSources.find(s => s.id === t.sourceId);
        const cbPct = t.cashbackPct || detectCashbackPct(t.sourceId, t.category);
        return `
          <div class="apple-tx-row">
            <div style="display:flex; align-items:center; gap:11px; min-width:0; flex:1;">
              ${renderCatBadge(t.category)}
              <div style="min-width:0; flex:1;">
                <div style="font-weight:800; font-size:14.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${t.merchant}
                  ${t.isSplitReceipt ? `<span class="pill-badge" style="background:var(--tint-blue); font-size:10px;">Split</span>` : ''}
                  ${t.acornsRoundUp > 0 ? `<span class="pill-badge" style="background:var(--tint-mint); color:var(--income); font-size:10px;">+${fmtCurrency(t.acornsRoundUp)}</span>` : ''}
                </div>
                <div style="font-size:11.5px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${t.description ? `${t.description} • ` : ''}${src ? src.name : 'Account'}
                </div>
                <div style="font-size:11px; color:var(--muted);">${fmtAppleSlashDate(t.date)}</div>
              </div>
            </div>

            <div style="text-align:right; flex-shrink:0;">
              <div style="font-weight:800; font-size:15px; color:${t.type === 'income' ? 'var(--income)' : 'var(--text)'};">
                ${t.type === 'income' ? '+' : '-'}${fmtCurrency(t.amount)}
              </div>
              ${t.type === 'expense' && cbPct > 0 ? `
                <div style="display:inline-block; background:rgba(128,128,128,0.2); padding:1px 6px; border-radius:6px; font-size:10px; font-weight:700; color:var(--muted); margin-top:2px;">
                  ${cbPct}%
                </div>
              ` : ''}
              <div style="display:flex; gap:4px; justify-content:flex-end; margin-top:5px;">
                <button class="btn-ghost squish" style="padding:2px 7px; font-size:10px;" onclick="openQuickAddModal('${t.id}')">Edit</button>
                <button class="btn-ghost squish" style="padding:2px 7px; font-size:10px; color:${t.archived ? 'var(--income)' : 'var(--expense)'};" onclick="toggleArchiveTransaction('${t.id}')">
                  ${t.archived ? 'Restore' : 'Archive'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Apple Card-Style Monthly Statement Folders -->
    ${!f.drillFolder && !f.showArchived ? `
      <h3 style="margin:18px 4px 8px 4px; font-size:17px; font-weight:800;">${curYr}</h3>
      <div class="apple-list-group">
        ${monthsInCurYear.map(m => `
          <div class="apple-folder-row squish" onclick="setHistoryDrillFolder('MO_${curYr}_${m.monthIndex}')">
            <div style="display:flex; align-items:center; gap:12px;">
              <span class="cat-chip" style="background:rgba(128,128,128,0.15); color:var(--text);">☰</span>
              <div>
                <div style="font-weight:800; font-size:14.5px;">${m.name}</div>
                <div style="font-size:12px; color:var(--muted);">${m.count} Transaction${m.count > 1 ? 's' : ''}</div>
              </div>
            </div>
            <span style="color:var(--muted); font-size:16px;">›</span>
          </div>
        `).join('')}
      </div>

      <h3 style="margin:18px 4px 8px 4px; font-size:17px; font-weight:800;">Previous Years</h3>
      <div class="apple-list-group">
        ${Object.entries(prevYearsMap).sort((a, b) => b[0] - a[0]).map(([yr, cnt]) => `
          <div class="apple-folder-row squish" onclick="setHistoryDrillFolder('YEAR_${yr}')">
            <div style="display:flex; align-items:center; gap:12px;">
              <span class="cat-chip" style="background:rgba(128,128,128,0.15); color:var(--text);">☰</span>
              <div>
                <div style="font-weight:800; font-size:14.5px;">Transactions in ${yr}</div>
                <div style="font-size:12px; color:var(--muted);">${cnt} Transaction${cnt > 1 ? 's' : ''}</div>
              </div>
            </div>
            <span style="color:var(--muted); font-size:16px;">›</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
}

/* =========================================================
   VIEW 5: PLAN (50/30/20 Optimizer, Bills, Budgets, Debt Snowball/Avalanche)
   ========================================================= */
function renderPlanView(fin) {
  let needsSpent = 0, wantsSpent = 0;
  Object.entries(fin.catSpendMonth).forEach(([cat, val]) => {
    const b = getCatMeta(cat).bucket;
    if (b === 'need') needsSpent += val;
    else if (b === 'want') wantsSpent += val;
  });

  const inc = Math.max(1, fin.monthIncome);
  const needsPct = (needsSpent / inc) * 100;
  const wantsPct = (wantsSpent / inc) * 100;
  const unspentNeeds = Math.max(0, (fin.monthIncome * 0.50) - needsSpent);
  const unspentWants = Math.max(0, (fin.monthIncome * 0.30) - wantsSpent);

  const billsCollapsed = Boolean(state.collapsedSections['sec_bills']);
  const budgetsCollapsed = Boolean(state.collapsedSections['sec_budgets']);
  const debtCollapsed = Boolean(state.collapsedSections['sec_debt']);

  const dayOfMonthPct = (new Date().getDate() / 30) * 100;
  const creditDebts = fin.enrichedCards.filter(c => c.type === 'Credit' && c.liveBalance > 0)
    .sort((a, b) => state.debtStrategy === 'avalanche' ? (b.activeApr - a.activeApr) : (a.liveBalance - b.liveBalance));

  return `
    <!-- 1. 50/30/20 Auto-Budget Optimizer (Mint Tint) -->
    <div class="glass group-card" style="background:var(--tint-mint);">
      <div style="font-weight:800; font-size:14.5px; margin-bottom:6px;">🎯 50/30/20 Auto-Budget Optimizer</div>
      <div style="font-size:12px; color:var(--muted); margin-bottom:8px;">
        50% Needs (${fmtCurrency(fin.monthIncome * 0.5)}) • 30% Wants (${fmtCurrency(fin.monthIncome * 0.3)}) • 20% Savings (${fmtCurrency(fin.monthIncome * 0.2)})
      </div>
      <div style="font-size:12.5px; margin-bottom:8px;">
        • Needs Used: <b>${needsPct.toFixed(1)}%</b> (${fmtCurrency(needsSpent)})<br/>
        • Wants Used: <b>${wantsPct.toFixed(1)}%</b> (${fmtCurrency(wantsSpent)})
      </div>
      <div class="glass" style="padding:10px 12px; font-size:12px; line-height:1.45;">
        🚀 <b>Optimization Strategy:</b> You have <b>${fmtCurrency(unspentNeeds)}</b> unspent in Needs and <b>${fmtCurrency(unspentWants)}</b> unspent in Wants. Sweeping <b>${fmtCurrency(unspentNeeds + unspentWants)}</b> into High-Yield Savings or Stocks boosts your effective savings rate!
      </div>
    </div>

    <!-- 2. Recurring Bills & Autopay (Blue Tint) -->
    <div class="glass group-card" style="background:var(--tint-blue);">
      <div class="group-header" onclick="toggleSectionCollapse('sec_bills')">
        <span>📅 Bills & Autopay Tracker (${state.bills.length})</span>
        <div style="display:flex; gap:6px; align-items:center;" onclick="event.stopPropagation()">
          <button class="btn-mint squish" onclick="openBillModal()">+ Add Bill</button>
          <span style="font-size:13px;" onclick="toggleSectionCollapse('sec_bills')">${billsCollapsed ? '▸' : '▾'}</span>
        </div>
      </div>

      ${!billsCollapsed ? `
        <div class="group-body">
          ${state.bills.map(b => {
            const src = [...state.cards, ...state.accounts].find(s => s.id === b.sourceId);
            return `
              <div class="glass" style="padding:11px 13px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <div>
                  <div style="font-weight:800; font-size:13.5px;">${b.merchant} <span style="font-weight:500; color:var(--muted);">› ${b.category}</span></div>
                  <div style="font-size:11.5px; color:var(--muted);">
                    Due ${b.dueDay}th • ${src ? src.name : 'Account'} •
                    <b style="color:${b.autopay ? 'var(--income)' : 'var(--warn)'};">Autopay: ${b.autopay ? 'Y' : 'N'}</b>
                  </div>
                </div>
                <div style="text-align:right; flex-shrink:0;">
                  <div style="font-weight:800; font-size:14px;">${fmtCurrency(b.amount)}</div>
                  <div style="display:flex; gap:4px; margin-top:4px;">
                    <button class="btn-ghost squish" style="padding:3px 7px; font-size:10px;" onclick="postBillTransactionNow('${b.id}')">Post Now</button>
                    <button class="btn-ghost squish" style="padding:3px 7px; font-size:10px;" onclick="openBillModal('${b.id}')">Edit</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>

    <!-- 3. Category Guardrail Budgets w/ Rollover & Pacing (Amber Tint) -->
    <div class="glass group-card" style="background:var(--tint-amber);">
      <div class="group-header" onclick="toggleSectionCollapse('sec_budgets')">
        <span>🛡️ Category Budgets (Rollover & Pacing)</span>
        <span style="font-size:13px;">${budgetsCollapsed ? '▸' : '▾'}</span>
      </div>

      ${!budgetsCollapsed ? `
        <div class="group-body">
          ${Object.keys(state.categories).map(cat => {
            const bObj = state.budgets[cat] || { limit: 250, rollover: 0 };
            const totalCap = (Number(bObj.limit) || 0) + (Number(bObj.rollover) || 0);
            const spent = fin.catSpendMonth[cat] || 0;
            const pct = totalCap > 0 ? (spent / totalCap) * 100 : 0;
            const m = getCatMeta(cat);
            const pacingFast = pct > dayOfMonthPct + 15;
            return `
              <div style="margin-bottom:11px;">
                <div style="display:flex; justify-content:space-between; font-size:12.5px;">
                  <span><b style="color:${m.color};">${m.icon}</b> <b>${cat}</b> ${bObj.rollover > 0 ? `<span style="font-size:10.5px; color:var(--income);">(+$${bObj.rollover} rollover)</span>` : ''}</span>
                  <span>${fmtCurrency(spent)} / ${fmtCurrency(totalCap)}</span>
                </div>
                <div class="prog-bar" style="height:6px; margin-top:4px;">
                  <div class="prog-fill" style="width:${Math.min(100, pct)}%; background:${pct >= 95 ? 'var(--danger)' : m.color};"></div>
                </div>
                ${pacingFast ? `<div style="font-size:10.5px; color:var(--warn); margin-top:2px;">⚡ Pacing Alert: ${pct.toFixed(0)}% spent (${dayOfMonthPct.toFixed(0)}% through month)</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>

    <!-- 4. Snowball vs Avalanche Debt Payoff Calculator (Violet Tint) -->
    <div class="glass group-card" style="background:var(--tint-violet);">
      <div class="group-header" onclick="toggleSectionCollapse('sec_debt')">
        <span>⛄ Debt Payoff Calculator</span>
        <span style="font-size:13px;">${debtCollapsed ? '▸' : '▾'}</span>
      </div>

      ${!debtCollapsed ? `
        <div class="group-body">
          <div style="display:flex; gap:6px; margin-bottom:10px;">
            <button class="${state.debtStrategy === 'avalanche' ? 'btn-mint' : 'btn-ghost'} squish" style="flex:1;" onclick="setDebtPayoffStrategy('avalanche')">Avalanche (Highest APR)</button>
            <button class="${state.debtStrategy === 'snowball' ? 'btn-mint' : 'btn-ghost'} squish" style="flex:1;" onclick="setDebtPayoffStrategy('snowball')">Snowball (Lowest Bal)</button>
          </div>
          <div class="field">
            <label class="field-label">Extra Monthly Debt Paydown ($)</label>
            <input class="input" type="text" inputmode="decimal" value="${state.extraDebtBudget}" oninput="state.extraDebtBudget=Number(this.value)||0; persistState();" />
          </div>
          ${creditDebts.map((d, idx) => {
            const monthlyAllotted = idx === 0 ? (Number(state.extraDebtBudget) + 90) : 90;
            const mos = Math.ceil(d.liveBalance / Math.max(25, monthlyAllotted));
            return `
              <div class="glass" style="padding:10px 12px; margin-bottom:8px; font-size:12.5px;">
                <div style="display:flex; justify-content:space-between;">
                  <b>#${idx + 1} Target: ${d.name}</b>
                  <span style="color:var(--primary-ink); font-weight:800;">~${mos} mos to $0</span>
                </div>
                <div style="font-size:11.5px; color:var(--muted); margin-top:2px;">
                  Balance: ${fmtCurrency(d.liveBalance)} • Active APR: ${d.activeApr}%
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

/* =========================================================
   VIEW 6: SETTINGS, CATEGORY CUSTOMIZER, BACKUP & HOW-TO
   ========================================================= */
function renderSettingsView() {
  return `
    <!-- 1. Category & Icon Customizer (Mint Tint) -->
    <div class="glass group-card" style="background:var(--tint-mint);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <span style="font-weight:800; font-size:14.5px;">✦ Customize Categories & Icons</span>
        <button class="btn-mint squish" onclick="openCategoryEditorModal()">+ New Category</button>
      </div>
      <div style="font-size:12px; color:var(--muted); margin-bottom:10px;">
        Tap any category below to customize its symbol, accent color, or 50/30/20 bucket.
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:7px;">
        ${Object.entries(state.categories).map(([name, meta]) => `
          <button class="btn-ghost squish" style="border-color:${meta.color}66; display:inline-flex; align-items:center; gap:6px; padding:6px 11px;" onclick="openCategoryEditorModal('${name}')">
            <span style="color:${meta.color}; font-weight:800;">${meta.icon}</span>
            <span>${name}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- 2. Beginner's How-To Manual & 5-File GitHub Export (Blue Tint) -->
    <div class="glass group-card" style="background:var(--tint-blue);">
      <div style="font-weight:800; font-size:14.5px; margin-bottom:6px;">📘 Complete How-To Guide & GitHub Files</div>
      <p style="font-size:12px; color:var(--muted); margin:0 0 10px 0;">
        Read the full beginner's operating manual or export all 5 separated PWA files for GitHub Pages.
      </p>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn-mint squish" onclick="openSubPage('howto')">Open How-To Manual ↗</button>
        <button class="btn-ghost squish" onclick="openGitHubExporterModal()">📦 Get 5 GitHub Files</button>
      </div>
    </div>

    <!-- 3. Theme & Offline JSON Backup/Restore (Violet Tint) -->
    <div class="glass group-card" style="background:var(--tint-violet);">
      <div style="font-weight:800; font-size:14.5px; margin-bottom:8px;">💾 Offline Backup, Restore & Theme</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
        <button class="btn-mint squish" onclick="exportBackupJSONFile()">⬇️ Export Backup (.json)</button>
        <label class="btn-ghost squish" style="display:inline-flex; align-items:center;">
          ⬆️ Restore Backup (.json)
          <input type="file" accept=".json" style="display:none;" onchange="importBackupJSONFile(event)" />
        </label>
      </div>
      <button class="btn-ghost squish" style="width:100%;" onclick="toggleThemeMode()">
        Switch to ${state.theme === 'dark' ? 'Light Mode (#FFFFFF / #98FF98)' : 'Dark Mode (#1A1A1A / #00FFB0)'}
      </button>
    </div>
  `;
}

function renderHowToManualView() {
  return `
    <div style="margin-bottom:12px;">
      <button class="btn-ghost squish" onclick="closeSubPage()">← Back</button>
    </div>
    <div class="glass group-card" style="background:var(--tint-mint); font-size:12.5px; line-height:1.55;">
      <h2 style="margin:0 0 8px 0; font-size:18px;">📘 Complete App Operating Manual</h2>
      <p><b>1. How Total Liquid Cash Works:</b> Sums your live Checking, Savings, and Cash on Hand balances. Income adds to your chosen account(s); debit/checking purchases, credit card payments, Acorns sweeps, and stock transfers deduct from checking immediately. Credit card purchases add to your credit balance until you tap <b>↘ Pay</b>.</p>
      <p><b>2. How Daily Allowance & Rollover Work:</b> Takes your monthly income, subtracts your Savings % and Investment % goals first, and divides the remaining living pool across the days left in the current calendar month. Unspent money today automatically stays in the pool and boosts tomorrow's daily allowance!</p>
      <p><b>3. Acorns ${state.acorns.multiplier}x Round-Ups:</b> Purchases on connected accounts/cards round up to the next dollar (or $${Number(state.acorns.evenDollarPull).toFixed(2)} on even-dollar amounts), multiply by <b>${state.acorns.multiplier}x</b>, and sweep from Suncoast Checking into your Save/Invest total.</p>
      <p><b>4. Proportional Split Receipts:</b> Tap <b>+</b>, check <i>Split Receipt</i>, enter each item's pre-tax price and the final receipt total—sales tax is distributed proportionally across categories automatically.</p>
      <p><b>5. Editing, Archiving & Backing Up:</b> In <b>History</b>, filter by Merchant, Category, or Card, or tap any month/year folder. Tap <b>Edit</b> or <b>Archive</b> on any row and every balance updates immediately.</p>
    </div>
  `;
}

/* =========================================================
   BOTTOM NAVIGATION BAR (Tinted per section)
   ========================================================= */
function renderBottomNav() {
  const tabs = [
    { id: 'dashboard', icon: '⊞', label: 'Home',     tint: 'var(--tint-mint)' },
    { id: 'cards',     icon: '💳', label: 'Cards',    tint: 'var(--tint-blue)' },
    { id: 'acorns',    icon: '🌱', label: 'Invest',   tint: 'var(--tint-violet)' },
    { id: 'history',   icon: '🧾', label: 'History',  tint: 'var(--tint-amber)' },
    { id: 'plan',      icon: '📊', label: 'Plan',     tint: 'var(--tint-coral)' },
    { id: 'settings',  icon: '⚙️', label: 'Settings', tint: 'var(--tint-mint)' }
  ];
  document.getElementById('bottomNavBar').innerHTML = tabs.map(t => {
    const isAct = state.activeTab === t.id && !state.subPage;
    return `
      <button class="nav-item squish ${isAct ? 'active' : ''}" style="background:${isAct ? t.tint : 'transparent'};" onclick="switchTab('${t.id}')">
        <span style="font-size:16px;">${t.icon}</span>
        <span>${t.label}</span>
      </button>
    `;
  }).join('');
}

/* =========================================================
   MODALS (ZERO FLICKER + KEYBOARD STAY-OPEN ARCHITECTURE)
   ========================================================= */
function closeModal() {
  document.getElementById('modalContainer').innerHTML = '';
}

let qaDraft = null;
function openQuickAddModal(editId = null) {
  const existing = editId ? state.transactions.find(t => t.id === editId) : null;
  qaDraft = existing ? JSON.parse(JSON.stringify(existing)) : {
    id: null,
    type: 'expense',
    merchant: '',
    description: '',
    category: 'Food',
    amount: '',
    date: new Date().toISOString().slice(0, 16),
    sourceId: 'card_chase',
    isSplitReceipt: false,
    receiptSplits: [
      { category: 'Transportation', desc: 'Fuel', preTax: 30 },
      { category: 'Food', desc: 'Snacks', preTax: 10 }
    ],
    incomeSplits: [
      { accountId: 'chk_suncoast', amount: 2700 },
      { accountId: 'sav_hy', amount: 700 }
    ]
  };

  document.getElementById('modalContainer').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-sheet" id="modalSheetInner" onclick="event.stopPropagation()"></div>
    </div>
  `;
  renderQuickAddInner();
}

function renderQuickAddInner() {
  const sheet = document.getElementById('modalSheetInner');
  if (!sheet || !qaDraft) return;

  // Clean dropdown names (NO acorn emoji in dropdown options!)
  const allSources = [
    ...state.cards.map(c => ({ id: c.id, name: `${c.name} (${c.type})` })),
    ...state.accounts.map(a => ({ id: a.id, name: `${a.name} (${a.type})` }))
  ];

  sheet.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="margin:0; font-size:17px;">${qaDraft.id ? '✏️ Edit Transaction' : '⚡ Quick Add Transaction'}</h3>
      <button class="icon-close-btn squish" onclick="closeModal()">✕</button>
    </div>

    <div style="display:flex; gap:8px; margin-bottom:12px;">
      <button class="${qaDraft.type === 'expense' ? 'btn-mint' : 'btn-ghost'} squish" style="flex:1; padding:9px;" onclick="qaDraft.type='expense'; renderQuickAddInner()">💸 Expense</button>
      <button class="${qaDraft.type === 'income' ? 'btn-mint' : 'btn-ghost'} squish" style="flex:1; padding:9px;" onclick="qaDraft.type='income'; renderQuickAddInner()">💰 Income</button>
    </div>

    <!-- Smart Natural Language Parser -->
    <div class="glass" style="padding:10px; margin-bottom:12px; background:var(--tint-blue);">
      <label class="field-label">✨ Describe Purchase (Editable Pre-Fill)</label>
      <div style="display:flex; gap:6px;">
        <input id="qaNlInput" class="input" style="font-size:14px; padding:8px 10px;" placeholder='e.g. "45 Wawa gas using Chase" or "3400 paycheck"' />
        <button class="btn-mint squish" onclick="parseQuickAddPhrase()">Parse</button>
      </div>
    </div>

    <div class="grid-2">
      <div class="field">
        <label class="field-label">${qaDraft.isSplitReceipt ? 'Final Total w/ Tax ($)' : 'Amount ($)'}</label>
        <input class="input" type="text" inputmode="decimal" placeholder="0.00" value="${qaDraft.amount}" oninput="handleQaAmountInput(this.value)" />
      </div>
      <div class="field">
        <label class="field-label">Merchant Name</label>
        <input class="input" type="text" placeholder="Wawa, Publix, Chipotle..." value="${qaDraft.merchant}" oninput="qaDraft.merchant=this.value" />
      </div>
    </div>

    <div class="field">
      <label class="field-label">Description / Location / Memo (Separate from Merchant)</label>
      <input class="input" type="text" placeholder="Tampa, FL • Fuel & Snacks..." value="${qaDraft.description || ''}" oninput="qaDraft.description=this.value" />
    </div>

    ${qaDraft.type === 'expense' ? `
      <div class="grid-2">
        <div class="field">
          <label class="field-label">Category</label>
          <select class="select" onchange="qaDraft.category=this.value">
            ${Object.keys(state.categories).map(cat => `
              <option value="${cat}" ${qaDraft.category === cat ? 'selected' : ''}>${state.categories[cat].icon} ${cat}</option>
            `).join('')}
          </select>
        </div>
        <div class="field">
          <label class="field-label">Card / Account Used</label>
          <select class="select" onchange="qaDraft.sourceId=this.value; updateQaLivePreviews()">
            ${allSources.map(s => `<option value="${s.id}" ${qaDraft.sourceId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Proportional Tax Split Receipt -->
      <div class="glass" style="padding:11px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <label style="font-size:12px; font-weight:800; display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" ${qaDraft.isSplitReceipt ? 'checked' : ''} onchange="qaDraft.isSplitReceipt=this.checked; renderQuickAddInner()" />
            🧾 Split Receipt (Wawa Gas + Snacks w/ Proportional Tax)
          </label>
          ${qaDraft.isSplitReceipt ? `<button class="btn-ghost squish" onclick="qaDraft.receiptSplits.push({category:'Food',desc:'Item',preTax:5}); renderQuickAddInner()">+ Line</button>` : ''}
        </div>

        ${qaDraft.isSplitReceipt ? `
          <div style="margin-top:10px;">
            ${(qaDraft.receiptSplits || []).map((rs, idx) => `
              <div style="display:grid; grid-template-columns:1.1fr 1fr 0.8fr auto; gap:6px; margin-bottom:6px; align-items:center;">
                <select class="select" style="padding:7px; font-size:13px;" onchange="qaDraft.receiptSplits[${idx}].category=this.value">
                  ${Object.keys(state.categories).map(c => `<option value="${c}" ${rs.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
                <input class="input" style="padding:7px; font-size:13px;" placeholder="Item" value="${rs.desc || ''}" oninput="qaDraft.receiptSplits[${idx}].desc=this.value" />
                <input class="input" style="padding:7px; font-size:13px;" type="text" inputmode="decimal" placeholder="Pre-tax $" value="${rs.preTax !== undefined ? rs.preTax : (rs.amount || 0)}" oninput="qaDraft.receiptSplits[${idx}].preTax=this.value; updateQaLivePreviews()" />
                <button class="icon-close-btn" onclick="qaDraft.receiptSplits.splice(${idx},1); renderQuickAddInner()">✕</button>
              </div>
            `).join('')}
            <div id="qaSplitTaxPreview" style="font-size:11.5px; color:var(--primary-ink); margin-top:4px;"></div>
          </div>
        ` : ''}
      </div>

      <div id="qaAcornsPreview"></div>
    ` : `
      <!-- Income Multi-Account Split -->
      <div class="glass" style="padding:11px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:800;">Split Paycheck Across Accounts</span>
          <button class="btn-ghost squish" onclick="qaDraft.incomeSplits.push({accountId:'chk_suncoast',amount:0}); renderQuickAddInner()">+ Split</button>
        </div>
        ${(qaDraft.incomeSplits || []).map((sp, i) => `
          <div class="grid-2" style="margin-bottom:6px;">
            <select class="select" onchange="qaDraft.incomeSplits[${i}].accountId=this.value">
              ${state.accounts.map(a => `<option value="${a.id}" ${sp.accountId === a.id ? 'selected' : ''}>${a.name}</option>`).join('')}
            </select>
            <input class="input" type="text" inputmode="decimal" value="${sp.amount}" oninput="qaDraft.incomeSplits[${i}].amount=this.value" />
          </div>
        `).join('')}
      </div>
    `}

    <div class="field">
      <label class="field-label">Date & Time</label>
      <input class="input" type="datetime-local" value="${(qaDraft.date || '').slice(0, 16)}" onchange="qaDraft.date=this.value" />
    </div>

    <button class="btn-mint squish" style="width:100%; padding:13px; font-size:14.5px;" onclick="saveQuickAddTransaction()">
      💾 ${qaDraft.id ? 'Save Changes' : 'Save Transaction'}
    </button>
  `;
  updateQaLivePreviews();
}

function handleQaAmountInput(val) {
  qaDraft.amount = val;
  updateQaLivePreviews();
}

function updateQaLivePreviews() {
  if (!qaDraft) return;
  const amt = Number(qaDraft.amount) || 0;
  const acornsBox = document.getElementById('qaAcornsPreview');
  if (acornsBox) {
    const src = [...state.cards, ...state.accounts].find(s => s.id === qaDraft.sourceId);
    const ru = (qaDraft.type === 'expense' && src && src.acornsLinked && state.acorns.enabled) ? calcAcornsRoundUp(amt) : 0;
    acornsBox.innerHTML = ru > 0 ? `
      <div style="font-size:12px; padding:8px 11px; border-radius:12px; background:var(--tint-mint); margin-bottom:11px;">
        🌱 <b>Acorns ${state.acorns.multiplier}x Round-Up:</b> Pulls <b>${fmtCurrency(ru)}</b> from Suncoast Checking into Save/Invest.
      </div>
    ` : '';
  }

  const splitBox = document.getElementById('qaSplitTaxPreview');
  if (splitBox && qaDraft.isSplitReceipt && qaDraft.receiptSplits) {
    const subSum = qaDraft.receiptSplits.reduce((a, b) => a + (Number(b.preTax !== undefined ? b.preTax : b.amount) || 0), 0);
    const total = amt > 0 ? amt : subSum;
    const breakdown = qaDraft.receiptSplits.map(rs => {
      const sub = Number(rs.preTax !== undefined ? rs.preTax : rs.amount) || 0;
      const share = subSum > 0 ? (sub / subSum) * total : 0;
      return `${rs.desc || rs.category}: <b>${fmtCurrency(share)}</b>`;
    }).join(' • ');
    splitBox.innerHTML = `Proportional Tax Shares → ${breakdown}`;
  }
}

function parseQuickAddPhrase() {
  const input = document.getElementById('qaNlInput');
  if (!input || !input.value.trim()) return;
  const raw = input.value.trim();
  const numMatch = raw.match(/(\d+(\.\d+)?)/);
  if (numMatch) qaDraft.amount = parseFloat(numMatch[1]);

  const lower = raw.toLowerCase();
  if (lower.includes('paycheck') || lower.includes('salary') || lower.includes('income')) {
    qaDraft.type = 'income';
    qaDraft.category = 'Financial';
  } else {
    qaDraft.type = 'expense';
    if (lower.includes('gas') || lower.includes('wawa') || lower.includes('fuel')) qaDraft.category = 'Transportation';
    else if (lower.includes('publix') || lower.includes('grocery') || lower.includes('chipotle') || lower.includes('food')) qaDraft.category = 'Food';
    else if (lower.includes('netflix') || lower.includes('sub')) qaDraft.category = 'Subscriptions';
  }

  state.cards.forEach(c => {
    const first = c.name.split(' ')[0].toLowerCase();
    if (lower.includes(first)) qaDraft.sourceId = c.id;
  });

  qaDraft.merchant = raw.replace(/(\d+(\.\d+)?)/, '').replace(/using\s+\w+/i, '').trim() || 'Quick Entry';
  renderQuickAddInner();
}

function saveQuickAddTransaction() {
  const amt = Number(qaDraft.amount) || 0;
  if (amt <= 0) return;

  let computedSplits = null;
  if (qaDraft.type === 'expense' && qaDraft.isSplitReceipt && qaDraft.receiptSplits) {
    const subSum = qaDraft.receiptSplits.reduce((a, b) => a + (Number(b.preTax !== undefined ? b.preTax : b.amount) || 0), 0);
    computedSplits = qaDraft.receiptSplits.map(rs => {
      const sub = Number(rs.preTax !== undefined ? rs.preTax : rs.amount) || 0;
      const share = subSum > 0 ? +((sub / subSum) * amt).toFixed(2) : 0;
      return { category: rs.category, desc: rs.desc || rs.category, preTax: sub, amount: share };
    });
  }

  const entry = {
    id: qaDraft.id || ('tx_' + Date.now()),
    type: qaDraft.type,
    merchant: qaDraft.merchant || (qaDraft.type === 'income' ? 'Paycheck' : 'Purchase'),
    description: qaDraft.description || '',
    category: qaDraft.category,
    amount: amt,
    date: qaDraft.date || new Date().toISOString(),
    sourceId: qaDraft.sourceId,
    isSplitReceipt: Boolean(qaDraft.isSplitReceipt),
    receiptSplits: computedSplits,
    incomeSplits: qaDraft.type === 'income' ? qaDraft.incomeSplits : null,
    cashbackPct: qaDraft.type === 'expense' ? detectCashbackPct(qaDraft.sourceId, qaDraft.category) : 0,
    archived: false
  };

  if (qaDraft.id) {
    const idx = state.transactions.findIndex(t => t.id === qaDraft.id);
    if (idx > -1) state.transactions[idx] = entry;
  } else {
    state.transactions.unshift(entry);
    bumpStreakToday();
  }

  persistState();
  closeModal();
  renderApp();
}

/* --- EDIT / ADD CARD MODAL (With Remove Cashback Tier & Wrapping Notes) --- */
let cardDraft = null;
function openCardModal(cardId = null) {
  const ex = cardId ? state.cards.find(c => c.id === cardId) : null;
  cardDraft = ex ? JSON.parse(JSON.stringify(ex)) : {
    id: null,
    name: '',
    type: 'Credit',
    linkedAccountIds: ['chk_suncoast'],
    initialBalance: 0,
    limit: 5000,
    stdApr: 19.99,
    promoApr: '',
    promoExp: '',
    acornsLinked: true,
    notes: '',
    rotations: [{ categories: ['Food'], rate: 5, durationLabel: '1 Quarter', expDate: '2026-12-31' }]
  };

  document.getElementById('modalContainer').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-sheet" id="cardModalInner" onclick="event.stopPropagation()"></div>
    </div>
  `;
  renderCardModalInner();
}

function renderCardModalInner() {
  const sheet = document.getElementById('cardModalInner');
  if (!sheet || !cardDraft) return;

  sheet.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="margin:0; font-size:17px;">💳 ${cardDraft.id ? 'Edit Card' : 'Add Card'}</h3>
      <button class="icon-close-btn squish" onclick="closeModal()">✕</button>
    </div>

    <div class="grid-2">
      <div class="field">
        <label class="field-label">Card Name</label>
        <input class="input" value="${cardDraft.name}" oninput="cardDraft.name=this.value" />
      </div>
      <div class="field">
        <label class="field-label">Card Type</label>
        <select class="select" onchange="cardDraft.type=this.value; renderCardModalInner()">
          <option value="Credit" ${cardDraft.type === 'Credit' ? 'selected' : ''}>Credit Card</option>
          <option value="Debit" ${cardDraft.type === 'Debit' ? 'selected' : ''}>Debit Card</option>
        </select>
      </div>
    </div>

    <div class="field">
      <label class="field-label">Tied Checking Account(s)</label>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        ${state.accounts.filter(a => a.type === 'Checking').map(a => {
          const active = (cardDraft.linkedAccountIds || []).includes(a.id);
          return `<button type="button" class="${active ? 'btn-mint' : 'btn-ghost'} squish" onclick="toggleCardLinkedAcct('${a.id}')">${a.name}</button>`;
        }).join('')}
      </div>
    </div>

    ${cardDraft.type === 'Credit' ? `
      <div class="grid-2">
        <div class="field">
          <label class="field-label">Base Balance ($)</label>
          <input class="input" type="text" inputmode="decimal" value="${cardDraft.initialBalance}" oninput="cardDraft.initialBalance=this.value" />
        </div>
        <div class="field">
          <label class="field-label">Credit Limit ($)</label>
          <input class="input" type="text" inputmode="decimal" value="${cardDraft.limit}" oninput="cardDraft.limit=this.value" />
        </div>
      </div>
      <div class="grid-2">
        <div class="field">
          <label class="field-label">Standard APR (%)</label>
          <input class="input" type="text" inputmode="decimal" value="${cardDraft.stdApr}" oninput="cardDraft.stdApr=this.value" />
        </div>
        <div class="field">
          <label class="field-label">Promo APR (%) (Optional)</label>
          <input class="input" type="text" inputmode="decimal" placeholder="None" value="${cardDraft.promoApr !== null ? cardDraft.promoApr : ''}" oninput="cardDraft.promoApr=this.value" />
        </div>
      </div>
      <div class="field">
        <label class="field-label">Promo APR Expiration Date</label>
        <input class="input" type="date" value="${cardDraft.promoExp || ''}" onchange="cardDraft.promoExp=this.value" />
      </div>
    ` : ''}

    <!-- Rotating Cashback Tiers (Each with Remove Tier Button!) -->
    <div class="glass" style="padding:12px; margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div>
          <div class="field-label" style="margin:0;">★ Cashback Tiers (Rotating or Fixed)</div>
          <div style="font-size:10.5px; color:var(--muted);">Track multiple bonuses on one card (e.g. 5% Quarterly + 3% Dining)</div>
        </div>
        <button class="btn-ghost squish" onclick="cardDraft.rotations.push({categories:['Food'],rate:5,durationLabel:'1 Month',expDate:'2026-11-30'}); renderCardModalInner()">+ Cashback Tier</button>
      </div>

      ${(cardDraft.rotations || []).map((r, idx) => `
        <div style="padding:10px; border:1px solid var(--glass-border); border-radius:14px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:11.5px; font-weight:800;">Cashback Tier #${idx + 1}</span>
            <button type="button" class="btn-danger-ghost squish" onclick="cardDraft.rotations.splice(${idx},1); renderCardModalInner()">✕ Remove Tier</button>
          </div>
          <div class="grid-2">
            <div class="field">
              <label class="field-label">Cashback %</label>
              <input class="input" type="text" inputmode="decimal" value="${r.rate}" oninput="cardDraft.rotations[${idx}].rate=this.value" />
            </div>
            <div class="field">
              <label class="field-label">Duration</label>
              <select class="select" onchange="setCardRotationDuration(${idx}, this.value)">
                <option value="1 Month" ${r.durationLabel === '1 Month' ? 'selected' : ''}>1 Month</option>
                <option value="1 Quarter" ${r.durationLabel === '1 Quarter' ? 'selected' : ''}>1 Quarter (3m)</option>
                <option value="1 Year" ${r.durationLabel === '1 Year' ? 'selected' : ''}>1 Year (12m)</option>
                <option value="Custom" ${r.durationLabel.includes('Custom') ? 'selected' : ''}>Custom Months</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label class="field-label">Expiration Date</label>
            <input class="input" type="date" value="${r.expDate || ''}" onchange="cardDraft.rotations[${idx}].expDate=this.value" />
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:5px;">
            ${Object.keys(state.categories).map(cat => {
              const sel = (r.categories || []).includes(cat);
              return `<button type="button" class="${sel ? 'btn-mint' : 'btn-ghost'} squish" style="font-size:10.5px; padding:4px 9px;" onclick="toggleCardTierCat(${idx}, '${cat}')">${cat}</button>`;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="field">
      <label class="field-label">📝 Card Notes (Wraps Multi-Line Automatically)</label>
      <textarea class="textarea" placeholder="Foreign transaction fees, perks, limits..." oninput="cardDraft.notes=this.value">${cardDraft.notes || ''}</textarea>
    </div>

    <button class="btn-mint squish" style="width:100%; padding:13px;" onclick="saveCardModal()">💾 Save Card</button>
  `;
}

function toggleCardLinkedAcct(acctId) {
  const arr = cardDraft.linkedAccountIds || [];
  const i = arr.indexOf(acctId);
  if (i > -1 && arr.length > 1) arr.splice(i, 1);
  else if (i === -1) arr.push(acctId);
  cardDraft.linkedAccountIds = arr;
  renderCardModalInner();
}

function setCardRotationDuration(idx, val) {
  const d = new Date();
  if (val === '1 Month') d.setMonth(d.getMonth() + 1);
  else if (val === '1 Quarter') d.setMonth(d.getMonth() + 3);
  else if (val === '1 Year') d.setFullYear(d.getFullYear() + 1);
  else {
    const mos = parseInt(prompt('How many custom months?', '6') || '6', 10);
    d.setMonth(d.getMonth() + mos);
    val = `Custom (${mos}m)`;
  }
  cardDraft.rotations[idx].durationLabel = val;
  cardDraft.rotations[idx].expDate = d.toISOString().slice(0, 10);
  renderCardModalInner();
}

function toggleCardTierCat(idx, cat) {
  const arr = cardDraft.rotations[idx].categories || [];
  const i = arr.indexOf(cat);
  if (i > -1) arr.splice(i, 1);
  else arr.push(cat);
  cardDraft.rotations[idx].categories = arr;
  renderCardModalInner();
}

function saveCardModal() {
  if (!cardDraft.name.trim()) return;
  cardDraft.initialBalance = Number(cardDraft.initialBalance) || 0;
  cardDraft.limit = Number(cardDraft.limit) || 0;
  cardDraft.stdApr = Number(cardDraft.stdApr) || 0;
  cardDraft.promoApr = cardDraft.promoApr === '' ? null : Number(cardDraft.promoApr);

  if (cardDraft.id) {
    const idx = state.cards.findIndex(c => c.id === cardDraft.id);
    if (idx > -1) state.cards[idx] = cardDraft;
  } else {
    cardDraft.id = 'card_' + Date.now();
    state.cards.push(cardDraft);
  }
  persistState();
  closeModal();
  renderApp();
}

/* --- PAY CREDIT CARD MODAL --- */
function openPayCardModal(cardId) {
  const fin = computeFinancialPicture();
  const c = fin.enrichedCards.find(x => x.id === cardId);
  if (!c) return;
  document.getElementById('modalContainer').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-sheet" onclick="event.stopPropagation()">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0;">↘ Pay ${c.name}</h3>
          <button class="icon-close-btn squish" onclick="closeModal()">✕</button>
        </div>
        <div class="field">
          <label class="field-label">Payment Amount ($)</label>
          <input id="payCardAmtInput" class="input" type="text" inputmode="decimal" value="${c.liveBalance.toFixed(2)}" />
        </div>
        <div class="field">
          <label class="field-label">From Checking Account</label>
          <select id="payCardFromSelect" class="select">
            ${state.accounts.filter(a => a.type === 'Checking').map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
          </select>
        </div>
        <button class="btn-mint squish" style="width:100%; padding:13px;" onclick="confirmCardPaydown('${c.id}', '${c.name}')">Confirm Payment</button>
      </div>
    </div>
  `;
}

function confirmCardPaydown(cardId, cardName) {
  const amt = Number(document.getElementById('payCardAmtInput').value) || 0;
  const fromId = document.getElementById('payCardFromSelect').value;
  if (amt <= 0) return;
  state.transactions.unshift({
    id: 'tx_' + Date.now(),
    type: 'payment',
    merchant: `${cardName} Payment`,
    description: 'Credit Card Paydown',
    category: 'Financial',
    amount: amt,
    date: new Date().toISOString(),
    sourceId: fromId,
    fromAccountId: fromId,
    toCardId: cardId,
    archived: false
  });
  bumpStreakToday();
  persistState();
  closeModal();
  renderApp();
}

/* --- ACCOUNT MODAL --- */
function openAccountModal(acctId = null) {
  const ex = acctId ? state.accounts.find(a => a.id === acctId) : { id: null, name: '', type: 'Checking', initialBalance: 0, apy: 0, acornsLinked: false };
  document.getElementById('modalContainer').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-sheet" onclick="event.stopPropagation()">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0;">🏦 ${ex.id ? 'Edit Account' : 'Add Account'}</h3>
          <button class="icon-close-btn squish" onclick="closeModal()">✕</button>
        </div>
        <div class="field">
          <label class="field-label">Account Name</label>
          <input id="acctNameIn" class="input" value="${ex.name}" placeholder="Suncoast Checking..." />
        </div>
        <div class="grid-2">
          <div class="field">
            <label class="field-label">Type</label>
            <select id="acctTypeIn" class="select">
              <option value="Checking" ${ex.type === 'Checking' ? 'selected' : ''}>Checking</option>
              <option value="Savings" ${ex.type === 'Savings' ? 'selected' : ''}>Savings</option>
              <option value="Cash" ${ex.type === 'Cash' ? 'selected' : ''}>Cash on Hand</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">APY / APR (%)</label>
            <input id="acctApyIn" class="input" type="text" inputmode="decimal" value="${ex.apy}" />
          </div>
        </div>
        <div class="field">
          <label class="field-label">Starting Base Balance ($)</label>
          <input id="acctBalIn" class="input" type="text" inputmode="decimal" value="${ex.initialBalance}" />
        </div>
        <button class="btn-mint squish" style="width:100%; padding:13px;" onclick="saveAccountRecord('${ex.id || ''}')">💾 Save Account</button>
      </div>
    </div>
  `;
}

function saveAccountRecord(id) {
  const rec = {
    id: id || ('acct_' + Date.now()),
    name: document.getElementById('acctNameIn').value || 'Account',
    type: document.getElementById('acctTypeIn').value,
    apy: Number(document.getElementById('acctApyIn').value) || 0,
    initialBalance: Number(document.getElementById('acctBalIn').value) || 0,
    acornsLinked: false
  };
  if (id) {
    const idx = state.accounts.findIndex(a => a.id === id);
    if (idx > -1) state.accounts[idx] = { ...state.accounts[idx], ...rec };
  } else {
    state.accounts.push(rec);
  }
  persistState();
  closeModal();
  renderApp();
}

/* --- STOCK CONTRIBUTION & RECURRING TRANSFER MODALS --- */
function openStockContribModal() {
  document.getElementById('modalContainer').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-sheet" onclick="event.stopPropagation()">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0;">📈 Log One-Time Stock Contribution</h3>
          <button class="icon-close-btn squish" onclick="closeModal()">✕</button>
        </div>
        <div class="grid-2">
          <div class="field">
            <label class="field-label">Ticker / Fund Name</label>
            <input id="stkNameIn" class="input" placeholder="VOO, AAPL, Fidelity..." />
          </div>
          <div class="field">
            <label class="field-label">Amount ($)</label>
            <input id="stkAmtIn" class="input" type="text" inputmode="decimal" placeholder="100.00" />
          </div>
        </div>
        <div class="field">
          <label class="field-label">From Checking Account</label>
          <select id="stkSrcIn" class="select">
            ${state.accounts.filter(a => a.type === 'Checking').map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
          </select>
        </div>
        <button class="btn-mint squish" style="width:100%; padding:13px;" onclick="saveOneTimeStockBuy()">✅ Log Stock Contribution</button>
      </div>
    </div>
  `;
}

function saveOneTimeStockBuy() {
  const name = document.getElementById('stkNameIn').value || 'Stock Purchase';
  const amt = Number(document.getElementById('stkAmtIn').value) || 0;
  const srcId = document.getElementById('stkSrcIn').value;
  if (amt <= 0) return;
  state.transactions.unshift({
    id: 'tx_' + Date.now(),
    type: 'stock',
    merchant: name,
    description: 'Brokerage Stock Contribution',
    category: 'Financial',
    amount: amt,
    date: new Date().toISOString(),
    sourceId: srcId,
    archived: false
  });
  state.stocks.portfolioBalance = (Number(state.stocks.portfolioBalance) || 0) + amt;
  bumpStreakToday();
  persistState();
  closeModal();
  renderApp();
}

function openRecurringStockModal() {
  document.getElementById('modalContainer').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-sheet" onclick="event.stopPropagation()">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0;">📈 Add Recurring Stock Transfer</h3>
          <button class="icon-close-btn squish" onclick="closeModal()">✕</button>
        </div>
        <div class="grid-2">
          <div class="field">
            <label class="field-label">Stock / ETF Name</label>
            <input id="recStkName" class="input" placeholder="VOO S&P 500..." />
          </div>
          <div class="field">
            <label class="field-label">Monthly Amount ($)</label>
            <input id="recStkAmt" class="input" type="text" inputmode="decimal" placeholder="100" />
          </div>
        </div>
        <div class="grid-2">
          <div class="field">
            <label class="field-label">Day of Month (1-28)</label>
            <input id="recStkDay" class="input" type="text" inputmode="decimal" value="15" />
          </div>
          <div class="field">
            <label class="field-label">From Checking</label>
            <select id="recStkSrc" class="select">
              ${state.accounts.filter(a => a.type === 'Checking').map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <button class="btn-mint squish" style="width:100%; padding:13px;" onclick="saveRecurringStock()">💾 Save Recurring Transfer</button>
      </div>
    </div>
  `;
}

function saveRecurringStock() {
  const name = document.getElementById('recStkName').value || 'Recurring ETF';
  const amount = Number(document.getElementById('recStkAmt').value) || 0;
  const dayOfMonth = Number(document.getElementById('recStkDay').value) || 15;
  const fromAccountId = document.getElementById('recStkSrc').value;
  if (amount <= 0) return;
  state.stocks.recurringTransfers.push({ id: 'stk_' + Date.now(), name, amount, dayOfMonth, fromAccountId, autopay: true });
  persistState();
  closeModal();
  renderApp();
}

function deleteRecurringStock(id) {
  state.stocks.recurringTransfers = state.stocks.recurringTransfers.filter(s => s.id !== id);
  persistState();
  renderApp();
}

/* --- BILL MODAL --- */
function openBillModal(billId = null) {
  const ex = billId ? state.bills.find(b => b.id === billId) : { id: null, merchant: '', category: 'Subscriptions', amount: 19.99, dueDay: 15, sourceId: 'card_chase', autopay: true };
  const allSources = [...state.cards, ...state.accounts];
  document.getElementById('modalContainer').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-sheet" onclick="event.stopPropagation()">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0;">📅 ${ex.id ? 'Edit Bill' : 'Add Recurring Bill'}</h3>
          <button class="icon-close-btn squish" onclick="closeModal()">✕</button>
        </div>
        <div class="grid-2">
          <div class="field">
            <label class="field-label">Merchant (e.g. Netflix)</label>
            <input id="billMerchIn" class="input" value="${ex.merchant}" />
          </div>
          <div class="field">
            <label class="field-label">Category</label>
            <select id="billCatIn" class="select">
              ${Object.keys(state.categories).map(c => `<option value="${c}" ${ex.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="grid-2">
          <div class="field">
            <label class="field-label">Amount ($)</label>
            <input id="billAmtIn" class="input" type="text" inputmode="decimal" value="${ex.amount}" />
          </div>
          <div class="field">
            <label class="field-label">Due Day (1-31)</label>
            <input id="billDayIn" class="input" type="text" inputmode="decimal" value="${ex.dueDay}" />
          </div>
        </div>
        <div class="grid-2">
          <div class="field">
            <label class="field-label">From Card / Account</label>
            <select id="billSrcIn" class="select">
              ${allSources.map(s => `<option value="${s.id}" ${ex.sourceId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label class="field-label">Autopay (Y/N)</label>
            <select id="billAutoIn" class="select">
              <option value="true" ${ex.autopay ? 'selected' : ''}>Yes (Auto-add)</option>
              <option value="false" ${!ex.autopay ? 'selected' : ''}>No (Remind only)</option>
            </select>
          </div>
        </div>
        <button class="btn-mint squish" style="width:100%; padding:13px;" onclick="saveBillRecord('${ex.id || ''}')">💾 Save Bill</button>
      </div>
    </div>
  `;
}

function saveBillRecord(id) {
  const rec = {
    id: id || ('bill_' + Date.now()),
    merchant: document.getElementById('billMerchIn').value || 'Bill',
    category: document.getElementById('billCatIn').value,
    amount: Number(document.getElementById('billAmtIn').value) || 0,
    dueDay: Number(document.getElementById('billDayIn').value) || 1,
    sourceId: document.getElementById('billSrcIn').value,
    autopay: document.getElementById('billAutoIn').value === 'true'
  };
  if (id) {
    const idx = state.bills.findIndex(b => b.id === id);
    if (idx > -1) state.bills[idx] = rec;
  } else {
    state.bills.push(rec);
  }
  persistState();
  closeModal();
  renderApp();
}

function postBillTransactionNow(billId) {
  const b = state.bills.find(x => x.id === billId);
  if (!b) return;
  state.transactions.unshift({
    id: 'tx_' + Date.now(),
    type: 'expense',
    merchant: b.merchant,
    description: 'Recurring Bill Payment',
    category: b.category,
    amount: b.amount,
    date: new Date().toISOString(),
    sourceId: b.sourceId,
    cashbackPct: detectCashbackPct(b.sourceId, b.category),
    archived: false
  });
  bumpStreakToday();
  persistState();
  renderApp();
}

/* --- CUSTOM CATEGORY & ICON EDITOR MODAL --- */
let catDraft = null;
function openCategoryEditorModal(catName = null) {
  const existing = catName ? state.categories[catName] : null;
  catDraft = {
    originalName: catName || '',
    name: catName || '',
    icon: existing ? existing.icon : '★',
    color: existing ? existing.color : '#00FFB0',
    bucket: existing ? existing.bucket : 'want',
    limit: (catName && state.budgets[catName]) ? state.budgets[catName].limit : 250
  };

  document.getElementById('modalContainer').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-sheet" id="catModalInner" onclick="event.stopPropagation()"></div>
    </div>
  `;
  renderCategoryEditorInner();
}

function renderCategoryEditorInner() {
  const sheet = document.getElementById('catModalInner');
  if (!sheet || !catDraft) return;
  sheet.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="margin:0;">✦ ${catDraft.originalName ? 'Edit Category' : 'Add Custom Category'}</h3>
      <button class="icon-close-btn squish" onclick="closeModal()">✕</button>
    </div>

    <div class="grid-2">
      <div class="field">
        <label class="field-label">Category Name</label>
        <input class="input" value="${catDraft.name}" ${catDraft.originalName ? 'readonly' : ''} oninput="catDraft.name=this.value" placeholder="Pets, Travel, Tech..." />
      </div>
      <div class="field">
        <label class="field-label">Custom Symbol / Icon</label>
        <input id="catCustomIconInput" class="input" value="${catDraft.icon}" oninput="catDraft.icon=this.value" />
      </div>
    </div>

    <div class="field">
      <label class="field-label">Tap a Clean Symbol Preset</label>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        ${ICON_PRESETS.map(sym => `
          <button type="button" class="${catDraft.icon === sym ? 'btn-mint' : 'btn-ghost'} squish" style="width:36px; height:36px; padding:0; display:inline-flex; align-items:center; justify-content:center; font-size:16px;" onclick="catDraft.icon='${sym}'; renderCategoryEditorInner()">${sym}</button>
        `).join('')}
      </div>
    </div>

    <div class="grid-2">
      <div class="field">
        <label class="field-label">Accent Color</label>
        <input class="input" type="color" style="height:44px; padding:4px;" value="${catDraft.color}" onchange="catDraft.color=this.value" />
      </div>
      <div class="field">
        <label class="field-label">50/30/20 Bucket</label>
        <select class="select" onchange="catDraft.bucket=this.value">
          <option value="need" ${catDraft.bucket === 'need' ? 'selected' : ''}>50% Needs</option>
          <option value="want" ${catDraft.bucket === 'want' ? 'selected' : ''}>30% Wants</option>
          <option value="save" ${catDraft.bucket === 'save' ? 'selected' : ''}>20% Savings/Invest</option>
        </select>
      </div>
    </div>

    <div class="field">
      <label class="field-label">Monthly Budget Limit ($)</label>
      <input class="input" type="text" inputmode="decimal" value="${catDraft.limit}" oninput="catDraft.limit=this.value" />
    </div>

    <button class="btn-mint squish" style="width:100%; padding:13px;" onclick="saveCategoryEditor()">💾 Save Category</button>
  `;
}

function saveCategoryEditor() {
  const name = catDraft.name.trim();
  if (!name) return;
  state.categories[name] = {
    icon: catDraft.icon || '◈',
    color: catDraft.color || '#00FFB0',
    bucket: catDraft.bucket || 'want',
    subs: state.categories[name] ? state.categories[name].subs : []
  };
  state.budgets[name] = {
    limit: Number(catDraft.limit) || 250,
    rollover: state.budgets[name] ? state.budgets[name].rollover : 0
  };
  persistState();
  closeModal();
  renderApp();
}

/* =========================================================
   5-FILE GITHUB PAGES EXPORTER MODAL
   ========================================================= */
function buildFiveGitHubFiles() {
  const cssContent = document.getElementById('mainStylesheet').textContent.trim();
  const jsContent = document.getElementById('mainAppScript').textContent.trim();

  const indexHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="MintGlass" />
  <meta name="theme-color" content="#1A1A1A" id="metaThemeColor" />
  <link rel="manifest" href="manifest.json" />
  <link rel="stylesheet" href="style.css" />
  <title>MintGlass Finance</title>
</head>
<body>
<div class="app-container">
  <div class="iphone-frame">
    <main class="scroll-viewport" id="viewportMain"></main>
    <button class="fab-plus squish" onclick="openQuickAddModal()">+</button>
    <nav class="bottom-nav" id="bottomNavBar"></nav>
    <div id="modalContainer"></div>
  </div>
</div>
<script src="app.js"><\/script>
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
  }
<\/script>
</body>
</html>`;

  const swJs = `const CACHE_NAME = 'mintglass-pwa-v3';
const ASSETS = ['./', './index.html', './style.css', './app.js', './manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});`;

  const manifestJson = JSON.stringify({
    name: "MintGlass Personal Finance",
    short_name: "MintGlass",
    start_url: "./index.html",
    display: "standalone",
    background_color: "#1A1A1A",
    theme_color: "#00FFB0",
    orientation: "portrait",
    icons: [
      {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'%3E%3Crect width='180' height='180' rx='40' fill='%231A1A1A'/%3E%3Ccircle cx='90' cy='90' r='55' fill='%2300FFB0'/%3E%3C/svg%3E",
        sizes: "180x180",
        type: "image/svg+xml"
      }
    ]
  }, null, 2);

  return {
    'index.html': indexHtml,
    'style.css': cssContent,
    'app.js': jsContent,
    'sw.js': swJs,
    'manifest.json': manifestJson
  };
}

function openGitHubExporterModal() {
  const files = buildFiveGitHubFiles();
  document.getElementById('modalContainer').innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-sheet" onclick="event.stopPropagation()">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h3 style="margin:0; font-size:17px;">📦 Export 5 Files for GitHub Pages</h3>
          <button class="icon-close-btn squish" onclick="closeModal()">✕</button>
        </div>
        <p style="font-size:12px; color:var(--muted); margin:0 0 12px 0;">
          Tap <b>Download</b> or <b>Copy Code</b> for each of the 5 standalone files below and upload them to your GitHub repository.
        </p>
        ${Object.keys(files).map(fname => `
          <div class="glass" style="padding:11px 13px; margin-bottom:9px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <b style="font-size:14px;">${fname}</b>
              <div style="font-size:11px; color:var(--muted);">${(files[fname].length / 1024).toFixed(1)} KB</div>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn-ghost squish" onclick="copySingleGitHubFile('${fname}', this)">📋 Copy</button>
              <button class="btn-mint squish" onclick="downloadSingleGitHubFile('${fname}')">⬇️ Download</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function copySingleGitHubFile(fname, btnEl) {
  const files = buildFiveGitHubFiles();
  navigator.clipboard.writeText(files[fname]);
  const orig = btnEl.textContent;
  btnEl.textContent = '✓ Copied!';
  setTimeout(() => { btnEl.textContent = orig; }, 1400);
}

function downloadSingleGitHubFile(fname) {
  const files = buildFiveGitHubFiles();
  const blob = new Blob([files[fname]], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fname;
  a.click();
}

/* =========================================================
   IN-PLACE INPUT HANDLERS (NEVER CLOSES KEYBOARD OR FLICKERS)
   ========================================================= */
function handleHistorySearchInput(val) {
  state.historyFilter.search = val;
  const container = document.getElementById('historyDynamicBody');
  if (container) container.innerHTML = renderHistoryDynamicContent();
}

function updateHistoryFilterSelect(key, val) {
  state.historyFilter[key] = val;
  const container = document.getElementById('historyDynamicBody');
  if (container) container.innerHTML = renderHistoryDynamicContent();
}

function setHistoryDrillFolder(folder) {
  state.historyFilter.drillFolder = folder;
  const container = document.getElementById('historyDynamicBody');
  if (container) container.innerHTML = renderHistoryDynamicContent();
}

function toggleHistoryArchiveMode() {
  state.historyFilter.showArchived = !state.historyFilter.showArchived;
  state.historyFilter.drillFolder = null;
  renderApp();
}

function updateAcornsSetting(key, val, fullRender = false) {
  state.acorns[key] = key === 'primaryCheckingId' ? val : (Number(val) || 0);
  persistState();
  if (fullRender) {
    renderApp();
    return;
  }
  const fin = computeFinancialPicture();
  document.querySelectorAll('.acorns-mult-label').forEach(el => {
    el.textContent = `${state.acorns.multiplier}x`;
  });
  const mEl = document.getElementById('acornsMonthSweepsVal');
  if (mEl) mEl.textContent = fmtCurrency(fin.monthRoundUps);
  const sEl = document.getElementById('acornsSchedVal');
  if (sEl) sEl.textContent = fmtCurrency(fin.acornsScheduledMonthly);
}

function updateAllocatorField(key, val) {
  state.allocator[key] = Number(val) || 0;
  persistState();
  const fin = computeFinancialPicture();
  const box = document.getElementById('allocatorLiveSummary');
  if (box) box.innerHTML = renderAllocatorSummaryHTML(fin);
}

function toggleAcornsConnection(kind, id) {
  const list = kind === 'account' ? state.accounts : state.cards;
  const found = list.find(x => x.id === id);
  if (found) found.acornsLinked = !found.acornsLinked;
  persistState();
  renderApp();
}

function toggleSectionCollapse(secId) {
  state.collapsedSections[secId] = !state.collapsedSections[secId];
  persistState();
  renderApp();
}

function toggleCardNote(cardId) {
  state.expandedNotes[cardId] = !state.expandedNotes[cardId];
  renderApp();
}

function toggleDashboardTile(tileId) {
  state.expandedTile = state.expandedTile === tileId ? null : tileId;
  persistState();
  renderApp();
}

function openSubPage(page) {
  state.subPage = page;
  renderApp();
}

function closeSubPage() {
  state.subPage = null;
  renderApp();
}

function switchTab(tab) {
  state.activeTab = tab;
  state.subPage = null;
  persistState();
  renderApp();
}

function toggleThemeMode() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  persistState();
  renderApp();
}

function setSkyOverride(val) {
  state.skyOverride = val;
  persistState();
  renderApp();
}

function cycleFinancialTip() {
  state.tipIndex = (state.tipIndex + 1) % FINANCIAL_TIPS.length;
  persistState();
  renderApp();
}

function toggleNotifStack() {
  state.notifExpanded = !state.notifExpanded;
  renderApp();
}

function dismissNotification(id) {
  if (!state.dismissedNotifs.includes(id)) state.dismissedNotifs.push(id);
  persistState();
  renderApp();
}

function dismissAllNotifications() {
  const fin = computeFinancialPicture();
  fin.visibleNotifs.forEach(n => {
    if (!state.dismissedNotifs.includes(n.id)) state.dismissedNotifs.push(n.id);
  });
  persistState();
  renderApp();
}

function bumpStreakToday() {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastLoggedDate !== today) {
    state.streakDays = (Number(state.streakDays) || 0) + 1;
    state.lastLoggedDate = today;
  }
}

function logNoSpendDayStreak() {
  bumpStreakToday();
  persistState();
  renderApp();
}

function toggleArchiveTransaction(txId) {
  const tx = state.transactions.find(t => t.id === txId);
  if (tx) tx.archived = !tx.archived;
  persistState();
  const container = document.getElementById('historyDynamicBody');
  if (container && state.activeTab === 'history') {
    renderApp();
  } else {
    renderApp();
  }
}

function setDebtPayoffStrategy(strat) {
  state.debtStrategy = strat;
  persistState();
  renderApp();
}

function exportBackupJSONFile() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mintglass-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}

function importBackupJSONFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      state = JSON.parse(ev.target.result);
      persistState();
      renderApp();
    } catch (err) {
      alert('Invalid JSON backup file.');
    }
  };
  reader.readAsText(file);
}

// Initial Boot
renderApp();