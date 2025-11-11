// Simple proportional gravity simulator: F ∝ (m1 * m2) / d^2
(function(){
  const m1El = document.getElementById('m1');
  const m2El = document.getElementById('m2');
  const dEl  = document.getElementById('d');
  const m1Val = document.getElementById('m1Val');
  const m2Val = document.getElementById('m2Val');
  const dVal  = document.getElementById('dVal');
  const forceVal = document.getElementById('forceVal');
  const relativeVal = document.getElementById('relativeVal');
  const svg = document.getElementById('svg');
  // Calculation elements (with G)
  const m1CalcEl = document.getElementById('m1Calc');
  const m2CalcEl = document.getElementById('m2Calc');
  const dCalcEl  = document.getElementById('dCalc');
  const calcStepsEl = document.getElementById('calcSteps');
  const gForceValEl = document.getElementById('gForceVal');

  // Buttons
  const resetBtn = document.getElementById('resetBtn');
  const doubleM1 = document.getElementById('doubleM1');
  const doubleBoth = document.getElementById('doubleBoth');
  const halfDistance = document.getElementById('halfDistance');
  const doubleDistance = document.getElementById('doubleDistance');

  const baseline = { m1:1, m2:1, d:1 };

  function getForce(m1,m2,d){
    // return relative force where baseline (1,1,1) => 1
    return (m1 * m2) / (d * d);
  }

  function updateOutputs(){
    const m1 = parseFloat(m1El.value);
    const m2 = parseFloat(m2El.value);
    const d  = parseFloat(dEl.value);
    m1Val.textContent = m1.toFixed(1);
    m2Val.textContent = m2.toFixed(1);
    dVal.textContent  = d.toFixed(3);
    // update calc labels
    if (m1CalcEl) m1CalcEl.textContent = m1.toFixed(3);
    if (m2CalcEl) m2CalcEl.textContent = m2.toFixed(3);
    if (dCalcEl) dCalcEl.textContent = d.toFixed(3);

    const f = getForce(m1,m2,d);
    const fBaseline = getForce(baseline.m1, baseline.m2, baseline.d);
    forceVal.textContent = f.toFixed(2);
    relativeVal.textContent = (f / fBaseline).toFixed(2) + '×';

    drawViz(m1,m2,d,f);

    // Compute full gravitational calculation using G (SI units)
    // Interpret sliders as: m1,m2 in kilograms, d in meters
    if (calcStepsEl && gForceValEl) {
      const G = 6.67430e-11; // N·m^2/kg^2
      const numerator = G * m1 * m2;
      const denominator = d * d;
      const F_SI = numerator / denominator;

      // Create step text with readable formatting
      function fmtSci(x) {
        if (!isFinite(x)) return String(x);
        // show in scientific notation if very small/large
        if (Math.abs(x) < 1e-3 || Math.abs(x) >= 1e4) return x.toExponential(3);
        return x.toString();
      }

      let steps = '';
      steps += `G = ${G.toExponential(5)} N·m^2/kg^2\n`;
      steps += `m1 = ${m1.toFixed(6)} kg\n`;
      steps += `m2 = ${m2.toFixed(6)} kg\n`;
      steps += `d  = ${d.toFixed(6)} m\n\n`;
      steps += `Step 1: Multiply masses: m1 * m2 = ${ (m1 * m2).toPrecision(6) } kg^2\n`;
      steps += `Step 2: Multiply by G: G * m1 * m2 = ${ fmtSci(numerator) } N·m^2\n`;
      steps += `Step 3: Compute d^2 = ${ (denominator).toPrecision(6) } m^2\n`;
      steps += `Step 4: Divide -> F = (G*m1*m2) / d^2 = ${ fmtSci(F_SI) } N\n`;

      calcStepsEl.textContent = steps;
      gForceValEl.textContent = `${F_SI.toExponential(3)} N`;
    }
  }

  function drawViz(m1,m2,d,f){
    // Clear svg
    while(svg.firstChild) svg.removeChild(svg.firstChild);

    // Map masses to circle radii
    const minR = 16, maxR = 60;
    const massMax = 10; // slider max
    const r1 = minR + (Math.min(m1,massMax)/massMax) * (maxR - minR);
    const r2 = minR + (Math.min(m2,massMax)/massMax) * (maxR - minR);

    // positions
    const width = svg.viewBox.baseVal.width || 800;
    const height = svg.viewBox.baseVal.height || 240;
    const leftX = 120;
    const rightX = width - 120;
    const cy = height/2;

    // distance influence -> adjust x positions slightly based on d for demonstration
  const normalizedD = Math.min(Math.max(d, 0.001), 10); // clamp to new min precision
    const mid = (leftX + rightX) / 2;
    const span = Math.max(120, 260 + (normalizedD - 1) * 40); // larger d -> more spread

    const x1 = mid - span/2;
    const x2 = mid + span/2;

    // rope thickness based on f (visual scale)
    const maxForceVis = 200; // arbitrary scaling
    const stroke = Math.min(18, 2 + Math.sqrt(f) * 2);

    // create rope (line)
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', x1 + r1);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', x2 - r2);
    line.setAttribute('y2', cy);
    line.setAttribute('class','rope');
    line.setAttribute('stroke-width', stroke);
    line.setAttribute('stroke', '#7c3aed');
    line.setAttribute('opacity', Math.min(1, 0.15 + Math.log10(1+f)/2));
    svg.appendChild(line);

    // left circle
    const c1 = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c1.setAttribute('cx', x1);
    c1.setAttribute('cy', cy);
    c1.setAttribute('r', r1);
    c1.setAttribute('class', 'mass-circle left');
    svg.appendChild(c1);

    // right circle
    const c2 = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c2.setAttribute('cx', x2);
    c2.setAttribute('cy', cy);
    c2.setAttribute('r', r2);
    c2.setAttribute('class', 'mass-circle right');
    svg.appendChild(c2);

    // left label
    const t1 = document.createElementNS('http://www.w3.org/2000/svg','text');
    t1.setAttribute('x', x1);
    t1.setAttribute('y', cy + r1 + 18);
    t1.setAttribute('text-anchor','middle');
    t1.setAttribute('class','force-label');
    t1.textContent = 'm1 = ' + m1.toFixed(1);
    svg.appendChild(t1);

    // right label
    const t2 = document.createElementNS('http://www.w3.org/2000/svg','text');
    t2.setAttribute('x', x2);
    t2.setAttribute('y', cy + r2 + 18);
    t2.setAttribute('text-anchor','middle');
    t2.setAttribute('class','force-label');
    t2.textContent = 'm2 = ' + m2.toFixed(1);
    svg.appendChild(t2);

    // force label above
    const tf = document.createElementNS('http://www.w3.org/2000/svg','text');
    tf.setAttribute('x', (x1 + x2)/2);
    tf.setAttribute('y', cy - Math.max(40, (r1+r2)/2) );
    tf.setAttribute('text-anchor','middle');
    tf.setAttribute('class','force-label');
    tf.textContent = 'F ∝ ' + (Math.round(f*100)/100).toFixed(2);
    svg.appendChild(tf);
  }

  // Events
  [m1El,m2El,dEl].forEach(el => el.addEventListener('input', updateOutputs));

  resetBtn.addEventListener('click', ()=>{
    m1El.value = baseline.m1;
    m2El.value = baseline.m2;
    dEl.value  = baseline.d;
    updateOutputs();
  });

  doubleM1.addEventListener('click', ()=>{
    m1El.value = Math.min(parseFloat(m1El.max), parseFloat(m1El.value)*2);
    updateOutputs();
  });
  doubleBoth.addEventListener('click', ()=>{
    m1El.value = Math.min(parseFloat(m1El.max), parseFloat(m1El.value)*2);
    m2El.value = Math.min(parseFloat(m2El.max), parseFloat(m2El.value)*2);
    updateOutputs();
  });
  halfDistance.addEventListener('click', ()=>{
    dEl.value = Math.max(parseFloat(dEl.min), (parseFloat(dEl.value)/2).toFixed(3));
    updateOutputs();
  });
  doubleDistance.addEventListener('click', ()=>{
    dEl.value = Math.min(parseFloat(dEl.max), (parseFloat(dEl.value)*2).toFixed(3));
    updateOutputs();
  });

  // init
  updateOutputs();
  // --- Freefall simulator elements & logic ---
  const heightEl = document.getElementById('height');
  const heightValEl = document.getElementById('heightVal');
  const objectSel = document.getElementById('objectSel');
  const runBothBtn = document.getElementById('runBoth');
  const resetDropBtn = document.getElementById('resetDrop');
  const fallObject = document.getElementById('fallObject');
  const fallArea = document.getElementById('fallArea');
  const tIdealEl = document.getElementById('tIdeal');
  const tObservedEl = document.getElementById('tObserved');
  const ffExplanationEl = document.getElementById('ffExplanation');
  // Second panel elements (Drop B)
  const heightEl2 = document.getElementById('height2');
  const heightValEl2 = document.getElementById('heightVal2');
  const objectSel2 = document.getElementById('objectSel2');
  const runDropBtn2 = document.getElementById('runDrop2');
  const resetDropBtn2 = document.getElementById('resetDrop2');
  const fallObject2 = document.getElementById('fallObject2');
  const fallArea2 = document.getElementById('fallArea2');
  const tIdealEl2 = document.getElementById('tIdeal2');
  const tObservedEl2 = document.getElementById('tObserved2');
  const ffExplanationEl2 = document.getElementById('ffExplanation2');
  // Air/vacuum selectors
  const airOn = document.getElementById('airOn');
  const airOn2 = document.getElementById('airOn2');

  // map simple drag coefficients (qualitative)
  const dragMap = {
    stone: 0.02,
    coin: 0.05,
    paper_crumpled: 0.15,
    paper_flat: 0.5,
    feather: 0.95
  };

  const g = 9.80665; // m/s^2

  function updateHeightLabel(){
    if (heightValEl && heightEl) heightValEl.textContent = parseFloat(heightEl.value).toFixed(1);
    if (heightValEl2 && heightEl2) heightValEl2.textContent = parseFloat(heightEl2.value).toFixed(1);
  }

  function computeFreefallTime(h){
    // ideal time (no air): t = sqrt(2h/g)
    return Math.sqrt(2 * h / g);
  }

  function computeObservedTime(h, drag){
    // approximate observed time: inflate ideal time by (1 + dragFactor)
    // this is a simple qualitative model for classroom demonstration
    const t0 = computeFreefallTime(h);
    // stronger drag increases time; scale factor gives visible differences
    const scale = 1 + drag * 2.5;
    return t0 * scale;
  }

  function resetDrop(){
    // Reset first drop
    if (fallObject) {
      fallObject.style.transition = 'none';
      fallObject.style.top = '8px';
      fallObject.className = 'fall-object';
      if (tIdealEl) tIdealEl.textContent = '0.00 s';
      if (tObservedEl) tObservedEl.textContent = '0.00 s';
      if (ffExplanationEl) ffExplanationEl.textContent = 'Explanation will appear here after running the drop.';
      void fallObject.offsetWidth;
    }
    // Reset second drop
    if (fallObject2) {
      fallObject2.style.transition = 'none';
      fallObject2.style.top = '8px';
      fallObject2.className = 'fall-object';
      if (tIdealEl2) tIdealEl2.textContent = '0.00 s';
      if (tObservedEl2) tObservedEl2.textContent = '0.00 s';
      if (ffExplanationEl2) ffExplanationEl2.textContent = 'Explanation will appear here after running the drop.';
      void fallObject2.offsetWidth;
    }
  }
  // Generic runner for a drop panel (accept DOM refs)
  function runDropFor(opts){
    const { fallObj, heightElement, objectSelect, tIdealElement, tObservedElement, explanationEl, airSelect } = opts;
    if (!fallObj || !heightElement || !objectSelect) return;
    const h = parseFloat(heightElement.value);
    const obj = objectSelect.value;
    // if airSelect says vacuum, use drag = 0
    const airMode = airSelect && airSelect.value === 'vacuum' ? 'vacuum' : 'air';
    const drag = airMode === 'vacuum' ? 0 : (dragMap[obj] || 0.1);

    const tIdeal = computeFreefallTime(h);
    const tObs = computeObservedTime(h, drag);

    if (tIdealElement) tIdealElement.textContent = tIdeal.toFixed(3) + ' s';
    if (tObservedElement) tObservedElement.textContent = tObs.toFixed(3) + ' s';

    // Explanation text
    if (explanationEl) {
      explanationEl.innerHTML = `Ideal freefall time (no air): <strong>${tIdeal.toFixed(3)} s</strong>.<br>
      ${airMode === 'vacuum' ? 'Running in a <strong>vacuum</strong> — observed time equals ideal.' : `Approximate observed time with air resistance for <em>${objectSelect.options[objectSelect.selectedIndex].text}</em>: <strong>${tObs.toFixed(3)} s</strong>.`}<br>
      Note: This simulation uses a qualitative drag factor to illustrate how air resistance slows objects.`;
    }

    // animate object falling within .fall-stage height
    const stage = fallObj.parentElement;
    const stageH = stage.clientHeight;
    const endTop = stageH - fallObj.clientHeight - 6; // px

    // set visual style by object
    fallObj.className = 'fall-object';
    if (obj === 'feather') fallObj.classList.add('feather');
    if (obj === 'paper_flat' || obj === 'paper_crumpled') fallObj.classList.add('paper');
    // choose color for coin/stone
    if (obj === 'coin') fallObj.style.background = '#cbd5e1';
    else if (obj === 'stone') fallObj.style.background = '#6b7280';
    else if (obj === 'feather') fallObj.style.background = '#ffd166';
    else if (obj === 'paper_flat' || obj === 'paper_crumpled') fallObj.style.background = '#ffffff';

    // compute animation duration proportional to observed time
    fallObj.style.transition = `top ${tObs}s linear`;
    // small timeout to ensure transition is applied
    setTimeout(()=>{
      fallObj.style.top = endTop + 'px';
    }, 30);
  }

  // events
  if (heightEl) { heightEl.addEventListener('input', updateHeightLabel); }
  if (heightEl2) { heightEl2.addEventListener('input', updateHeightLabel); }
  // wire single Run Both button to trigger both drops
  if (runBothBtn) runBothBtn.addEventListener('click', ()=>{
    // reset both visuals then start both drops together
    resetDrop();
    setTimeout(()=>{
      runDropFor({ fallObj: fallObject, heightElement: heightEl, objectSelect: objectSel, tIdealElement: tIdealEl, tObservedElement: tObservedEl, explanationEl: ffExplanationEl, airSelect: airOn });
      runDropFor({ fallObj: fallObject2, heightElement: heightEl2, objectSelect: objectSel2, tIdealElement: tIdealEl2, tObservedElement: tObservedEl2, explanationEl: ffExplanationEl2, airSelect: airOn2 });
    }, 50);
  });
  if (resetDropBtn) resetDropBtn.addEventListener('click', resetDrop);
  if (resetDropBtn2) resetDropBtn2.addEventListener('click', resetDrop);

  // ensure reset state
  resetDrop();

  // Tab switching: show only gravity-related sections or freefall
  const tabGravityBtn = document.getElementById('tabGravity');
  const tabFreefallBtn = document.getElementById('tabFreefall');
  const tabPlanetBtn = document.getElementById('tabPlanet');
  const tabModule4Btn = document.getElementById('tabModule4');
  const allTabButtons = [tabGravityBtn, tabFreefallBtn, tabPlanetBtn, tabModule4Btn];
  function setActiveTab(activeBtn){
    allTabButtons.forEach(b => {
      if (!b) return;
      if (b === activeBtn) {
        b.classList.add('active');
        b.setAttribute('aria-selected','true');
      } else {
        b.classList.remove('active');
        b.setAttribute('aria-selected','false');
      }
    });
  }
  const gravitySections = [document.querySelector('.controls'), document.querySelector('.visualization'), document.querySelector('.calculation')];
  const freefallSection = document.querySelector('.freefall');
  const planetSection = document.querySelector('.planetary');
  const module4Section = document.querySelector('.module4');

  function showGravity(){
    // show gravity sections
    gravitySections.forEach(s => { if (s) s.classList.remove('hidden'); });
    if (freefallSection) freefallSection.classList.add('hidden');
    // ensure other module sections are hidden when showing gravity
    if (planetSection) planetSection.classList.add('hidden');
    if (module4Section) module4Section.classList.add('hidden');
    // mark active tab
    setActiveTab(tabGravityBtn);
    // update visuals
    updateOutputs();
  }

  function showFreefall(){
    // hide gravity sections
    gravitySections.forEach(s => { if (s) s.classList.add('hidden'); });
    if (freefallSection) freefallSection.classList.remove('hidden');
    if (planetSection) planetSection.classList.add('hidden');
    // ensure module4 is hidden when showing freefall
    if (module4Section) module4Section.classList.add('hidden');
    setActiveTab(tabFreefallBtn);
    // reset freefall state and labels
    resetDrop(); updateHeightLabel();
  }

  function showPlanet(){
    // hide gravity sections and freefall
    gravitySections.forEach(s => { if (s) s.classList.add('hidden'); });
    if (freefallSection) freefallSection.classList.add('hidden');
    if (planetSection) planetSection.classList.remove('hidden');
    // ensure module4 is hidden when showing planet module
    if (module4Section) module4Section.classList.add('hidden');
    setActiveTab(tabPlanetBtn);
    // initialize planet module state if present
    initPlanetModule();
  }

  function showModule4(){
    gravitySections.forEach(s => { if (s) s.classList.add('hidden'); });
    if (freefallSection) freefallSection.classList.add('hidden');
    if (planetSection) planetSection.classList.add('hidden');
    if (module4Section) module4Section.classList.remove('hidden');
    setActiveTab(tabModule4Btn);
    initModule4();
  }

  if (tabGravityBtn) tabGravityBtn.addEventListener('click', showGravity);
  if (tabFreefallBtn) tabFreefallBtn.addEventListener('click', showFreefall);
  if (tabPlanetBtn) tabPlanetBtn.addEventListener('click', showPlanet);
  if (tabModule4Btn) tabModule4Btn.addEventListener('click', showModule4);

  // initialize view: ensure gravity visible and freefall hidden
  showGravity();
  // --- Planetary jumper & weight calculator ---
  // Constants for gravity (N/kg = m/s^2)
  const G_ENV = {
    earth: { g: 9.80665, label: 'Earth' },
    moon: { g: 1.67, label: 'Moon' },
    jupiter: { g: 24.79, label: 'Jupiter' }
  };

  // Elements
  const playerMassEl = document.getElementById('playerMass');
  const planetSelEl = document.getElementById('planetSel');
  const weightNEl = document.getElementById('weightN');
  const weightEarthEl = document.getElementById('weightEarth');
  const planetExplanationEl = document.getElementById('planetExplanation');
  const jumpBtn = document.getElementById('jumpBtn');
  const resetJumpBtn = document.getElementById('resetJumpBtn');
  const jumper = document.getElementById('jumper');
  const jumpStage = document.getElementById('jumpStage');

  function formatN(n){ return (Math.round(n*100)/100).toFixed(2) + ' N'; }

  function updatePlanetWeight(){
    if (!playerMassEl || !planetSelEl || !weightNEl || !weightEarthEl) return;
    const m = Math.max(0, parseFloat(playerMassEl.value) || 0);
    const body = planetSelEl.value || 'earth';
    const gSel = (G_ENV[body] && G_ENV[body].g) || G_ENV.earth.g;
    const w = m * gSel;
    const wEarth = m * G_ENV.earth.g;
    weightNEl.textContent = formatN(w);
    weightEarthEl.textContent = formatN(wEarth);
    if (planetExplanationEl) {
      planetExplanationEl.innerHTML = `A ${m} kg person weighs <strong>${formatN(wEarth)}</strong> on Earth. On <strong>${G_ENV[body].label}</strong> (g ≈ ${gSel}), they weigh <strong>${formatN(w)}</strong>.`;
    }
  }

  function resetJump(){
    if (!jumper) return;
    jumper.style.transition = 'none';
    jumper.style.bottom = '8px';
    // force reflow
    void jumper.offsetWidth;
  }

  function runJump(){
    if (!jumper || !jumpStage || !planetSelEl) return;
    const body = planetSelEl.value || 'earth';
    const gSel = (G_ENV[body] && G_ENV[body].g) || G_ENV.earth.g;
    const factor = G_ENV.earth.g / gSel; // >1 means higher jump

    // stage dims
    const stageH = jumpStage.clientHeight;
    const jumperH = jumper.clientHeight || 32;
    const baseHeight = Math.min(140, stageH * 0.45); // base on Earth
    let jumpHeight = baseHeight * factor;
    const maxAllowed = stageH - jumperH - 12;
    if (jumpHeight > maxAllowed) jumpHeight = maxAllowed;

    // duration: slower (longer) for higher jumps — scale with sqrt(factor)
    const baseDuration = 0.6; // seconds on Earth
    const duration = Math.max(0.25, baseDuration * Math.sqrt(Math.max(1, factor)));

    // animate by changing bottom
    jumper.style.transition = `bottom ${duration}s cubic-bezier(.22,.9,.28,1)`;
    // set target bottom
    setTimeout(()=>{
      jumper.style.bottom = (8 + jumpHeight) + 'px';
    }, 40);

    // allow it to come back down after half the duration * 2 (peak then return)
    setTimeout(()=>{
      jumper.style.bottom = '8px';
    }, Math.round((duration + 0.06) * 1000));
  }

  function initPlanetModule(){
    // bind events; safe to call multiple times
    if (playerMassEl) playerMassEl.addEventListener('input', updatePlanetWeight);
    if (planetSelEl) planetSelEl.addEventListener('change', updatePlanetWeight);
    if (jumpBtn) jumpBtn.addEventListener('click', ()=>{ resetJump(); setTimeout(runJump,50); });
    if (resetJumpBtn) resetJumpBtn.addEventListener('click', resetJump);
    // initial values
    updatePlanetWeight(); resetJump();
  }

  // --- Module 4: Tides & Orbit visualizers ---
  // Keep module state in closure so animation can be started/stopped
  let module4Running = false;
  let orbitRAF = null;

  function initModule4(){
    if (!module4Section) return;
    // Prevent re-initializing multiple times
    if (module4Running) return;
    module4Running = true;

    // --- Tides animator ---
    const tideMode = document.getElementById('tideMode');
    const seaLevel = document.getElementById('seaLevel');
    const sunEl = document.getElementById('sun');
    const moonEl = document.getElementById('moon');
    const earthEl = document.getElementById('earth');

    function computeTideAmplitude(mode){
      // Simple qualitative amplitudes (pixels) for demonstration
      switch(mode){
        case 'spring': return 36; // high
        case 'neap': return 12;   // low
        case 'perigee': return 48; // very high
        case 'apogee': return 8;  // very low
        default: return 20;
      }
    }

    function updateTideVisual(){
      const mode = tideMode ? tideMode.value : 'spring';
      const amp = computeTideAmplitude(mode);
      if (seaLevel) {
        // animate sea-level with a cyclic sine motion to simulate tides
        // We'll set a CSS variable for amplitude used by the animation loop
        seaLevel.dataset.amp = amp;
      }
      // visual position of moon/sun vary slightly per mode for illustration
      if (moonEl) moonEl.style.transform = `translateY(${mode==='perigee' ? -6 : mode==='apogee' ? 6 : 0}px)`;
      if (sunEl) sunEl.style.transform = `translateY(${mode==='neap' ? 4 : 0}px)`;
    }

    if (tideMode) tideMode.addEventListener('change', updateTideVisual);
    updateTideVisual();

    // tide animation loop: update seaLevel height with sine wave
    let tideStart = performance.now();
    function tideLoop(now){
      const elapsed = (now - tideStart) / 1000; // seconds
      // period ~ 6s for visible classroom demo
      const period = 6.0;
      const theta = (elapsed / period) * Math.PI * 2;
      const amp = parseFloat(seaLevel && seaLevel.dataset.amp) || 20;
      const base = 50; // percent baseline
      // sine between -1..1 mapped to +/- amp pixels
      const offset = Math.sin(theta) * amp;
      if (seaLevel) {
        // seaLevel element positioned from bottom; adjust transform
        seaLevel.style.transform = `translateY(${ -offset }px)`;
      }
      // move moon slowly around Earth for ambience
      if (moonEl) {
        const mx = Math.cos(elapsed * 0.6) * 40; // px
        const my = Math.sin(elapsed * 0.6) * 18;
        moonEl.style.left = (60 + mx) + 'px';
        moonEl.style.top = (22 + my) + 'px';
      }
      // loop
      orbitRAF = requestAnimationFrame(tideLoop);
    }
    orbitRAF = requestAnimationFrame(tideLoop);

    // --- Orbital visualizer ---
    const orbitSvg = document.getElementById('orbitSvg');
    const orbitSpeed = document.getElementById('orbitSpeed');
    const eccentricity = document.getElementById('eccentricity');

    // build orbit scene in SVG
    function buildOrbit(){
      if (!orbitSvg) return;
      while(orbitSvg.firstChild) orbitSvg.removeChild(orbitSvg.firstChild);
      const ns = 'http://www.w3.org/2000/svg';
      const w = 300, h = 240;
      // sun at center
      const sun = document.createElementNS(ns,'circle');
      sun.setAttribute('cx', w/2);
      sun.setAttribute('cy', h/2);
      sun.setAttribute('r', 16);
      sun.setAttribute('fill','#ffcc33');
      sun.setAttribute('id','svgSun');
      orbitSvg.appendChild(sun);

      // orbit path (ellipse) - we'll update attributes later
      const orbitPath = document.createElementNS(ns,'ellipse');
      orbitPath.setAttribute('cx', w/2);
      orbitPath.setAttribute('cy', h/2);
      orbitPath.setAttribute('rx', 90);
      orbitPath.setAttribute('ry', 90 * (1 - parseFloat(eccentricity.value || 0)));
      orbitPath.setAttribute('fill','none');
      orbitPath.setAttribute('stroke','#cbd5e1');
      orbitSvg.appendChild(orbitPath);

      // earth
      const earth = document.createElementNS(ns,'circle');
      earth.setAttribute('r',8);
      earth.setAttribute('fill','#60a5fa');
      earth.setAttribute('id','svgEarth');
      orbitSvg.appendChild(earth);

      // store on element for animation
      orbitSvg._orbit = { w,h,orbitPath,earth };
    }
    buildOrbit();

    let start = performance.now();
    function animateOrbit(now){
      const scene = orbitSvg && orbitSvg._orbit;
      if (!scene) return;
      const speedVal = parseFloat(orbitSpeed ? orbitSpeed.value : 1);
      const ecc = parseFloat(eccentricity ? eccentricity.value : 0.0167);
      const a = 90; // semi-major axis
      const b = Math.max(24, a * (1 - ecc)); // semi-minor as function of ecc
      const cx = scene.w/2, cy = scene.h/2;
      const t = ((now - start) / 1000) * speedVal; // seconds * speed
      // angle advances with time
      const theta = t * 0.9; // rad
      const x = cx + a * Math.cos(theta);
      const y = cy + b * Math.sin(theta);
      // update earth position
      scene.earth.setAttribute('cx', x);
      scene.earth.setAttribute('cy', y);
      // update orbitPath shape
      scene.orbitPath.setAttribute('rx', a);
      scene.orbitPath.setAttribute('ry', b);

      requestAnimationFrame(animateOrbit);
    }
    requestAnimationFrame(animateOrbit);

    // handlers to rebuild when eccentricity changes
    if (eccentricity) eccentricity.addEventListener('input', ()=>{ buildOrbit(); });
    if (orbitSpeed) orbitSpeed.addEventListener('input', ()=>{});

  }
})();
