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

/*
function movingAverageFilter(data, windowSize = 3) {
  if (data.length < windowSize) return [];
  let result = [];
  let sum = 0;
  // Initialize the first window
  for (let i = 0; i < windowSize; i++) {
    sum += data[i];
  }
  result.push(sum / windowSize);
  // Slide the window and compute the moving average
  for (let i = windowSize; i < data.length; i++) {
    sum += data[i] - data[i - windowSize];
    result.push(sum / windowSize);
  }
  return result;
}
*/

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
