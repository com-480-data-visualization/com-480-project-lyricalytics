const spotifyRadarColumns = [
    'Spotify Popularity', 'Duration (up to 10 minutes)', 'Danceability', 'Energy',
    'Loudness', 'Mode (from Minor to Major)', 'Speechiness', 'Acousticness',
    'Instrumentalness', 'Liveness', 'Valence', 'Tempo', 'Time Signature (Beats per Bar)'
  ];

  let allSongsData = [], allMean = [], normalizedAllMean = [];
  const normalizedCache = {};  // Cache for emotion-normalized values
  let updatePending = false;

  const emotionColors = {
    "admiration": "#F3BBBE", "amusement": "#F7B881", "anger": "#B32E2B", "annoyance": "#D27167",
    "approval": "#8AB0AA", "caring": "#CD8039", "confusion": "#635F5A", "curiosity": "#61AEBD",
    "desire": "#EF854D", "disappointment": "#856252", "disapproval": "#8A6F24", "disgust": "#70742D",
    "embarrassment": "#FCC337", "excitement": "#D09F40", "fear": "#090001", "gratitude": "#C8CB66",
    "joy": "#F5E9D1", "love": "#DA8798", "nervousness": "#497890", "optimism": "#B7D1D3",
    "pride": "#935354", "realization": "#193267", "remorse": "#9F7856", "sadness": "#042040",
    "surprise": "#1A404D"
  };

  d3.csv("/assets/data/radar.csv").then(function(data) {
    allSongsData = data;
    allMean = calculateMeanValues(data);
    normalizedAllMean = normalizeValues(allMean, data);
    createEmotionCheckboxes(data);
    plotRadarChart([
      createTrace('All Songs', normalizedAllMean, 'black')
    ]);
  });

  function calculateMeanValues(songs) {
    return spotifyRadarColumns.map(col =>
      songs.reduce((acc, song) => acc + (parseFloat(song[col]) || 0), 0) / songs.length
    );
  }

  function normalizeValues(values, songs) {
    return values.map((value, i) => {
      const vals = songs.map(song => parseFloat(song[spotifyRadarColumns[i]]) || 0);
      const min = Math.min(...vals), max = Math.max(...vals);
      return max === min ? 0.5 : (value - min) / (max - min);
    });
  }

  function createEmotionCheckboxes(data) {
    const container = document.getElementById('checkbox-container');
    const emotions = [...new Set(data.map(d => d.top_emotion))].sort();
    const fragment = document.createDocumentFragment();

    emotions.forEach(emotion => {
      const li = document.createElement('li');
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = emotion;
      checkbox.id = `checkbox-${emotion}`;
      checkbox.addEventListener('change', scheduleRadarUpdate);

      label.htmlFor = checkbox.id;
      label.textContent = emotion;
      label.style.color = emotionColors[emotion] || '#333';

      checkbox.onclick = function() {
        og_text_color = label.style.color
        label.style.color = label.style.backgroundColor
        label.style.backgroundColor = og_text_color
      }

      li.appendChild(checkbox);
      li.appendChild(label);
      fragment.appendChild(li);
    });

    container.appendChild(fragment);
  }

  function scheduleRadarUpdate() {
    if (!updatePending) {
      updatePending = true;
      requestAnimationFrame(() => {
        updateRadarChart();
        updatePending = false;
      });
    }
  }

  function updateRadarChart() {
    const selected = Array.from(document.querySelectorAll('#checkbox-container input:checked')).map(cb => cb.value);
    const traces = [createTrace('All Songs', normalizedAllMean, 'black')];

    selected.forEach(emotion => {
      if (!normalizedCache[emotion]) {
        const filtered = allSongsData.filter(song => song.top_emotion === emotion);
        const mean = calculateMeanValues(filtered);
        normalizedCache[emotion] = normalizeValues(mean, allSongsData);
      }
      traces.push(createTrace(emotion, normalizedCache[emotion], emotionColors[emotion] || '#000'));
    });

    plotRadarChart(traces);
  }

  function createTrace(name, values, color) {
    return {
      type: 'scatterpolar',
      r: values,
      theta: spotifyRadarColumns,
      fill: 'toself',
      name,
      line: { color, width: 2 }
    };
  }

  function plotRadarChart(traces) {
    Plotly.newPlot('plotly-chart', traces, {
      responsive: true,
      polar: { radialaxis: { visible: true, range: [0, 1] } },
      // legend: { orientation: 'h' },
      margin: { t: 30, b: 30 }
    });
  }