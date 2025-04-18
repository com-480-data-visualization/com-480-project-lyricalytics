function _emotionColors(){return(
    {
      "admiration": "#F3BBBE",      // Soft pink (gentle respect, liking)
      "amusement": "#F7B881",       // Light orange-peach (playfulness)
      "anger": "#B32E2B",           // Deep intense red (anger, intensity)
      "annoyance": "#D27167",       // Reddish muted tone (irritation)
      "approval": "#8AB0AA",        // Calm teal (positive acceptance)
      "caring": "#CD8039",          // Warm reddish-orange (affection, tenderness)
      "confusion": "#635F5A",       // Neutral gray-brown (uncertainty)
      "curiosity": "#61AEBD",       // Bright blue (interest, exploration)
      "desire": "#EF854D",          // Vivid coral orange (passion, yearning)
      "disappointment": "#856252",  // Muted brown (feeling let down)
      "disapproval": "#8A6F24",     // Brownish (negative judgment)
      "disgust": "#70742D",         // Olive green (revulsion)
      "embarrassment": "#FCC337",   // Soft golden-yellow (blushing, mild shame)
      "excitement": "#D09F40",      // Warm amber-orange (high energy)
      "fear": "#090001",            // Almost black (fear, threat)
      "gratitude": "#C8CB66",       // Soft yellow-green (thankfulness)
      "joy": "#F5E9D1",             // Pale cream (pure happiness)
      "love": "#DA8798",            // Warm pink (deep affection) — FIXED
      "nervousness": "#497890",     // Muted teal-blue (anxiety, tension)
      "optimism": "#B7D1D3",        // Soft sky blue (hopefulness, positivity)
      "pride": "#935354",           // Rich purple-brown (confidence, dignity)
      "realization": "#193267",     // Deep navy (insight, reflection)
      "remorse": "#9F7856",         // Muted reddish-brown (regret, sadness)
      "sadness": "#042040",         // Dark blue (deep sorrow)
      "surprise": "#1A404D"         // Dark teal (unexpected, surprise)
    }
    )}
    
    function _data(FileAttachment){return(
    FileAttachment("/assets/data/processed_df.csv").csv({typed: true})
    )}
    
    function _emotions(data){return(
    [...new Set(data.map(d => d.emotion))]
    )}
    
    function _genres(data){return(
    [...new Set(data.map(d => d.track_genre))]
    )}
    
    function _stackData(genres,data,emotions){return(
    genres.map(genre => {
      const genreData = data.filter(d => d.track_genre === genre);
      const counts = { genre };
      emotions.forEach(emotion => {
        counts[emotion] = genreData.filter(d => d.emotion === emotion).length;
      });
      return counts;
    })
    )}
    
    function _genreSelection(Inputs,genres){return(
    Inputs.checkbox(genres, {
      label: "Select Genres (max 5 recommended):",
      multiple: true,
      value: genres.slice(0, 3) // default selections
    })
    )}
    
    function _filteredStackData(stackData,genreSelection){return(
    stackData.filter(d => genreSelection.includes(d.genre))
    )}
    
    function _margin(){return(
    {top: 20, right: 20, bottom: 30, left: 40}
    )}
    
    function _height(){return(
    400
    )}
    
    function _width(){return(
    800
    )}
    
    function _x(d3,filteredStackData,margin,width){return(
    d3.scaleBand()
      .domain(filteredStackData.map(d => d.genre))
      .range([margin.left, width - margin.right])
      .padding(0.1)
    )}
    
    function _y(d3,filteredStackData,emotions,height,margin){return(
    d3.scaleLinear()
      .domain([0, d3.max(filteredStackData, d => d3.sum(emotions, key => d[key]))]).nice()
      .range([height - margin.bottom, margin.top])
    )}
    
    function _color(d3,emotions,emotionColors){return(
    d3.scaleOrdinal()
      .domain(emotions)
      .range(emotions.map(e => emotionColors[e]))
    )}
    
    function _series(d3,emotions,filteredStackData){return(
    d3.stack().keys(emotions)(filteredStackData)
    )}
    
    function _chart(d3,width,height,series,color,x,y,margin)
    {
      const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height);
    
      // Bars
      svg.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
          .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
          .attr("x", d => x(d.data.genre))
          .attr("y", d => y(d[1]))
          .attr("height", d => y(d[0]) - y(d[1]))
          .attr("width", x.bandwidth());
    
      // x-axis
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));
    
      // y-axis
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
    
      return svg.node();
    }
    
    
    function _legend(emotions,d3,color)
    {
      const legendHeight = emotions.length * 22;
      const svg = d3.create("svg")
        .attr("width", 200)
        .attr("height", legendHeight);
    
      const g = svg.selectAll("g")
        .data(emotions)
        .join("g")
          .attr("transform", (d, i) => `translate(0, ${i * 22})`);
    
      g.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => color(d));
    
      g.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(d => d)
        .attr("font-size", "12px");
    
      return svg.node();
    }
    
    
    function _17($0,chart,legend,htl){return(
    htl.html`<div>
        <div style="margin-bottom:20px;">
          ${$0}
        </div>
        <div style="display:flex;">
          <div>${chart}</div>
          <div style="margin-left:20px;">${legend}</div>
        </div>
      </div>`
    )}
    
    function _htmlExport(chart,legend,html)
    {
      const container = document.createElement("div");
      container.appendChild(chart);
      container.appendChild(legend);
    
      const blob = new Blob([container.outerHTML], {type: "text/html"});
      const url = URL.createObjectURL(blob);
      
      return html`<a href=${url} download="chart.html">Download Chart as HTML</a>`;
    }
    
    
    export default function define(runtime, observer) {
      const main = runtime.module();
      function toString() { return this.url; }
      const fileAttachments = new Map([
        ["/assets/data/processed_df.csv", {url: new URL("/assets/data/processed_df.csv", import.meta.url), mimeType: "text/csv", toString}]
      ]);
      main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
      main.variable(observer("emotionColors")).define("emotionColors", _emotionColors);
      main.variable(observer("data")).define("data", ["FileAttachment"], _data);
      main.variable(observer("emotions")).define("emotions", ["data"], _emotions);
      main.variable(observer("genres")).define("genres", ["data"], _genres);
      main.variable(observer("stackData")).define("stackData", ["genres","data","emotions"], _stackData);
      main.variable(observer("viewof genreSelection")).define("viewof genreSelection", ["Inputs","genres"], _genreSelection);
      main.variable(observer("genreSelection")).define("genreSelection", ["Generators", "viewof genreSelection"], (G, _) => G.input(_));
      main.variable(observer("filteredStackData")).define("filteredStackData", ["stackData","genreSelection"], _filteredStackData);
      main.variable(observer("margin")).define("margin", _margin);
      main.variable(observer("height")).define("height", _height);
      main.variable(observer("width")).define("width", _width);
      main.variable(observer("x")).define("x", ["d3","filteredStackData","margin","width"], _x);
      main.variable(observer("y")).define("y", ["d3","filteredStackData","emotions","height","margin"], _y);
      main.variable(observer("color")).define("color", ["d3","emotions","emotionColors"], _color);
      main.variable(observer("series")).define("series", ["d3","emotions","filteredStackData"], _series);
      main.variable(observer("chart")).define("chart", ["d3","width","height","series","color","x","y","margin"], _chart);
      main.variable(observer("legend")).define("legend", ["emotions","d3","color"], _legend);
      main.variable(observer()).define(["viewof genreSelection","chart","legend","htl"], _17);
      main.variable(observer("htmlExport")).define("htmlExport", ["chart","legend","html"], _htmlExport);
      return main;
    }
    