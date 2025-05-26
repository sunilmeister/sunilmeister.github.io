// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// common filters used for waveform processing

function median(values) {
  if (values.length === 0) return 0;
  values = [...values].sort((a, b) => a - b);
  const half = Math.floor(values.length / 2);
  return values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2;
}

function medianFilter1D(data, windowSize = 3) {
  const halfWindow = Math.floor(windowSize / 2);
  const result = [];
  for (let i = 0; i < data.length; i++) {
    let win = [];
    for (let j = i - halfWindow; j <= i + halfWindow; j++) {
      if (j >= 0 && j < data.length) win.push(data[j]);
    }
    result.push(median(win));
  }
  return result;
}

function movingAverageFilter(samples, order = 3) {
  let filteredSamples = [];
  let win = order;

  for (let i = 0; i < samples.length; i++) {
    if ((i+1) < order) {
        win = i+1;
    } else {
        win = order;
    }
    let sum = 0;
    for (let j = 0; j < win; j++) {
        sum += samples[i-j];
    }
    filteredSamples.push(sum / win);
  }

  return filteredSamples;
}
