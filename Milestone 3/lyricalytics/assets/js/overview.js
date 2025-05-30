const emotion_colors = {
    "admiration": "#F3BBBE", "amusement": "#F7B881", "anger": "#B32E2B", "annoyance": "#D27167",
    "approval": "#8AB0AA", "caring": "#CD8039", "confusion": "#635F5A", "curiosity": "#61AEBD",
    "desire": "#EF854D", "disappointment": "#856252", "disapproval": "#8A6F24", "disgust": "#70742D",
    "embarrassment": "#FCC337", "excitement": "#D09F40", "fear": "#090001", "gratitude": "#C8CB66",
    "joy": "#F5E9D1", "love": "#DA8798", "nervousness": "#497890", "optimism": "#B7D1D3",
    "pride": "#935354", "realization": "#193267", "remorse": "#9F7856", "sadness": "#042040",
    "surprise": "#1A404D"
  };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#ffffff');

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 100);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const overviewChart = document.getElementById('overview-chart');
//   renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setSize(1200, 600);

  overviewChart.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const tooltip = document.getElementById('tooltip');
  const legend = document.getElementById('legend');
  const loading = document.getElementById('loading');
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const emotionGroups = {};  
  let pointData = [];

  // Build dynamic checkbox legend with Select/Deselect all buttons
  function buildLegend(emotionList) {
    legend.innerHTML = `
      <li><button id="selectAllBtn">Select All</button></li>
      <li><button id="deselectAllBtn">Deselect All</button></li>`;

    emotionList.forEach(emotion => {
      const color = emotion_colors[emotion] || "#000000";
      const li = document.createElement('li');
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = emotion;
      checkbox.id = `overview-${emotion}`;
      checkbox.checked = true;

      label.htmlFor = checkbox.id;
      label.textContent = emotion;
      label.style.backgroundColor = color;

      checkbox.onchange = function() {
        og_text_color = label.style.color
        label.style.color = label.style.backgroundColor
        label.style.backgroundColor = og_text_color
      }

      li.appendChild(checkbox);
      li.appendChild(label);
      legend.appendChild(li);
    });

  
    legend.querySelectorAll('#overview input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const emotion = checkbox.value;
        if (emotionGroups[emotion]) {
          emotionGroups[emotion].visible = checkbox.checked;
        }
      });
    });

    // Select All button
    document.getElementById('selectAllBtn').addEventListener('click', () => {
        legend.querySelectorAll('#overview li label').forEach(label => {
          if (!document.getElementById(label.htmlFor).checked) {
            og_text_color = label.style.color
            label.style.color = label.style.backgroundColor
            label.style.backgroundColor = og_text_color
          }
        });
      legend.querySelectorAll('#overview input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
        const emotion = checkbox.value;
        if (emotionGroups[emotion]) {
          emotionGroups[emotion].visible = true;
        }
      });
    });

    // Deselect All button
    document.getElementById('deselectAllBtn').addEventListener('click', () => {
        legend.querySelectorAll('#overview li label').forEach(label => {
          if (document.getElementById(label.htmlFor).checked) {
            og_text_color = label.style.color
            label.style.color = label.style.backgroundColor
            label.style.backgroundColor = og_text_color
          }
        });
      legend.querySelectorAll('#overview input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
        const emotion = checkbox.value;
        if (emotionGroups[emotion]) {
          emotionGroups[emotion].visible = false;
        }
      });
    });
  }
  
  
  const loader = new THREE.TextureLoader();
  const textures = {};

  Promise.all([
    loader.loadAsync('assets/img/music_note.png').then(t => textures.topHit = t),
    loader.loadAsync('assets/img/dot.png').then(t => textures.nonTopHit = t)
  ]).then(() => {
    d3.csv("assets/data/compact_lda_df.csv").then(data => {
      loading.style.display = 'none';

      const emotions = Array.from(new Set(data.map(d => d.emotion))).sort();
      buildLegend(emotions);

      emotions.forEach(emotion => {
        const groupData = data.filter(d => d.emotion === emotion);

        // Separate top hits and non-top hits for this emotion
        const topHits = [];
        const nonTopHits = [];
        
        groupData.forEach((d, i) => {
          if (d.top_hit === "True" || d.top_hit === true) {
            topHits.push(d);
          } else {
            nonTopHits.push(d);
          }
        });

        // Helper to create geometry & colors array
        function createGeometryAndColors(points) {
          const positions = [];
          const colors = [];
          points.forEach(d => {
            const x = +d.LDA1 * 10;
            const y = +d.LDA2 * 10;
            const z = +d.LDA3 * 10;
            const colorHex = emotion_colors[d.emotion] || "#000000";
            const color = new THREE.Color(colorHex);

            positions.push(x, y, z);
            colors.push(color.r, color.g, color.b);
          });
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
          geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
          geometry.computeBoundingSphere();
          return geometry;
        }

        // Create top hit geometry
        const topHitGeometry = createGeometryAndColors(topHits);
        // Create non-top hit geometry
        const nonTopHitGeometry = createGeometryAndColors(nonTopHits);

        // Add to pointData with correct indices and isTopHit flag
        topHits.forEach((d, i) => {
          const x = +d.LDA1 * 10;
          const y = +d.LDA2 * 10;
          const z = +d.LDA3 * 10;
          pointData.push({
            position: new THREE.Vector3(x, y, z),
            text: d.hover_text,
            emotion: emotion,
            isTopHit: true,
            indexInGroup: i
          });
        });

        nonTopHits.forEach((d, i) => {
          const x = +d.LDA1 * 10;
          const y = +d.LDA2 * 10;
          const z = +d.LDA3 * 10;
          pointData.push({
            position: new THREE.Vector3(x, y, z),
            text: d.hover_text,
            emotion: emotion,
            isTopHit: false,
            indexInGroup: i
          });
        });

        // Create materials
        const topHitMaterial = new THREE.PointsMaterial({
          size: 4,
          map: textures.topHit,
          vertexColors: true,
          transparent: true,
          alphaTest: 0.5,
          sizeAttenuation: true,
        });
        const nonTopHitMaterial = new THREE.PointsMaterial({
          size: 2,
          map: textures.nonTopHit,
          vertexColors: true,
          transparent: true,
          opacity: 0.3,
          alphaTest: 0.2,
          sizeAttenuation: true,
          depthWrite: false,
        });


        // Create Points
        const topHitPoints = new THREE.Points(topHitGeometry, topHitMaterial);
        topHitPoints.name = 'topHit';

        const nonTopHitPoints = new THREE.Points(nonTopHitGeometry, nonTopHitMaterial);
        nonTopHitPoints.name = 'nonTopHit';

        // Group them per emotion
        const group = new THREE.Group();
        group.add(topHitPoints);
        group.add(nonTopHitPoints);

        scene.add(group);
        emotionGroups[emotion] = group;
      });

      animate();
    });
  });


  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    scene.rotation.y += 0.0005;
    renderer.render(scene, camera);
  }

  window.addEventListener('mousemove', (event) => {
    // Ignore if mouse is not over the renderer canvas
    if (event.target !== renderer.domElement) {
      tooltip.style.display = "none";
      return;
    }
  
    mouse.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1;
  
    raycaster.setFromCamera(mouse, camera);
  
    const visibleGroups = Object.values(emotionGroups).filter(group => group.visible);
    let intersects = [];
    visibleGroups.forEach(group => {
      intersects.push(...raycaster.intersectObject(group, true));
    });
  
    intersects.sort((a, b) => {
      const aIsTop = a.object.name === 'topHit' ? 1 : 0;
      const bIsTop = b.object.name === 'topHit' ? 1 : 0;
      return bIsTop - aIsTop;
    });
  
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const object = intersect.object;
      const group = object.parent;
      const emotion = Object.keys(emotionGroups).find(e => emotionGroups[e] === group);
      if (!emotion) {
        tooltip.style.display = "none";
        return;
      }
  
      const index = intersect.index;
      const point = pointData.find(p =>
        p.emotion === emotion &&
        p.isTopHit === (object.name === 'topHit') &&
        p.indexInGroup === index
      );
  
      if (point) {
        // tooltip.style.left = (event.clientX + 12) + "px";
        // tooltip.style.top = (event.clientY + 12) + "px";
        tooltip.innerHTML = `<b>${point.text}</b>`;
        tooltip.style.display = "block";
      } else {
        tooltip.style.display = "none";
      }
    } else {
      tooltip.style.display = "none";
    }
  });
  



  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });