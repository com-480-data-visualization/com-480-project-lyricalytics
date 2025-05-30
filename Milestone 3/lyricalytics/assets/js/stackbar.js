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
    FileAttachment("/assets/data/stackbar_df.csv").csv({typed: true})
    )}
    
    function _emotions(data){return(
    [...new Set(data.map(d => d.emotion))]
    )}
  
  function _topHitsByGenre(d3,data){return(
  Object.fromEntries(
    d3.rollups(
      data.filter(d => d.top_hit === "True"),
      v => v.length,
      d => d.track_genre
    )
  )
  )}

  function _totalSongsByGenre(d3,data){return(
    Object.fromEntries(
      d3.rollups(
        data,  
        v => v.length,
        d => d.track_genre
      )
    )
    )}

  function _totalByGenreEmotion(d3,data){return(
    Object.fromEntries(
      d3.rollup(
      data,
      v => v.length,
      d => d.track_genre,
      d => d.emotion  
    )
  )
  )}
  
  function _genres(data){return(
  [...new Set(data.map(d => d.track_genre))]
  )}
  
  function _genreGroups(){return(
  {
    "Pop & Mainstream": [
      "pop", "power-pop", "pop-film", "dance", "party", "happy", "singer-songwriter", "songwriter",
      "indie-pop", "sad", "synth-pop"
    ],
    "Rock & Metal": [
      "rock", "alt-rock", "alternative", "hard-rock", "hardcore", "metal", "metalcore", "heavy-metal", "punk",
      "punk-rock", "grunge", "rock-n-roll", "psych-rock", "emo", "goth", "industrial", "garage",
      "black-metal", "death-metal", "grindcore", "indie", "rockabilly"
    ],
    "Electronic & Dance": [
      "edm", "electronic", "electro", "club", "deep-house", "techno", "trance", "house",
      "detroit-techno", "minimal-techno", "idm", "drum-and-bass", "dubstep", "dub", "breakbeat", "disco",
      "hardstyle", "progressive-house", "trip-hop"
    ],
    "Hip-Hop, R&B & Soul": [
      "hip-hop", "r-n-b", "soul", "funk", "groove"
    ],
    "Jazz, Classical & Instrumental": [
      "jazz", "classical", "piano", "opera", "ambient", "new-age", "show-tunes",
      "blues", "gospel", "chill"
    ],
    "Latin & World": [
      "latin", "latino", "salsa", "samba", "brazil", "mpb", "forro", "pagode", "reggaeton", "reggae",
      "world-music", "tango", "afrobeat", "dancehall", "ska"
    ],
    "Asian": [
      "k-pop", "j-pop", "j-rock", "j-dance", "j-idol", "mandopop", "cantopop", "anime", "indian", "malay", "iranian", "turkish"
    ],
    "Country, Folk & Acoustic": [
      "country", "folk", "acoustic", "bluegrass", "honky-tonk", "guitar"
    ],
    "Children & Comedy": [
      "children", "kids", "comedy", "disney"
    ],
    "Regional & Language-based": [
      "french", "german", "british", "spanish", "swedish", "chicago-house"
    ]
  }
  )}

  function _groupedGenres(genreGroups){return(
  Object.values(genreGroups).flat()
  )}
  
  function _missingGenres(genres,groupedGenres){return(
  genres.filter(g => !groupedGenres.includes(g))
  )}
  
  
  function _genreSelection(html,genreGroups,Inputs)
  {
    const form = html`<form style="font-family: sans-serif;"></form>`;
    const selected = {};
  
    for (const [group, genres] of Object.entries(genreGroups)) {
      const wrapper = html`
        <div style="margin-bottom: 6px; border: 1px solid #ddd; border-radius: 6px; overflow: hidden;">
          <div style="padding: 6px 12px; background: #f9f9f9; font-weight: 600; font-size: 13px;">
            ${group}
          </div>
          <div class="hover-content" style="
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease, padding 0.3s ease;
            background: #fff;
            padding: 0 12px;
          "></div>
        </div>
      `;
  
      const checkbox = Inputs.checkbox(genres, {
        label: "",
        multiple: true,
        value: genres.slice(0, 1)  // select one by default
      });
  
      selected[group] = checkbox;
  
      // Insert the checkbox inside the hover area
      wrapper.querySelector(".hover-content").appendChild(checkbox);
  
      // Expand on hover
      wrapper.addEventListener("mouseenter", () => {
        const content = wrapper.querySelector(".hover-content");
        content.style.maxHeight = "200px";
        content.style.padding = "8px 12px";
      });
      wrapper.addEventListener("mouseleave", () => {
        const content = wrapper.querySelector(".hover-content");
        content.style.maxHeight = "0";
        content.style.padding = "0 12px";
      });
  
      form.appendChild(wrapper);
    }
  
    // Make it reactive
    Object.defineProperty(form, "value", {
      get() {
        return Object.values(selected).flatMap(cb => cb.value ?? []);
      }
    });
  
    form.addEventListener("input", () =>
      form.dispatchEvent(new CustomEvent("input"))
    );
  
    return form;
  }
  
  
  function _optionalgenreSelection(Inputs,genreGroups){return(
  Inputs.form(
    Object.fromEntries(
      Object.entries(genreGroups).map(([group, genres]) => [
        group,
        Inputs.checkbox(genres, {
          label: group,
          multiple: true
        })
      ])
    )
  )
  )}
  
  function _stackData(genres,data,emotions){return(
  genres.map(genre => {
    const genreData = data.filter(d => d.track_genre === genre);
    const total = genreData.length;
    const counts = { genre };
    emotions.forEach(emotion => {
      const count = genreData.filter(d => d.emotion === emotion).length;
      counts[emotion] = total ? count / total : 0;
    });
    return counts;
  })
  )}
  
  function _selectedGenres(genreSelection){return(
  genreSelection
  )}
  
  function _filteredStackData(stackData,selectedGenres)
  {
    return stackData.filter(d => selectedGenres.includes(d.genre));
  }
  
  function _margin(){return(
  {top: 20, right: 20, bottom: 30, left: 40}
  )}
  
  function _height(){return(
  450
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
  
  function _y(d3,height,margin){return(
  d3.scaleLinear()
    .domain([0, 1]) // 100% scale
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
  
  function _chart(d3,width,height,series,color,x,y,margin,topHitsByGenre,totalSongsByGenre,totalByGenreEmotion)
  {
    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height);
  
    // Tooltip div
    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.75)")
      .style("color", "white")
      .style("padding", "4px 8px")
      .style("font-size", "12px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);
  
    // Draw bars
    svg.append("g")
      .selectAll("g")
      .data(series)
      .join("g")
        .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(d => d.map(v => ({...v, key: d.key}))) // attach emotion key
      .join("rect")
        .attr("x", d => x(d.data.genre))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on("mouseover", (event, d) => {
          const percent = ((d[1] - d[0]) * 100).toFixed(1);
          const total = totalByGenreEmotion[d.data.genre]?.get(d.key) ?? 0;
          tooltip
            .style("opacity", 1)
            .html(`<strong>${d.key}</strong><br> (${total}♫, ${percent}%)`);
        })
        .on("mousemove", event => {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });
  
    // x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d => d)) // dummy formatter
      .selectAll("text")
      .each(function(d) {
        const hits = topHitsByGenre[d] || 0;
        const songs = totalSongsByGenre[d] || 0;
        const text = d3.select(this);
        text.text(null); // clear existing label
        text.append("tspan")
          .attr("x", 0)
          .attr("dy", "0.5em") // slight push down
          .text(d);
        text.append("tspan")
          .attr("x", 0)
          .attr("dy", "1.2em")
          .text(`${songs}🎵 (${hits}🔥)`);
      })
      .style("text-anchor", "middle");
    
    // y-axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));
  
    return svg.node();
  }
  
  
  function _33(html,$0,selectedGenres,chart){return(
  html`<div style="display: flex; gap: 16px;">
    <div style="flex: 0 0 280px;">${$0}</div>
    <div style="flex: 1; min-width: 0;">${(() => {
      selectedGenres;
      return chart;
    })()}</div>
  </div>`
  )}
  
  export default function define(runtime, observer) {
    const main = runtime.module();
    function toString() { return this.url; }
    const fileAttachments = new Map([
        ["/assets/data/stackbar_df.csv", {url: new URL("/assets/data/stackbar_df.csv", import.meta.url), mimeType: "text/csv", toString}]
      ]);
        main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
        main.variable(observer("emotionColors")).define("emotionColors", _emotionColors);
        main.variable(observer("data")).define("data", ["FileAttachment"], _data);
        main.variable(observer("emotions")).define("emotions", ["data"], _emotions);
        main.variable(observer("topHitsByGenre")).define("topHitsByGenre", ["d3","data"], _topHitsByGenre);
        main.variable(observer("totalSongsByGenre")).define("totalSongsByGenre", ["d3","data"], _totalSongsByGenre);
        main.variable(observer("totalByGenreEmotion")).define("totalByGenreEmotion", ["d3","data"], _totalByGenreEmotion);
        main.variable(observer("genres")).define("genres", ["data"], _genres);
        main.variable(observer("genreGroups")).define("genreGroups", _genreGroups);
        main.variable(observer("groupedGenres")).define("groupedGenres", ["genreGroups"], _groupedGenres);
        main.variable(observer("missingGenres")).define("missingGenres", ["genres","groupedGenres"], _missingGenres);
        main.variable(observer("viewof genreSelection")).define("viewof genreSelection", ["html","genreGroups","Inputs"], _genreSelection);
        main.variable(observer("genreSelection")).define("genreSelection", ["Generators", "viewof genreSelection"], (G, _) => G.input(_));
        main.variable(observer("viewof optionalgenreSelection")).define("viewof optionalgenreSelection", ["Inputs","genreGroups"], _optionalgenreSelection);
        main.variable(observer("optionalgenreSelection")).define("optionalgenreSelection", ["Generators", "viewof optionalgenreSelection"], (G, _) => G.input(_));
        main.variable(observer("stackData")).define("stackData", ["genres","data","emotions"], _stackData);
        main.variable(observer("selectedGenres")).define("selectedGenres", ["genreSelection"], _selectedGenres);
        main.variable(observer("filteredStackData")).define("filteredStackData", ["stackData","selectedGenres"], _filteredStackData);
        main.variable(observer("margin")).define("margin", _margin);
        main.variable(observer("height")).define("height", _height);
        main.variable(observer("width")).define("width", _width);
        main.variable(observer("x")).define("x", ["d3","filteredStackData","margin","width"], _x);
        main.variable(observer("y")).define("y", ["d3","height","margin"], _y);
        main.variable(observer("color")).define("color", ["d3","emotions","emotionColors"], _color);
        main.variable(observer("series")).define("series", ["d3","emotions","filteredStackData"], _series);
        main.variable(observer("chart")).define("chart", ["d3","width","height","series","color","x","y","margin","topHitsByGenre", "totalSongsByGenre", "totalByGenreEmotion"], _chart);
        main.variable(observer()).define(["html","viewof genreSelection","selectedGenres","chart"], _33);
        return main;
      }
      