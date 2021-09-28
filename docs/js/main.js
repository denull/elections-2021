const districts = Object.keys(votes).map(id => parseInt(id));
districts.sort();

// true if each district uses the same list of candidates
// (otherwise candidates object contains individual arrays for each district)
const globalCandidates = candidates instanceof Array;

let totals;
let candidatesByDistrict = {};
let candidatesSorted;
if (globalCandidates) {
  totals = new Array(candidates.length);
  candidatesSorted = new Array(candidates.length);
  for (let i = 0; i < candidates.length; i++) {
    totals[i] = 0;
    candidatesSorted[i] = i;
  }
  for (let districtId of districts) {
    candidatesByDistrict[districtId] = candidatesSorted;
    for (let data of votes[districtId]) {
      for (let i = 0; i < candidates.length; i++) {
        totals[i] += data[i + 1];
      }
    }
  }
  candidatesSorted.sort((c1, c2) => totals[c2] - totals[c1]);
} else {
  candidatesByDistrict = {};
  totals = {};
  for (let districtId of districts) {
    totals[districtId] = {};
    candidatesSorted = new Array(candidates[districtId].length);
    for (let i = 0; i < candidates[districtId].length; i++) {
      totals[districtId][i] = 0;
      candidatesSorted[i] = i;
    }
    for (let data of votes[districtId]) {
      for (let i = 0; i < candidates[districtId].length; i++) {
        totals[districtId][i] += data[i + 1];
      }
    }
    candidatesSorted.sort((c1, c2) => totals[districtId][c2] - totals[districtId][c1]);
    candidatesByDistrict[districtId] = candidatesSorted;
  }
}

let candidatesPos = {};
for (let districtId of districts) {
  let sorted = candidatesByDistrict[districtId];
  candidatesPos[districtId] = new Array(candidates.length);
  for (let i = 0; i < sorted.length; i++) {
    candidatesPos[districtId][sorted[i]] = i;
  }
}

const allColors = ["#6a3d9a","#ff7f00","#1f78b4","#b15928","#33a02c","#e31a1c","#a6cee3","#b2df8a","#fb9a99","#fdbf6f","#cab2d6","#fdd835","#a6cee3","#b2df8a"];
const sumChartEl = document.createElement('div');
sumChartEl.className = 'a-chart';
document.getElementById('app').appendChild(sumChartEl);

const columns = [['x']];
const types = { x: 'x' };
const colors = { };
const names = { };
const max = 6;
for (let i = 0; i <= max; i++) {
  columns.push(['y' + i]);
  types['y' + i] = mode;
  colors['y' + i] = allColors[i];
  if (globalCandidates) {
    names['y' + i] = i < max ? candidates[candidatesSorted[i]] : 'Остальные';
  } else { // Aggregate by final place
    names['y' + i] = i < max ? (i + 1) + (i == 2 ? '-и места' : '-е места') : 'Остальные';
  }
}
const timesCount = votes[districts[0]].length;
for (let i = 0; i < timesCount; i++) {
  const time = votes[districts[0]][i][0];
  columns[0].push(time);

  const counts = new Array(max + 1);
  counts.fill(0);
  for (let districtId of districts) {
    const row = votes[districtId][i];
    for (let i = 1; i < row.length; i++) {
      const idx = Math.min(max, candidatesPos[districtId][i - 1]);
      counts[idx] += row[i];
    }
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

  for (let i = 0; i < candidatesByDistrict[districtId].length; i++) {
    const index = candidatesByDistrict[districtId][i];
    columns.push(['y' + i]);
    colors['y' + i] = allColors[i % allColors.length];
    names['y' + i] = globalCandidates ? candidates[index] : candidates[districtId][index];
    types['y' + i] = mode;
  }

  for (let data of votes[districtId]) {
    const time = data[0];
    const counts = new Array();
    counts.fill(0);
    columns[0].push(time);
    for (let i = 0; i < candidatesByDistrict[districtId].length; i++) {
      columns[i + 1].push(data[candidatesByDistrict[districtId][i] + 1]);
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