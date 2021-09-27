const candidateByCode = {};
const districts = [];
const candidatesByDistrict = {};
for (let id in candidates) {
  const candidate = candidates[id];
  if (!(candidate.district_id in candidatesByDistrict)) {
    districts.push(candidate.district_id);
    candidatesByDistrict[candidate.district_id] = [];
  }
  candidatesByDistrict[candidate.district_id].push(candidate);
  candidateByCode[candidate.code] = candidate;
}
districts.sort();

const totals = {};
for (let pt of votesDeg) {
  const votes = pt[1];
  for (let code in votes) {
    totals[code] = (totals[code] || 0) + votes[code];
  }
}

for (let districtId in candidatesByDistrict) {
  candidatesByDistrict[districtId].sort((c1, c2) => totals[c2.code] - totals[c1.code]);
  for (let i = 0; i < candidatesByDistrict[districtId].length; i++) {
    candidatesByDistrict[districtId][i].pos = i;
  }
}

const allColors = ["#6a3d9a","#ff7f00","#1f78b4","#b15928","#33a02c","#e31a1c","#a6cee3","#b2df8a","#fb9a99","#fdbf6f","#cab2d6","#fdd835","#a6cee3","#b2df8a"];
const sumChartEl = document.createElement('div');
sumChartEl.className = 'a-chart';
document.getElementById('app').appendChild(sumChartEl);

const seconds = ['06', '10', '19', '25', '36', '41', '47', '54', '62', '70', '76', '87', '8e', '9b', 'a8'];

const columns = [['x']];
const types = { x: 'x' };
const colors = { };
const names = { };
const max = 6;
for (let i = 0; i <= max; i++) {
  columns.push(['y' + i]);
  types['y' + i] = mode;
  colors['y' + i] = allColors[i];
  names['y' + i] = i < max ? (i + 1) + (i == 2 ? '-и места' : '-е места') : 'Остальные';
}
for (let pt of votesDeg) {
  const time = pt[0];
  const votes = pt[1];
  columns[0].push(time);
  const counts = new Array(max + 1);
  for (let i = 0; i <= max; i++) {
    counts[i] = 0;
  }
  for (let code in votes) {
    let idx = Math.min(max, candidateByCode[code].pos);
    counts[idx] += votes[code];
  }
  for (let i = 0; i < counts.length; i++) {
    columns[i + 1].push(counts[i]);
  }
}

const sumChart = new AChart(sumChartEl, {
  title: 'Вся Москва',
  percentage: mode == 'area',
  stacked: mode != 'line',
  colors,
  columns,
  types,
  names,
});

for (let districtId of districts) {
  const chartEl = document.createElement('div');
  chartEl.className = 'a-chart';
  document.getElementById('app').appendChild(chartEl);

  const columns = [['x']];
  const types = { x: 'x' };
  const colors = {};
  const names = {};

  const candIndex = {};
  for (let i = 0; i < candidatesByDistrict[districtId].length; i++) {
    const candidate = candidatesByDistrict[districtId][i];
    candIndex[candidate.code] = i;
    columns.push(['y' + i]);
    colors['y' + i] = allColors[i % allColors.length];
    names['y' + i] = candidate.name;
    types['y' + i] = mode;
  }

  for (let pt of votesDeg) {
    const time = pt[0];
    const votes = pt[1];
    const counts = new Array(candidatesByDistrict[districtId].length);
    for (let i = 0; i < counts.length; i++) {
      counts[i] = 0;
    }
    columns[0].push(time);
    for (let code in votes) {
      if (code in candIndex) {
        counts[candIndex[code]] = votes[code];
      }
    }
    for (let i = 0; i < counts.length; i++) {
      columns[i + 1].push(counts[i]);
    }
  }

  const chart = new AChart(chartEl, {
    title: 'Округ ' + districtId,
    percentage: mode == 'area',
    stacked: mode != 'line',
    colors,
    columns,
    types,
    names,
  });
}