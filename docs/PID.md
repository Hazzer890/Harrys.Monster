# Simple PID Visualiser

<html lang="en">
<div>
  <meta charset="UTF-8">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
   
    
    .controls {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 20px;
    }
    .slider-box {
      padding: 15px;
      border-radius: 12px;
      box-shadow: 0 0 10px #0004;
      width: 220px;
    }
    label {
      display: block;
      margin-bottom: 6px;
      font-weight: bold;
    }
    input[type=range] {
      width: 100%;
    }
    select {
      font-size: 16px;
      padding: 8px;
      border-radius: 8px;
      border: none;
      background: #ec0080;
      color: #EFEFEF;
      margin-bottom: 20px;
    }
    button {
      background: #ec0080;
      border: none;
      color: #efefef;
      font-weight: bold;
      font-size: 16px;
      padding: 10px 24px;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 20px;
      transition: 0.2s;
    }
    button:hover { background: #ec60a8; }
    button:disabled {
      background: #334155;
      color: #94a3b8;
      cursor: not-allowed;
    }
  </style>
</div>
<body>
  <div>
    <label for="plantSelect">System Type:</label>
    <select id="plantSelect">
      <option value="speed">Speed Control (1st Order)</option>
      <option value="position">Position Control (2nd Order)</option>
    </select>
  </div>

  <div class="controls">
    <div class="slider-box">
      <label for="kp">Kp: <span id="kpVal">1.00</span></label>
      <input type="range" id="kp" min="0" max="10" step="0.1" value="1">
    </div>
    <div class="slider-box">
      <label for="ki">Ki: <span id="kiVal">0.00</span></label>
      <input type="range" id="ki" min="0" max="10" step="0.05" value="0">
    </div>
    <div class="slider-box">
      <label for="kd">Kd: <span id="kdVal">0.00</span></label>
      <input type="range" id="kd" min="0" max="10" step="0.05" value="0">
    </div>
  </div>

  <button id="toggleBtn">Start Simulation</button>
  <canvas id="chart" width="800" height="400"></canvas>

  <script>
    // --- Chart setup ---
    const ctx = document.getElementById("chart");
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          { label: "Output", data: [], borderColor: "#38bdf8", borderWidth: 2, fill: false },
          { label: "Setpoint", data: [], borderColor: "#f87171", borderDash: [6, 4], borderWidth: 2, fill: false }
        ]
      },
      options: {
        animation: false,
        scales: {
          x: { title: { display: true, text: "Time (s)" } },
          y: {
            title: { display: true, text: "Output" },
            suggestedMin: 0,
            suggestedMax: 2
          }
        },
        plugins: { legend: { labels: { color: "#f8fafc" } } }
      }
    });

    // --- Simulation Variables ---
    let Kp = 1.0, Ki = 0.0, Kd = 0.0;
    const setpoint = 1.0;
    let plantType = "speed"; // default
    let y = 0, v = 0, integral = 0, prevError = 0;
    const tau = 1.5; // first-order time constant for speed system
    const dt = 0.01;
    let t = 0;
    let running = false;
    let lastTime = 0;

    const toggleBtn = document.getElementById("toggleBtn");

    function resetSim() {
      y = 0; v = 0; integral = 0; prevError = 0; t = 0;
      chart.data.labels = [];
      chart.data.datasets[0].data = [];
      chart.data.datasets[1].data = [];
      chart.update();
    }

    function stepPID() {
      const error = setpoint - y;
      integral += error * dt;
      const derivative = (error - prevError) / dt;
      const u = Kp * error + Ki * integral + Kd * derivative;
      prevError = error;

      if (plantType === "speed") {
        // First-order system: dy/dt = (-y + u) / tau
        y += ((-y + u) / tau) * dt;
      } else {
        // Position control: d²y/dt² = (-v + u) / tau
        const a = ((-v + u) / tau);
        v += a * dt;
        y += v * dt;
      }

      t += dt;

      chart.data.labels.push(t.toFixed(2));
      chart.data.datasets[0].data.push(y);
      chart.data.datasets[1].data.push(setpoint);

      if (chart.data.labels.length > 400) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
      }
    }

    // --- Simulation loop ---
    function loop(timestamp) {
      if (!running) return;
      if (timestamp - lastTime > dt * 1000) {
        stepPID();
        chart.update("none");
        lastTime = timestamp;
      }

      if (t < 4) {
        requestAnimationFrame(loop);
      } else {
        running = false;
        toggleBtn.textContent = "Start Simulation";
        toggleBtn.disabled = false;
      }
    }

    toggleBtn.onclick = () => {
      if (!running) {
        resetSim();
        running = true;
        toggleBtn.textContent = "Running...";
        toggleBtn.disabled = true;
        requestAnimationFrame(loop);
      }
    };

    // --- UI Updates ---
    function updateLabel(id, val) {
      document.getElementById(id + "Val").textContent = val.toFixed(2);
    }
    document.getElementById("kp").oninput = e => { Kp = parseFloat(e.target.value); updateLabel("kp", Kp); resetSim(); };
    document.getElementById("ki").oninput = e => { Ki = parseFloat(e.target.value); updateLabel("ki", Ki); resetSim(); };
    document.getElementById("kd").oninput = e => { Kd = parseFloat(e.target.value); updateLabel("kd", Kd); resetSim(); };

    document.getElementById("plantSelect").onchange = e => {
      plantType = e.target.value;
      resetSim();
    };
  </script>
</body>
</html>
