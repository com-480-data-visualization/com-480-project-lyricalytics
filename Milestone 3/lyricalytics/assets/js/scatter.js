const spotifyScatterColumns = ['Spotify Popularity', 'Duration (up to 10 minutes)', 'Danceability', 'Energy', 'Loudness', 'Speechiness', 'Acousticness', 'Instrumentalness', 'Liveness', 'Valence', 'Tempo'];


d3.csv("/assets/data/scatter.csv").then(function(data) {
    createTopHitPlots(data);
});

function createTopHitPlots(data) {
    const container = document.getElementById('violin-plot');
    const numPlots = spotifyScatterColumns.length;
    const plotSpacing = 2.5;

    let globalMin = Infinity, globalMax = -Infinity;
    spotifyScatterColumns.forEach(feature => {
    const raw = data.map(d => parseFloat(d[feature])).filter(v => !isNaN(v));
    const min = Math.min(...raw);
    const max = Math.max(...raw);
    const values = raw.map(v => (max === min) ? 0.5 : (v - min) / (max - min));
    globalMin = Math.min(globalMin, ...values);
    globalMax = Math.max(globalMax, ...values);
    });

    const rangeY = globalMax - globalMin;

    const layout = {
    margin: { t: 60, l: 40, r: 30, b: 100 },
    autosize: true,
    showlegend: true,
    annotations: [],
    yaxis: {
        title: '',
        zeroline: false,
        showticklabels: true,
        ticks: 'outside',
        range: [globalMin - 0.05 * rangeY, globalMax + 0.05 * rangeY]
    },
    xaxis: {
        showgrid: false,
        zeroline: false,
        showticklabels: false,
        range: [-1, plotSpacing * numPlots],
    }
    };

    const traces = [];

    spotifyScatterColumns.forEach((feature, index) => {
    const xOffset = index * plotSpacing;
    const raw = data.map(d => parseFloat(d[feature])).filter(v => !isNaN(v));
    const min = Math.min(...raw);
    const max = Math.max(...raw);

    const values = raw.map(v => (max === min) ? 0.5 : (v - min) / (max - min));
    const steps = 200;
    const ySamples = Array.from({ length: steps }, (_, i) =>
        globalMin + (i / (steps - 1)) * rangeY
    );

    // Separate top hits and non-top hits
    const topHitValues = data.filter(d => d.top_hit === "True").map(d => {
        const val = parseFloat(d[feature]);
        return isNaN(val) ? null : (max === min ? 0.5 : (val - min) / (max - min));
    }).filter(v => v !== null);

    const bandwidth = 1.06 * d3.deviation(topHitValues) * Math.pow(topHitValues.length, -1 / 5);

    // Density for top hits only
    const topHitDensity = ySamples.map(y => {
        let sum = 0;
        for (let v of topHitValues) {
        const u = (y - v) / bandwidth;
        sum += Math.exp(-0.5 * u * u);
        }
        return sum / (topHitValues.length * bandwidth * Math.sqrt(2 * Math.PI));
    });

    // Compute density for all data
    const totalValues = data.map(d => {
        const val = parseFloat(d[feature]);
        return isNaN(val) ? null : (max === min ? 0.5 : (val - min) / (max - min));
    }).filter(v => v !== null);
    const totalDensity = ySamples.map(y => {
        let sum = 0;
        for (let v of totalValues) {
        const u = (y - v) / bandwidth;
        sum += Math.exp(-0.5 * u * u);
        }
        return sum / (totalValues.length * bandwidth * Math.sqrt(2 * Math.PI));
    });

    const maxDensity = Math.max(...topHitDensity);
    const yStepSize = ySamples[1] - ySamples[0];

    const topX = [], topY = [], nonX = [], nonY = [];

    data.forEach(d => {
        const val = parseFloat(d[feature]);
        if (isNaN(val)) return;

        const normVal = (val - min) / (max - min);
        const idx = Math.floor((normVal - globalMin) / yStepSize);
        const j = Math.max(0, Math.min(steps - 2, idx));
        const t = (normVal - ySamples[j]) / yStepSize;

        if (d.top_hit === "True") {

        const dY = topHitDensity[j] + t * (topHitDensity[j + 1] - topHitDensity[j]);
        const normDensity = dY / maxDensity;
        const jitter = (Math.random() - 0.5) * normDensity;

        const x = xOffset + jitter;

        topX.push(x);
        topY.push(normVal);
        } else {

        const dY = totalDensity[j] + t * (totalDensity[j + 1] - totalDensity[j]);
        const normDensity = dY / maxDensity;
        const jitter = (Math.random() - 0.5) * normDensity;

        const x = xOffset + jitter;

        nonX.push(x);
        nonY.push(normVal);
        }
    });

    // Top hit scatter
    traces.push({
        type: 'scatter',
        mode: 'markers',
        x: topX,
        y: topY,
        marker: { color: '#935354', size: 4, opacity: 0.7 },
        name: 'Top Hits',
        showlegend: index === 0,
        xaxis: 'x',
        yaxis: 'y'
    });

    // // Non-top hit scatter
    // traces.push({
    //   type: 'scatter',
    //   mode: 'markers',
    //   x: nonX,
    //   y: nonY,
    //   marker: { color: '#aaa', size: 3, opacity: 0.3 },
    //   name: 'Others',
    //   showlegend: index === 0,
    //   xaxis: 'x',
    //   yaxis: 'y'
    // });

    // Violin (still based on full data)
    const violinX = [];
    const violinY = [];

    for (let i = 0; i < ySamples.length; i++) {
        const dx = (totalDensity[i] / maxDensity) * 0.9;
        violinX.push(xOffset + dx);
        violinY.push(ySamples[i]);
    }
    for (let i = ySamples.length - 1; i >= 0; i--) {
        const dx = (totalDensity[i] / maxDensity) * 0.9;
        violinX.push(xOffset - dx);
        violinY.push(ySamples[i]);
    }

    traces.push({
        type: 'scatter',
        mode: 'lines',
        fill: 'toself',
        x: violinX,
        y: violinY,
        line: { color: '#444', width: 1 },
        fillcolor: 'rgba(150,150,150,0.1)',
        hoverinfo: 'skip',
        showlegend: false,
        xaxis: 'x',
        yaxis: 'y'
    });

    layout.annotations.push({
        x: xOffset,
        y: layout.yaxis.range[0],
        xref: 'x',
        yref: 'y',
        text: feature,
        showarrow: false,
        font: { size: 12 },
        textangle: 20,
        xanchor: 'center',
        yanchor: 'top'
    });
    });

    Plotly.newPlot(container, traces, layout, { responsive: true });
}