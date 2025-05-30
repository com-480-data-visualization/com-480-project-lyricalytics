const width = 800, height = 600;
fetch('/assets/data/emotions_wordcloud_data.json')
.then(res => res.json())
.then(data => {
const select = document.getElementById('emotion-select');
const emotions = Object.keys(data);
emotions.forEach(emotion => {
    const option = document.createElement('option');
    option.value = emotion; option.textContent = emotion;
    select.appendChild(option);
});
updateWordCloud(data[emotions[0]]);
select.addEventListener('change', e => updateWordCloud(data[e.target.value]));
function updateWordCloud(words) {
    const sizes = words.map(d => d.size);
    const fontSizeScale = d3.scaleLinear().domain([d3.min(sizes), d3.max(sizes)]).range([10, 60]);
    d3.select("#wordcloud").selectAll("*").remove();
    d3.layout.cloud()
    .size([width, height])
    .words(words)
    .padding(5)
    .rotate(() => 0)
    .fontSize(d => fontSizeScale(d.size))
    .on("end", draw).start();
    function draw(words) {
    d3.select("#wordcloud").append("svg").attr("width", width).attr("height", height)
        .append("g").attr("transform", `translate(${width / 2}, ${height / 2})`)
        .selectAll("text").data(words).join("text")
        .style("font-size", d => `${d.size}px`)
        .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text(d => d.text);
    }
}
});