// app.js —— 消费记账看板
const state = { data: null };
let pieChart = null;
let lineChart = null;

// 内嵌回退数据：当 fetch 在 file:// 下被浏览器拦截时使用，保证页面可直接打开
const fallbackData = {
  "title": "个人消费记账月报",
  "months": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月"],
  "categories": [
    { "name": "餐饮", "amounts": [1200, 1350, 1100, 1280, 1420, 1380, 1500, 1450] },
    { "name": "交通", "amounts": [300, 280, 320, 310, 290, 350, 400, 380] },
    { "name": "购物", "amounts": [800, 650, 900, 720, 1100, 850, 600, 980] },
    { "name": "娱乐", "amounts": [400, 550, 480, 600, 420, 700, 580, 650] },
    { "name": "其他", "amounts": [200, 180, 250, 220, 300, 190, 240, 210] }
  ]
};

// 渲染统一入口
const showData = (data) => {
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
};

// 加载本地 JSON 数据（含加载中 / 失败 / 空数据三态处理）
// 优先 fetch 远程/本地 JSON；若因 file:// 协议被拦截，回退到内嵌数据保证页面可打开
const loadData = async () => {
  $('#status').text('加载中...').show();
  try {
    const response = await fetch('data/expenses.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    showData(data);
  } catch (error) {
    // fetch 失败（如 file:// 协议拦截）时回退到内嵌数据，页面仍可正常展示
    showData(fallbackData);
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

// ECharts 饼图：各品类消费占比（适合展示比例关系）
const renderPieChart = (data) => {
  if (pieChart === null) {
    pieChart = echarts.init(document.querySelector('#pie-chart'));
  }
  const pieData = data.categories.map(c => ({
    name: c.name,
    value: c.amounts.reduce((sum, n) => sum + n, 0)
  }));
  pieChart.setOption({
    title: { text: '各品类消费占比', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c} 元 ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      name: '消费占比',
      type: 'pie',
      radius: ['40%', '70%'],
      data: pieData,
      label: { formatter: '{b}\n{d}%' }
    }]
  });
};

// Chart.js 折线图：月度消费趋势（适合展示时间变化）
const renderLineChart = (data) => {
  if (lineChart !== null) {
    lineChart.destroy();
  }
  const ctx = document.querySelector('#line-chart');
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.months,
      datasets: data.categories.map(c => ({
        label: c.name,
        data: c.amounts,
        borderWidth: 1
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: '月度消费趋势（单位：元）' }
      }
    }
  });
};

// jQuery 事件委托：点击卡片切换高亮
$('#cards').on('click', '.card', function () {
  $(this).toggleClass('border-primary shadow');
});

// 窗口缩放：ECharts 需手动 resize，Chart.js 响应式自动处理
window.addEventListener('resize', () => {
  if (pieChart) pieChart.resize();
});

loadData();
