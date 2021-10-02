
const allColors = ["#6a3d9a","#ff7f00","#1f78b4","#b15928","#33a02c","#e31a1c","#a6cee3","#b2df8a","#fb9a99","#fdbf6f","#cab2d6","#fdd835","#a6cee3","#b2df8a"];

let chart;
const keypoints = [
  { shortText: '1', text: 'Начало голосования', t: Date.parse('2021-09-17 08:00:00+0300'), closest: 0 },
  { shortText: '2', text: 'Перезапуск?', t: Date.parse('2021-09-18 13:30:00+0300'), closest: 0 },
  { shortText: '3', text: 'Конец голосования', t: Date.parse('2021-09-19 20:00:00+0300'), closest: 0 },
];

function makeChart(lagInit, lagData) {
  const chartEl = document.createElement('div');
  chartEl.className = 'chart';
  document.getElementById('app').appendChild(chartEl);
  
  const columns = [['x'], ['y']];
  const types = { x: 'x', y: 'line' };
  const colors = { y: '#6a3d9a' };
  const names = { y: 'Время генерации блока'};
  
  let time = lagInit; // first block timestamp
  let data = [];
  for (let lag of lagData) {
    columns[0].push(Math.floor(time / 1000));
    columns[1].push(lag);
    data.push([new Date(time), lag / 1000]);
    for (let kp of keypoints) {
      if (Math.abs(kp.t - time) < Math.abs(kp.t - kp.closest)) {
        kp.closest = time;
      }
    }
    time += lag;
  }
  
  /*
  new AChart(chartEl, {
    title: 'Одномандатные выборы',
    percentage: false,
    stacked: false,
    colors,
    columns,
    types,
    names,
  });
  */
  chart = new Dygraph(chartEl, data, {
    width: chartEl.clientWidth,
    height: 500,
    color: '#33a02c',
    legend: 'always',
    labels: ['время', 't'],
    logscale: true,
  });
}

function toggleLogscale(value) {
  chart.updateOptions({ logscale: value });
}

makeChart(lagInit, lagData);
chart.setAnnotations(keypoints.map(kp => ({
  series: 't',
  x: kp.closest,
  shortText: kp.shortText,
  text: kp.text,
  tickHeight: 220,
  tickColor: '#b15928',
  attachAtBottom: true,
})));