// app.js —— 消费记账看板
const state = { data: null };
let pieChart = null;
let lineChart = null;

// 加载本地 JSON 数据（含加载中 / 失败 / 空数据三态处理）
const loadData = async () => {
  $('#status').text('加载中...').show();
  try {
    const response = await fetch('data/expenses.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (!data.categories || data.categories.length === 0) {
      $('#status').text('暂无数据').show();
      return;
    }
    state.data = data;
    $('#sub-title').text(data.title + ' · 数据来源：课程统一数据集');
    $('#status').hide();
    renderCards(data);
    renderPieChart(data);
    renderLineChart(data);
  } catch (error) {
    $('#status').text('加载失败：' + error.message).show();
  }
};

// 统计卡片：总支出、月均、最高品类、记录月份数
const renderCards = (data) => {
  const months = data.months.length;
  const totals = data.categories.map(c => ({
    name: c.name,
    total: c.amounts.reduce((sum, n) => sum + n, 0)
  }));
  const grandTotal = totals.reduce((sum, t) => sum + t.total, 0);
  const topCat = totals.reduce((max, t) => (t.total > max.total ? t : max), totals[0]);

  const cards = [
    { title: '累计总支出', value: grandTotal.toLocaleString() + ' 元', sub: '共' + months + '个月' },
    { title: '月均支出', value: Math.round(grandTotal / months).toLocaleString() + ' 元', sub: '平均每月' },
    { title: '最高支出品类', value: topCat.name, sub: topCat.total.toLocaleString() + ' 元' },
    { title: '记录月份数', value: months + ' 个月', sub: '一月至八月' }
  ];
  cards.forEach(c => {
    $('#cards').append(`
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title h6">${c.title}</h3>
            <p class="card-text fs-4">${c.value}</p>
            <p class="card-text small text-muted">${c.sub}</p>
          </div>
        </div>
      </div>
    `);
  });
};

// 图表占位：后续步骤实现
const renderPieChart = (data) => {};
const renderLineChart = (data) => {};

loadData();
