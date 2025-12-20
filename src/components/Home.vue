<template>
  <div class="dash-page">
    <div class="container">
      <!-- Header -->
      <header class="header">
        <div class="header__left">
          <h1>대시보드</h1>
          <p class="sub">
            당월 소비 누계 · 당월 BS/PL 전월 대비 · 분기 재무 요약을 한 화면에서 확인합니다.
          </p>
        </div>

        <div class="header__right">
          <div class="seg">
            <button type="button" class="seg__btn" :class="{ on: viewMode === 'month' }" @click="viewMode='month'">
              월간
            </button>
            <button type="button" class="seg__btn" :class="{ on: viewMode === 'quarter' }" @click="viewMode='quarter'">
              분기
            </button>
          </div>
          <button class="btn btn--ghost" type="button" @click="refresh">
            새로고침(예시)
          </button>
        </div>
      </header>

      <!-- Filters -->
      <section class="card filters">
        <div class="filters__row">
          <div class="field">
            <label>기준월</label>
            <input type="month" v-model="selectedYm" />
          </div>

          <div class="field">
            <label>가계 단위</label>
            <select v-model="householdUnit">
              <option value="joint">공동</option>
              <option value="me">본인</option>
              <option value="spouse">배우자</option>
            </select>
          </div>

          <div class="field">
            <label>통화</label>
            <select v-model="currency">
              <option value="KRW">KRW</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div class="field field--actions">
            <button class="btn btn--ghost" type="button" @click="reset">
              초기화
            </button>
          </div>
        </div>
      </section>

      <!-- KPI Row -->
      <section class="kpi-grid">
        <!-- MTD Spending -->
        <div class="card kpi">
          <div class="kpi__head">
            <div>
              <div class="kpi__title">당월 소비 누계 (MTD)</div>
              <div class="kpi__sub">{{ ymLabel(selectedYm) }} · {{ unitLabel }}</div>
            </div>
            <span class="pill">Spending</span>
          </div>

          <div class="kpi__value">
            <div class="big">{{ fmt(mtd.spent) }}</div>
            <div class="meta">
              <span class="muted">예산</span>
              <span class="mono">{{ fmt(mtd.budget) }}</span>
            </div>
          </div>

          <div class="progress">
            <div class="progress__bar">
              <div class="progress__fill" :style="{ width: `${mtdPct}%` }"></div>
            </div>
            <div class="progress__meta">
              <span class="muted">집행률</span>
              <span class="mono">{{ mtdPct.toFixed(1) }}%</span>
              <span class="dot">·</span>
              <span class="muted">잔여</span>
              <span class="mono">{{ fmt(Math.max(0, mtd.budget - mtd.spent)) }}</span>
            </div>
          </div>

          <div class="mini">
            <div class="mini__row">
              <span class="muted">전월 동기간 대비</span>
              <span class="delta" :class="deltaClass(mtd.deltaPrevMonthToDate)">
                {{ deltaFmt(mtd.deltaPrevMonthToDate) }}
              </span>
            </div>
            <div class="mini__row">
              <span class="muted">당월 예상(러프)</span>
              <span class="mono">{{ fmt(mtd.forecastEndOfMonth) }}</span>
            </div>
          </div>
        </div>

        <!-- Month PL MoM -->
        <div class="card kpi">
          <div class="kpi__head">
            <div>
              <div class="kpi__title">당월 PL 전월 대비</div>
              <div class="kpi__sub">수익/비용/순이익</div>
            </div>
            <span class="pill">PL</span>
          </div>

          <div class="triple">
            <div class="triple__item">
              <div class="k">수익</div>
              <div class="v">{{ fmt(pl.revenue.cur) }}</div>
              <div class="d" :class="deltaClass(pl.revenue.diff)">
                {{ deltaFmt(pl.revenue.diff) }} ({{ pctFmt(pl.revenue.pct) }})
              </div>
            </div>
            <div class="triple__item">
              <div class="k">비용</div>
              <div class="v">{{ fmt(pl.expense.cur) }}</div>
              <div class="d" :class="deltaClass(pl.expense.diff, true)">
                {{ deltaFmt(pl.expense.diff) }} ({{ pctFmt(pl.expense.pct) }})
              </div>
            </div>
            <div class="triple__item">
              <div class="k">순이익</div>
              <div class="v">{{ fmt(pl.net.cur) }}</div>
              <div class="d" :class="deltaClass(pl.net.diff)">
                {{ deltaFmt(pl.net.diff) }} ({{ pctFmt(pl.net.pct) }})
              </div>
            </div>
          </div>

          <div class="bar3">
            <div class="bar3__row" v-for="r in plBars" :key="r.key">
              <span class="bar3__label">{{ r.label }}</span>
              <div class="bar3__bar">
                <div class="bar3__fill" :style="{ width: `${r.width}%` }"></div>
              </div>
              <span class="bar3__val mono">{{ fmt(r.value) }}</span>
            </div>
          </div>
        </div>

        <!-- Month BS MoM -->
        <div class="card kpi">
          <div class="kpi__head">
            <div>
              <div class="kpi__title">당월 BS 전월 대비</div>
              <div class="kpi__sub">자산/부채/자본</div>
            </div>
            <span class="pill">BS</span>
          </div>

          <div class="triple">
            <div class="triple__item">
              <div class="k">자산</div>
              <div class="v">{{ fmt(bs.asset.cur) }}</div>
              <div class="d" :class="deltaClass(bs.asset.diff)">
                {{ deltaFmt(bs.asset.diff) }} ({{ pctFmt(bs.asset.pct) }})
              </div>
            </div>
            <div class="triple__item">
              <div class="k">부채</div>
              <div class="v">{{ fmt(bs.liability.cur) }}</div>
              <div class="d" :class="deltaClass(bs.liability.diff, true)">
                {{ deltaFmt(bs.liability.diff) }} ({{ pctFmt(bs.liability.pct) }})
              </div>
            </div>
            <div class="triple__item">
              <div class="k">자본</div>
              <div class="v">{{ fmt(bs.equity.cur) }}</div>
              <div class="d" :class="deltaClass(bs.equity.diff)">
                {{ deltaFmt(bs.equity.diff) }} ({{ pctFmt(bs.equity.pct) }})
              </div>
            </div>
          </div>

          <div class="mini note">
            <div class="mini__row">
              <span class="muted">부채비율(예시)</span>
              <span class="mono">{{ debtRatio.toFixed(1) }}%</span>
            </div>
            <div class="mini__row">
              <span class="muted">순자산(자산-부채)</span>
              <span class="mono">{{ fmt(bs.asset.cur - bs.liability.cur) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Quarter Financial Statements -->
      <section class="card quarter">
        <div class="card__head">
          <div>
            <h2>해당 분기 재무제표 요약</h2>
            <p class="hint">
              {{ quarterLabel(selectedYm) }} · 월별 합계/스냅샷 기반 (실제 구현 시 데이터 정의에 맞춰 연결)
            </p>
          </div>
          <div class="pill">Quarter</div>
        </div>

        <div class="quarter__grid">
          <!-- Quarter PL -->
          <div class="box">
            <div class="box__head">
              <div class="box__title">분기 PL</div>
              <div class="box__sub">수익 · 비용 · 순이익</div>
            </div>

            <div class="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>월</th>
                    <th class="right">수익</th>
                    <th class="right">비용</th>
                    <th class="right">순이익</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in q.pl.rows" :key="row.ym">
                    <td class="mono">{{ row.ym }}</td>
                    <td class="right mono">{{ fmt(row.revenue) }}</td>
                    <td class="right mono">{{ fmt(row.expense) }}</td>
                    <td class="right mono">{{ fmt(row.net) }}</td>
                  </tr>
                  <tr class="sum">
                    <td>합계</td>
                    <td class="right mono">{{ fmt(q.pl.sum.revenue) }}</td>
                    <td class="right mono">{{ fmt(q.pl.sum.expense) }}</td>
                    <td class="right mono">{{ fmt(q.pl.sum.net) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Quarter BS -->
          <div class="box">
            <div class="box__head">
              <div class="box__title">분기 BS</div>
              <div class="box__sub">월말 스냅샷(예시)</div>
            </div>

            <div class="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>월</th>
                    <th class="right">자산</th>
                    <th class="right">부채</th>
                    <th class="right">자본</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in q.bs.rows" :key="row.ym">
                    <td class="mono">{{ row.ym }}</td>
                    <td class="right mono">{{ fmt(row.asset) }}</td>
                    <td class="right mono">{{ fmt(row.liability) }}</td>
                    <td class="right mono">{{ fmt(row.equity) }}</td>
                  </tr>
                  <tr class="sum">
                    <td>분기말</td>
                    <td class="right mono">{{ fmt(q.bs.last.asset) }}</td>
                    <td class="right mono">{{ fmt(q.bs.last.liability) }}</td>
                    <td class="right mono">{{ fmt(q.bs.last.equity) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mini foot">
              <div class="mini__row">
                <span class="muted">분기말 부채비율</span>
                <span class="mono">{{ qDebtRatio.toFixed(1) }}%</span>
              </div>
              <div class="mini__row">
                <span class="muted">분기 누적 순이익</span>
                <span class="mono">{{ fmt(q.pl.sum.net) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="noteLine">
          * “월별 BS”는 일반적으로 월말 스냅샷(해당 월말 잔액)을 사용하고, “월별 PL”은 해당 월 발생액 합계를 사용합니다.
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

/** 상태 */
const viewMode = ref('month'); // month | quarter
const selectedYm = ref('2025-12');
const householdUnit = ref('joint');
const currency = ref('KRW');

/** 더미 데이터 (실제 구현 시 API로 교체) */
const mtd = reactive({
  spent: 1284000,
  budget: 2000000,
  deltaPrevMonthToDate: 153000, // 전월 동기간 대비 +/-
  forecastEndOfMonth: 1860000,
});

const plRaw = reactive({
  cur: { revenue: 4500000, expense: 2380000 },
  prev: { revenue: 4200000, expense: 2550000 },
});

const bsRaw = reactive({
  cur: { asset: 31800000, liability: 12400000 },
  prev: { asset: 30500000, liability: 13100000 },
});

/** 분기 더미 (월별 PL=발생액, BS=월말 스냅샷) */
const q = reactive({
  pl: {
    rows: [
      { ym: '2025-10', revenue: 4200000, expense: 2500000, net: 1700000 },
      { ym: '2025-11', revenue: 4300000, expense: 2600000, net: 1700000 },
      { ym: '2025-12', revenue: 4500000, expense: 2380000, net: 2120000 },
    ],
    sum: { revenue: 13000000, expense: 7480000, net: 5520000 },
  },
  bs: {
    rows: [
      { ym: '2025-10', asset: 30000000, liability: 13500000, equity: 16500000 },
      { ym: '2025-11', asset: 30500000, liability: 13100000, equity: 17400000 },
      { ym: '2025-12', asset: 31800000, liability: 12400000, equity: 19400000 },
    ],
    last: { asset: 31800000, liability: 12400000, equity: 19400000 },
  },
});

/** 계산 유틸 */
function safePct(cur, prev) {
  if (!prev) return 0;
  return (cur - prev) / prev;
}
function fmt(n) {
  const sign = n < 0 ? '-' : '';
  const v = Math.abs(Math.round(n));
  const s = v.toLocaleString('ko-KR');
  return currency.value === 'KRW' ? `${sign}${s}원` : `${sign}$${(v / 1300).toFixed(0)}`; // 단순 예시
}
function pctFmt(p) {
  const val = p * 100;
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}
function deltaFmt(n) {
  const sign = n > 0 ? '+' : '';
  return `${sign}${fmt(n)}`;
}
function deltaClass(n, inverted = false) {
  // inverted: 비용/부채처럼 증가가 안좋은 항목은 색 반전
  if (n === 0) return 'flat';
  const up = n > 0;
  if (!inverted) return up ? 'up' : 'down';
  return up ? 'down' : 'up';
}
function ymLabel(ym) {
  const [y, m] = ym.split('-');
  return `${y}년 ${Number(m)}월`;
}
function quarterLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  const q = Math.floor((m - 1) / 3) + 1;
  return `${y}년 ${q}분기`;
}

const unitLabel = computed(() => {
  if (householdUnit.value === 'joint') return '공동';
  if (householdUnit.value === 'me') return '본인';
  if (householdUnit.value === 'spouse') return '배우자';
  return '-';
});

/** KPI 계산 */
const mtdPct = computed(() => {
  if (!mtd.budget) return 0;
  return Math.min(100, (mtd.spent / mtd.budget) * 100);
});

const pl = computed(() => {
  const curRev = plRaw.cur.revenue;
  const curExp = plRaw.cur.expense;
  const prevRev = plRaw.prev.revenue;
  const prevExp = plRaw.prev.expense;

  const curNet = curRev - curExp;
  const prevNet = prevRev - prevExp;

  return {
    revenue: { cur: curRev, prev: prevRev, diff: curRev - prevRev, pct: safePct(curRev, prevRev) },
    expense: { cur: curExp, prev: prevExp, diff: curExp - prevExp, pct: safePct(curExp, prevExp) },
    net: { cur: curNet, prev: prevNet, diff: curNet - prevNet, pct: safePct(curNet, prevNet) },
  };
});

const bs = computed(() => {
  const curA = bsRaw.cur.asset;
  const curL = bsRaw.cur.liability;
  const prevA = bsRaw.prev.asset;
  const prevL = bsRaw.prev.liability;

  const curE = curA - curL;
  const prevE = prevA - prevL;

  return {
    asset: { cur: curA, prev: prevA, diff: curA - prevA, pct: safePct(curA, prevA) },
    liability: { cur: curL, prev: prevL, diff: curL - prevL, pct: safePct(curL, prevL) },
    equity: { cur: curE, prev: prevE, diff: curE - prevE, pct: safePct(curE, prevE) },
  };
});

const debtRatio = computed(() => (bs.value.equity.cur ? (bs.value.liability.cur / bs.value.equity.cur) * 100 : 0));
const qDebtRatio = computed(() => (q.bs.last.equity ? (q.bs.last.liability / q.bs.last.equity) * 100 : 0));

/** PL mini bar (상대 폭) */
const plBars = computed(() => {
  const items = [
    { key: 'revenue', label: '수익', value: pl.value.revenue.cur },
    { key: 'expense', label: '비용', value: pl.value.expense.cur },
    { key: 'net', label: '순이익', value: pl.value.net.cur },
  ];
  const max = Math.max(...items.map(x => Math.abs(x.value))) || 1;
  return items.map(x => ({
    ...x,
    width: Math.min(100, (Math.abs(x.value) / max) * 100),
  }));
});

/** 액션 */
function reset() {
  selectedYm.value = '2025-12';
  householdUnit.value = 'joint';
  currency.value = 'KRW';
}
function resetFilters() {
  reset();
}
function refresh() {
  alert('새로고침(예시): 실제 구현에서는 API 재호출로 교체하세요.');
}
function exportJson() {
  alert('내보내기(예시): 실제 구현에서는 CSV/JSON 다운로드로 연결하세요.');
}
</script>

<style lang="scss" scoped>
.dash-page {
  background: #f5f6fa;
  min-height: 100vh;
  padding: 24px 0;
}

.container {
  width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 14px;

  h1 {
    margin: 0 0 4px;
    font-size: 1.5rem;
  }
  .sub {
    margin: 0;
    color: #6b7280;
    font-size: 0.86rem;
    max-width: 820px;
  }

  .header__right {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
}

/* Cards */
.card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e9edf5;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
}

/* Segmented */
.seg {
  display: inline-flex;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  overflow: hidden;
  background: #fff;

  .seg__btn {
    border: none;
    background: transparent;
    padding: 8px 12px;
    font-weight: 900;
    font-size: 0.84rem;
    cursor: pointer;
    color: #4b5563;

    &.on {
      background: #edf2ff;
      color: #1d3a8a;
    }
  }
}

/* Filters */
.filters {
  padding: 14px 16px 12px;
  margin-bottom: 16px;

  .filters__row {
    display: flex;
    gap: 12px;
    align-items: flex-end;
  }

  .field {
    display: flex;
    flex-direction: column;
    flex: 1;

    &--actions {
      flex: 0 0 120px;
      align-items: flex-end;
    }

    label {
      margin-bottom: 4px;
      font-size: 0.8rem;
      color: #4b5563;
    }

    input, select {
      border: 1px solid #d1d5db;
      border-radius: 10px;
      padding: 9px 10px;
      font-size: 0.92rem;
      outline: none;

      &:focus {
        border-color: #4b74ff;
        box-shadow: 0 0 0 1px rgba(75,116,255,0.18);
      }
    }
  }
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.kpi {
  padding: 14px 16px 14px;

  .kpi__head {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .kpi__title {
    font-weight: 900;
    font-size: 0.98rem;
    color: #111827;
    margin-bottom: 2px;
  }
  .kpi__sub {
    font-size: 0.78rem;
    color: #6b7280;
  }

  .kpi__value {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 10px;
    margin-bottom: 12px;

    .big {
      font-size: 1.35rem;
      font-weight: 1000;
      color: #111827;
      letter-spacing: -0.2px;
    }
    .meta {
      display: inline-flex;
      gap: 6px;
      align-items: baseline;
      .muted { color: #9ca3af; font-size: 0.78rem; }
      .mono { font-weight: 900; }
    }
  }
}

.pill {
  font-size: 0.75rem;
  padding: 2px 10px;
  border-radius: 999px;
  background: #e4ebff;
  color: #3848c7;
  font-weight: 900;
  flex: 0 0 auto;
}

.progress {
  .progress__bar {
    height: 10px;
    background: #f3f4f6;
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
  }
  .progress__fill {
    height: 100%;
    background: #4b74ff;
    border-radius: 999px;
  }
  .progress__meta {
    margin-top: 8px;
    font-size: 0.82rem;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;

    .muted { color: #9ca3af; font-weight: 900; }
    .mono { font-weight: 1000; color: #111827; }
    .dot { color: #d1d5db; margin: 0 2px; }
  }
}

.mini {
  margin-top: 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 10px;

  &.note { margin-top: 12px; }

  .mini__row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    font-size: 0.82rem;

    & + & { margin-top: 8px; }

    .muted { color: #6b7280; font-weight: 900; }
    .mono { font-weight: 1000; color: #111827; }
  }
}

.delta {
  font-weight: 1000;
  &.up { color: #166534; }
  &.down { color: #b91c1c; }
  &.flat { color: #6b7280; }
}

/* Triple stats */
.triple {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;

  .triple__item {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px;

    .k { font-size: 0.78rem; color: #6b7280; font-weight: 900; margin-bottom: 6px; }
    .v { font-weight: 1000; color: #111827; margin-bottom: 4px; }
    .d { font-size: 0.78rem; font-weight: 1000; }
    .d.up { color: #166534; }
    .d.down { color: #b91c1c; }
    .d.flat { color: #6b7280; }
  }
}

/* Mini bars */
.bar3 {
  display: grid;
  gap: 8px;

  .bar3__row {
    display: grid;
    grid-template-columns: 56px 1fr 110px;
    gap: 10px;
    align-items: center;
    font-size: 0.82rem;
  }

  .bar3__label { color: #6b7280; font-weight: 900; }
  .bar3__bar {
    height: 10px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
  }
  .bar3__fill {
    height: 100%;
    background: #4b74ff;
    border-radius: 999px;
  }
}

/* Quarter */
.quarter {
  padding: 0 0 14px;
  .card__head {
    padding: 14px 16px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 { margin: 0; font-size: 1rem; }
    .hint { margin: 3px 0 0; font-size: 0.78rem; color: #6b7280; }
  }

  .quarter__grid {
    padding: 0 16px 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .box {
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    overflow: hidden;
    background: #fff;

    .box__head {
      padding: 10px 12px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      .box__title { font-weight: 1000; }
      .box__sub { font-size: 0.78rem; color: #6b7280; margin-top: 2px; }
    }
  }

  .tableWrap {
    overflow: auto;

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 520px;

      th, td {
        padding: 9px 10px;
        border-bottom: 1px solid #e5e7eb;
        text-align: left;
      }
      th {
        background: #f3f4f6;
        font-size: 0.78rem;
        font-weight: 1000;
        color: #4b5563;
      }
      .right { text-align: right; }
      .mono { font-weight: 1000; }

      tr.sum td {
        background: #f9fafb;
        font-weight: 1000;
      }
    }
  }

  .mini.foot {
    margin: 10px 12px 12px;
  }

  .noteLine {
    padding: 0 16px;
    color: #9ca3af;
    font-size: 0.78rem;
  }
}

.btn {
  border-radius: 999px;
  border: none;
  padding: 9px 14px;
  font-size: 0.86rem;
  font-weight: 1000;
  cursor: pointer;

  &--primary { background: #4b74ff; color: #fff; }
  &--ghost { background: #fff; border: 1px solid #d1d5db; color: #4b5563; }
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

@media (max-width: 520px) {
  .container { width: 100%; padding: 0 12px; }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters .filters__row {
    flex-direction: column;
    align-items: stretch;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .triple {
    grid-template-columns: 1fr;
  }

  .quarter .quarter__grid {
    grid-template-columns: 1fr;
  }

  .quarter .box table {
    min-width: 560px; /* 모바일 가로스크롤 */
  }
}
</style>
