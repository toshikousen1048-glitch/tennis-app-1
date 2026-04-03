// =====================================================
// 要素取得
// =====================================================
const mobileRallyToggleBtn = document.getElementById('mobile-rally-toggle-btn');
const rallyModeCheckbox    = document.getElementById('rally-mode-checkbox');
const rallyModeLabel       = document.getElementById('rally-mode-label');
const toolbarModeBtn       = document.getElementById('toolbar-mode-btn');
const toolbarPlayBtn       = document.getElementById('toolbar-play-btn');
const toolbarFlipBtn       = document.getElementById('toolbar-flip-btn');
const flipCourtBtnMobile   = document.getElementById('flip-court-btn-mobile');
const flipCourtBtnPC       = document.getElementById('pc-flip-court-btn');
const courtContainer       = document.getElementById('court-container');
const pcFlipGroup          = document.getElementById('pc-flip-group');
const tabCourt             = document.getElementById('tab-court');
const tabControls          = document.getElementById('tab-controls');
const controlPanel         = document.getElementById('control-panel');
const mobilePlayBtn        = document.getElementById('mobile-play-btn');
const svg                  = document.querySelector('svg');
const players              = document.querySelectorAll('.player');
const radioButtonsCourt    = document.querySelectorAll('input[name="court-type"]');
const radioButtonsHeatmap  = document.querySelectorAll('input[name="heatmap-type"]');
const returnCheckbox       = document.getElementById('show-return-angle');
const spinCheckbox         = document.getElementById('spin-effect');
const angleShotSlider      = document.getElementById('angle-shot-range');
const angleShotValueSpan   = document.getElementById('angle-shot-value');
const netRangeSlider       = document.getElementById('net-player-range');
const netRangeValueSpan    = document.getElementById('net-range-value');
const oppNetRangeSlider    = document.getElementById('opp-net-player-range');
const oppNetRangeValueSpan = document.getElementById('opp-net-range-value');
const netPlayerSettings    = document.getElementById('net-player-settings');
const toggleRallyDisplay   = document.getElementById('toggle-rally-display');
const toggleGhostDisplay   = document.getElementById('toggle-ghost-display');
const toggleFanDisplay     = document.getElementById('toggle-fan-display');
const ghostLayer           = document.getElementById('player-ghost-layer');
const geometryGuides       = document.getElementById('geometry-guides');
const heatmapLayer         = document.getElementById('heatmap-layer');
const rallyLayerCommon     = document.getElementById('rally-layer-common');
const rallyLayerA          = document.getElementById('rally-layer-a');
const rallyLayerB          = document.getElementById('rally-layer-b');
const undoRallyBtn         = document.getElementById('undo-rally-btn');
const redoRallyBtn         = document.getElementById('redo-rally-btn');
const clearRallyBtn        = document.getElementById('clear-rally-btn');
const clearAllRallyBtn     = document.getElementById('clear-all-rally-btn');
const snapshotBtn          = document.getElementById('snapshot-btn');
const undoSnapshotBtn      = document.getElementById('undo-snapshot-btn');
const redoSnapshotBtn      = document.getElementById('redo-snapshot-btn');
const clearSnapshotsBtn    = document.getElementById('clear-snapshots-btn');
const playAnimationBtn     = document.getElementById('play-animation-btn');
const exportBtn            = document.getElementById('export-btn');
const importBtn            = document.getElementById('import-btn');
const transferData         = document.getElementById('transfer-data');
const saveBtn              = document.getElementById('save-tactic-btn');
const loadBtn              = document.getElementById('load-tactic-btn');
const deleteBtn            = document.getElementById('delete-tactic-btn');
const tacticNameInput      = document.getElementById('tactic-name');
const savedList            = document.getElementById('saved-tactics-list');

// =====================================================
// シナリオ状態管理
// =====================================================
// activeTab: 'common' | 'a' | 'b' — 現在記録中のタブ
let activeTab = 'common';

// 各シナリオの軌跡データ
const rallyData = {
    common: { points: [], redo: [] },
    a:      { points: [], redo: [] },
    b:      { points: [], redo: [] },
};

// シナリオタブの設定
const SCENARIO_CONFIG = {
    common: { color: '#E91E63', textColor: '#C2185B', marker: 'arrowhead-common', layer: rallyLayerCommon, label: '共通' },
    a:      { color: '#1976D2', textColor: '#0D47A1', marker: 'arrowhead-a',      layer: rallyLayerA,      label: 'A' },
    b:      { color: '#F57C00', textColor: '#E65100', marker: 'arrowhead-b',      layer: rallyLayerB,      label: 'B' },
};

// 陣形記録（共通）
let playerHistory   = [];
let playerRedoStack = [];

let selectedPlayer = null;
let offset         = { x: 0, y: 0 };

const NumberToMaru = ["","①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩"];
function getStepLabel(n) { return n <= 10 ? NumberToMaru[n] : String(n); }

// =====================================================
// シナリオタブ切り替え
// =====================================================
const tabBtnCommon = document.getElementById('tab-common');
const tabBtnA      = document.getElementById('tab-a');
const tabBtnB      = document.getElementById('tab-b');

function switchScenarioTab(tab) {
    activeTab = tab;
    tabBtnCommon.classList.toggle('active', tab === 'common');
    tabBtnA.classList.toggle('active',      tab === 'a');
    tabBtnB.classList.toggle('active',      tab === 'b');
    const labelMap = { common: '共通', a: 'シナリオ A', b: 'シナリオ B' };
    rallyModeLabel.textContent = `画面タッチで軌跡を記録する（${labelMap[tab]}）`;
    updateRallyButtons();
}

tabBtnCommon.addEventListener('click', () => switchScenarioTab('common'));
tabBtnA.addEventListener('click',      () => switchScenarioTab('a'));
tabBtnB.addEventListener('click',      () => switchScenarioTab('b'));

// =====================================================
// UIモード同期
// =====================================================
function updateRallyToggleUI() {
    if (rallyModeCheckbox.checked) {
        if (mobileRallyToggleBtn) { mobileRallyToggleBtn.classList.add('active'); mobileRallyToggleBtn.innerText = '✍️ 軌跡モード'; }
        if (toolbarModeBtn) { toolbarModeBtn.classList.add('active'); toolbarModeBtn.innerHTML = '<span>✍️</span><span>軌跡描画</span>'; }
    } else {
        if (mobileRallyToggleBtn) { mobileRallyToggleBtn.classList.remove('active'); mobileRallyToggleBtn.innerText = '✋ 選手移動'; }
        if (toolbarModeBtn) { toolbarModeBtn.classList.remove('active'); toolbarModeBtn.innerHTML = '<span>✋</span><span>選手移動</span>'; }
    }
}
if (mobileRallyToggleBtn) mobileRallyToggleBtn.addEventListener('click', () => { rallyModeCheckbox.checked = !rallyModeCheckbox.checked; updateRallyToggleUI(); });
if (toolbarModeBtn) toolbarModeBtn.addEventListener('click', () => { rallyModeCheckbox.checked = !rallyModeCheckbox.checked; updateRallyToggleUI(); });
rallyModeCheckbox.addEventListener('change', updateRallyToggleUI);

// =====================================================
// 視点反転
// =====================================================
function toggleFlip() {
    courtContainer.classList.toggle('rotated');
    const r = courtContainer.classList.contains('rotated');
    if (flipCourtBtnMobile) flipCourtBtnMobile.innerText = r ? '🔁 自陣へ' : '🔁 反転';
    if (flipCourtBtnPC)     flipCourtBtnPC.innerText     = r ? '🔁 自陣視点へ戻す' : '🔁 相手視点へ反転';
    if (toolbarFlipBtn)     toolbarFlipBtn.innerHTML     = r ? '<span>🔁</span><span>自陣視点</span>' : '<span>🔁</span><span>相手視点</span>';
}
if (flipCourtBtnMobile) flipCourtBtnMobile.addEventListener('click', toggleFlip);
if (flipCourtBtnPC)     flipCourtBtnPC.addEventListener('click', toggleFlip);
if (toolbarFlipBtn)     toolbarFlipBtn.addEventListener('click', toggleFlip);

// =====================================================
// デバイス別UI
// =====================================================
function adjustUIForDevice() {
    const mobile = window.innerWidth <= 768;
    if (pcFlipGroup)          pcFlipGroup.style.display          = mobile ? 'none'  : 'block';
    if (flipCourtBtnMobile)   flipCourtBtnMobile.style.display   = mobile ? 'block' : 'none';
    if (mobileRallyToggleBtn) mobileRallyToggleBtn.style.display = mobile ? 'block' : 'none';
    if (mobilePlayBtn)        mobilePlayBtn.style.display        = mobile ? 'block' : 'none';
}
window.addEventListener('resize', adjustUIForDevice);
adjustUIForDevice();

function switchMobileTab(target) {
    if (window.innerWidth > 768) return;
    const toCourt = target === 'court';
    tabCourt.classList.toggle('active', toCourt);
    tabControls.classList.toggle('active', !toCourt);
    courtContainer.classList.toggle('active-tab', toCourt);
    controlPanel.classList.toggle('active-tab', !toCourt);
}
if (tabCourt)    tabCourt.addEventListener('click',    () => switchMobileTab('court'));
if (tabControls) tabControls.addEventListener('click', () => switchMobileTab('controls'));
window.addEventListener('resize', () => { if (window.innerWidth > 768) { courtContainer.classList.remove('active-tab'); controlPanel.classList.remove('active-tab'); } else { switchMobileTab('court'); } });

// =====================================================
// ヒートマップグリッド
// =====================================================
const gridCells = [];
const gridSize  = 0.5;
for (let x = 0; x <= 11; x += gridSize) {
    for (let y = 0; y <= 24; y += gridSize) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x); rect.setAttribute('y', y);
        rect.setAttribute('width', gridSize + 0.05); rect.setAttribute('height', gridSize + 0.05);
        rect.setAttribute('fill', 'transparent');
        heatmapLayer.appendChild(rect);
        gridCells.push({ x: x + gridSize / 2, y: y + gridSize / 2, rect });
    }
}

// =====================================================
// コートインタラクション
// =====================================================
svg.addEventListener('mousedown',   handleCourtInteraction);
svg.addEventListener('touchstart',  handleCourtInteraction, { passive: false });
svg.addEventListener('mousemove',   drag);
svg.addEventListener('touchmove',   drag, { passive: false });
svg.addEventListener('mouseup',     endDrag);
svg.addEventListener('touchend',    endDrag);
svg.addEventListener('touchcancel', endDrag);
svg.addEventListener('mouseleave',  endDrag);

radioButtonsCourt.forEach(r => r.addEventListener('change', updateTactics));
radioButtonsHeatmap.forEach(r => r.addEventListener('change', updateTactics));
returnCheckbox.addEventListener('change', updateTactics);
spinCheckbox.addEventListener('change', updateTactics);
angleShotSlider.addEventListener('input', e => { angleShotValueSpan.innerText = e.target.value; updateTactics(); });
netRangeSlider.addEventListener('input', e => { netRangeValueSpan.innerText = e.target.value; updateTactics(); });
oppNetRangeSlider.addEventListener('input', e => { oppNetRangeValueSpan.innerText = e.target.value; updateTactics(); });
toggleRallyDisplay.addEventListener('change', e => {
    [rallyLayerCommon, rallyLayerA, rallyLayerB].forEach(l => l.style.display = e.target.checked ? 'block' : 'none');
});
toggleGhostDisplay.addEventListener('change', e => { ghostLayer.style.display = e.target.checked ? 'block' : 'none'; });
toggleFanDisplay.addEventListener('change', updateTactics);

function getMousePosition(evt) {
    const CTM = svg.getScreenCTM();
    const clientX = evt.touches && evt.touches.length > 0 ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches && evt.touches.length > 0 ? evt.touches[0].clientY : evt.clientY;
    return { x: (clientX - CTM.e) / CTM.a, y: (clientY - CTM.f) / CTM.d };
}

function handleCourtInteraction(evt) {
    if (evt.type === 'touchstart') {
        // スマホでコントロールパネルが表示中（コートが非表示）のときはタッチを横取りしない
        if (!courtContainer.classList.contains('active-tab') && window.innerWidth <= 768) return;
        evt.preventDefault();
    }
    if (animState === 'playing') return;
    const mousePos = getMousePosition(evt);
    if (rallyModeCheckbox.checked) {
        // アクティブなシナリオタブに軌跡を追加
        rallyData[activeTab].points.push(mousePos);
        rallyData[activeTab].redo = [];
        updateRallyButtons();
        drawRallyScenario(activeTab);
        return;
    }
    let closestPlayer = null, minDist = 1.5;
    players.forEach(p => {
        if (p.getAttribute('visibility') === 'hidden') return;
        const d = Math.hypot(parseFloat(p.getAttribute('cx')) - mousePos.x, parseFloat(p.getAttribute('cy')) - mousePos.y);
        if (d < minDist) { minDist = d; closestPlayer = p; }
    });
    if (closestPlayer) {
        selectedPlayer = closestPlayer;
        offset.x = mousePos.x - parseFloat(selectedPlayer.getAttribute('cx'));
        offset.y = mousePos.y - parseFloat(selectedPlayer.getAttribute('cy'));
    }
}

function drag(evt) {
    if (selectedPlayer && animState !== 'playing') {
        if (evt.type === 'touchmove') evt.preventDefault();
        const m = getMousePosition(evt);
        selectedPlayer.setAttribute('cx', m.x - offset.x);
        selectedPlayer.setAttribute('cy', m.y - offset.y);
        updateTactics();
    }
}
function endDrag() { selectedPlayer = null; }

// =====================================================
// 軌跡描画（シナリオ別）
// =====================================================
function updateRallyButtons() {
    undoRallyBtn.disabled = rallyData[activeTab].points.length === 0;
    redoRallyBtn.disabled = rallyData[activeTab].redo.length === 0;
    checkAnimationBtn();
}

undoRallyBtn.addEventListener('click', () => {
    const d = rallyData[activeTab];
    if (d.points.length > 0) { d.redo.push(d.points.pop()); updateRallyButtons(); drawRallyScenario(activeTab); }
});
redoRallyBtn.addEventListener('click', () => {
    const d = rallyData[activeTab];
    if (d.redo.length > 0) { d.points.push(d.redo.pop()); updateRallyButtons(); drawRallyScenario(activeTab); }
});
clearRallyBtn.addEventListener('click', () => {
    rallyData[activeTab].points = []; rallyData[activeTab].redo = [];
    updateRallyButtons(); drawRallyScenario(activeTab);
});
clearAllRallyBtn.addEventListener('click', () => {
    ['common','a','b'].forEach(k => { rallyData[k].points = []; rallyData[k].redo = []; });
    updateRallyButtons(); drawAllRally();
});

function drawRallyScenario(key) {
    const cfg    = SCENARIO_CONFIG[key];
    const points = rallyData[key].points;
    cfg.layer.innerHTML = '';
    for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        if (i > 0) {
            const prev = points[i - 1];
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', prev.x); line.setAttribute('y1', prev.y);
            line.setAttribute('x2', pt.x);   line.setAttribute('y2', pt.y);
            line.setAttribute('stroke', cfg.color); line.setAttribute('stroke-width', '0.08');
            line.setAttribute('stroke-dasharray', '0.3 0.3');
            line.setAttribute('marker-end', `url(#${cfg.marker})`);
            cfg.layer.appendChild(line);
        }
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.x); circle.setAttribute('cy', pt.y);
        circle.setAttribute('r', 0.25); circle.setAttribute('fill', cfg.color);
        cfg.layer.appendChild(circle);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pt.x + 0.35); text.setAttribute('y', pt.y - 0.35);
        text.setAttribute('fill', cfg.textColor); text.setAttribute('font-size', '0.7');
        text.setAttribute('font-weight', 'bold');
        text.textContent = i + 1;
        cfg.layer.appendChild(text);
    }
}

function drawAllRally() {
    ['common','a','b'].forEach(drawRallyScenario);
}

// =====================================================
// スナップショット（陣形記録）
// =====================================================
function updateGhostButtons() {
    undoSnapshotBtn.disabled = playerHistory.length === 0;
    redoSnapshotBtn.disabled = playerRedoStack.length === 0;
    checkAnimationBtn();
}

function getCurrentPlayerPositions() {
    const pos = {};
    players.forEach(p => { pos[p.id] = { x: parseFloat(p.getAttribute('cx')), y: parseFloat(p.getAttribute('cy')) }; });
    return pos;
}

snapshotBtn.addEventListener('click', () => { playerHistory.push(getCurrentPlayerPositions()); playerRedoStack = []; updateGhostButtons(); drawGhosts(); });

undoSnapshotBtn.addEventListener('click', () => {
    if (playerHistory.length > 0) {
        playerRedoStack.push(playerHistory.pop());
        const target = playerHistory.length > 0 ? playerHistory[playerHistory.length - 1]
            : { 'player-me-base': {x:8,y:22}, 'player-opp-base': {x:3,y:2}, 'player-me-net': {x:3,y:14}, 'player-opp-net': {x:8,y:9} };
        for (const id in target) { const n = document.getElementById(id); if (n) { n.setAttribute('cx', target[id].x); n.setAttribute('cy', target[id].y); } }
        updateGhostButtons(); drawGhosts(); updateTactics();
    }
});
redoSnapshotBtn.addEventListener('click', () => {
    if (playerRedoStack.length > 0) {
        const s = playerRedoStack.pop(); playerHistory.push(s);
        for (const id in s) { const n = document.getElementById(id); if (n) { n.setAttribute('cx', s[id].x); n.setAttribute('cy', s[id].y); } }
        updateGhostButtons(); drawGhosts(); updateTactics();
    }
});
clearSnapshotsBtn.addEventListener('click', () => { playerHistory = []; playerRedoStack = []; updateGhostButtons(); drawGhosts(); });

function drawGhosts() {
    ghostLayer.innerHTML = '';
    const isSingles = document.querySelector('input[name="court-type"]:checked').value === 'singles';
    playerHistory.forEach((step, index) => {
        const label = getStepLabel(index + 1);
        for (const id in step) {
            if (isSingles && (id === 'player-me-net' || id === 'player-opp-net')) continue;
            const pos   = step[id];
            const isRed = document.getElementById(id).getAttribute('fill') === '#FF5252';
            const g     = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('opacity', 0.25);
            const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c.setAttribute('cx', pos.x); c.setAttribute('cy', pos.y); c.setAttribute('r', 0.4);
            c.setAttribute('fill', isRed ? '#FF8A80' : '#82B1FF'); c.setAttribute('stroke', 'white'); c.setAttribute('stroke-width', 0.03);
            g.appendChild(c);
            const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t.setAttribute('x', pos.x); t.setAttribute('y', pos.y + 0.15);
            t.setAttribute('font-size', '0.5'); t.setAttribute('font-weight', 'bold');
            t.setAttribute('fill', isRed ? '#b71c1c' : '#0d47a1'); t.setAttribute('text-anchor', 'middle');
            t.textContent = label;
            g.appendChild(t);
            ghostLayer.appendChild(g);
        }
    });
}

// =====================================================
// アニメーション（一時停止/再開対応）
// =====================================================

// 再生状態: 'stopped' | 'playing' | 'paused'
let animState = 'stopped';

// 一時停止時の進捗を保存
// pauseState = {
//   playerStep: number,       // 陣形: 何ステップ目まで完了したか
//   playerProgress: number,   // 陣形: 現在ステップ内の進捗 0.0〜1.0
//   rally: {                  // 各シナリオの軌跡進捗
//     common: { step, progress },
//     a:      { step, progress },
//     b:      { step, progress },
//   }
// }
let pauseState = null;

// 各アニメーションループを外から一時停止させるフラグ
let pauseSignal = false;

function setAnimationButtonState(state) {
    // state: 'playing' | 'paused' | 'stopped'
    const labels = {
        playing: { btn: '⏸ 一時停止',     mobile: '⏸ 停止',  color: '#FF9800' },
        paused:  { btn: '▶ 再生を再開',    mobile: '▶ 再開',  color: '#4CAF50' },
        stopped: { btn: '▶ アニメーション再生', mobile: '▶ 再生', color: '#4CAF50' },
    };
    const cfg = labels[state];
    playAnimationBtn.innerText = cfg.btn;
    playAnimationBtn.style.backgroundColor = cfg.color;
    if (toolbarPlayBtn) {
        const icon = state === 'playing' ? '⏸' : '▶';
        const label = state === 'playing' ? '一時停止' : state === 'paused' ? '再開' : 'アニメ再生';
        toolbarPlayBtn.innerHTML = `<span>${icon}</span><span>${label}</span>`;
        toolbarPlayBtn.style.backgroundColor = cfg.color;
    }
    if (mobilePlayBtn) {
        mobilePlayBtn.innerText = cfg.mobile;
        mobilePlayBtn.classList.toggle('playing', state === 'playing');
    }
}

function checkAnimationBtn() {
    if (animState !== 'stopped') return;
    const hasRally   = Object.values(rallyData).some(d => d.points.length >= 2);
    const hasHistory = playerHistory.length >= 2;
    const disabled   = !hasRally && !hasHistory;
    playAnimationBtn.disabled = disabled;
    if (toolbarPlayBtn) toolbarPlayBtn.disabled = disabled;
    if (mobilePlayBtn)  mobilePlayBtn.disabled  = disabled;
}

function finishAnimation() {
    animState  = 'stopped';
    pauseState = null;
    pauseSignal = false;
    setAnimationButtonState('stopped');
    drawAllRally();
    checkAnimationBtn();
}

// pauseSignal が立つまで待つ / 完了なら false、一時停止なら true を返す
const pauseableDelay = ms => new Promise(resolve => {
    let start = null;
    function loop(t) {
        if (pauseSignal) return resolve(true);
        if (!start) start = t;
        if (t - start >= ms) return resolve(false);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
});

if (toolbarPlayBtn) toolbarPlayBtn.addEventListener('click', () => playAnimationBtn.click());
if (mobilePlayBtn)  mobilePlayBtn.addEventListener('click',  () => playAnimationBtn.click());

playAnimationBtn.addEventListener('click', async () => {
    // ── 再生中 → 一時停止 ──
if (animState === 'playing') {
        pauseSignal = true;
        // pauseState への書き込みはrunAnimation内のframeループが担うので、
        // ここではUIだけ先に切り替えて待つ
        animState   = 'paused';
        setAnimationButtonState('paused');
        return;
    }

    // ── 一時停止中 → 再開 ──
    if (animState === 'paused') {
        pauseSignal = false;
        animState   = 'playing';
        setAnimationButtonState('playing');
        await runAnimation(pauseState);  // 保存した進捗から再開
        return;
    }

    // ── 停止中 → 最初から再生 ──
    const hasRally   = Object.values(rallyData).some(d => d.points.length >= 2);
    const hasHistory = playerHistory.length >= 2;
    if (!hasRally && !hasHistory) return;

    // 初期位置リセット
    if (playerHistory.length >= 2) {
        for (const id in playerHistory[0]) {
            const n = document.getElementById(id);
            if (n) { n.setAttribute('cx', playerHistory[0][id].x); n.setAttribute('cy', playerHistory[0][id].y); }
        }
        updateTactics();
    }
    // 全シナリオ軌跡レイヤーをクリア
    ['common','a','b'].forEach(k => SCENARIO_CONFIG[k].layer.innerHTML = '');

    // 進捗を最初に初期化
    pauseState = {
        playerStep:     0,
        playerProgress: 0,
        rally: {
            common: { step: 0, progress: 0 },
            a:      { step: 0, progress: 0 },
            b:      { step: 0, progress: 0 },
        }
    };

    pauseSignal = false;
    animState   = 'playing';
    setAnimationButtonState('playing');

    // 冒頭の少し間
    if (await pauseableDelay(400)) return; // 一時停止された

    await runAnimation(pauseState);
});

// ── 実際のアニメーションループ（progressから再開可能）──
async function runAnimation(state) {
    const ANIM_MS = 800, INTERVAL_MS = 200;

    // 陣形アニメーション（state.playerStep / playerProgress から再開）
    const animatePlayers = () => new Promise(async resolve => {
        if (playerHistory.length < 2) return resolve();
        for (let step = state.playerStep; step < playerHistory.length - 1; step++) {
        if (pauseSignal) { state.playerStep = step; state.playerProgress = 0; return resolve(); }            
            const from = playerHistory[step], to = playerHistory[step + 1];
            // 再開時はそのステップ内の残り時間から始める
            const startProgress = (step === state.playerStep) ? state.playerProgress : 0;
            const startMs       = startProgress * ANIM_MS;

            await new Promise(res => {
                let t0 = null;
                function frame(t) {
                    if (pauseSignal) {
                        // 現在の進捗を保存してから停止
                        const elapsed  = t0 ? Math.min(t - t0 + startMs, ANIM_MS) : startMs;
                        state.playerStep     = step;
                        state.playerProgress = elapsed / ANIM_MS;
                        return res();
                    }
                    if (!t0) t0 = t;
                    let p = Math.min((t - t0 + startMs) / ANIM_MS, 1);
                    const e = p < .5 ? 2*p*p : -1+(4-2*p)*p;
                    for (const id in from) {
                        const n = document.getElementById(id);
                        if (n) {
                            n.setAttribute('cx', from[id].x + (to[id].x - from[id].x) * e);
                            n.setAttribute('cy', from[id].y + (to[id].y - from[id].y) * e);
                        }
                    }
                    updateTactics();
                    if (p < 1) { requestAnimationFrame(frame); } else { state.playerStep = step + 1; state.playerProgress = 0; res(); }
                }
                requestAnimationFrame(frame);
            });
            if (pauseSignal) return resolve();
            if (step < playerHistory.length - 2) { if (await pauseableDelay(INTERVAL_MS)) return resolve(); }
        }
        resolve();
    });

    // 軌跡アニメーション（各シナリオ、state.rally[key].step / progress から再開）
    const animateRally = (key) => new Promise(async resolve => {
        const pts = rallyData[key].points;
        const cfg = SCENARIO_CONFIG[key];
        if (pts.length < 2) return resolve();

        const rs = state.rally[key];

        function dot(pt, i) {
            const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.setAttribute('r', 0.25); c.setAttribute('fill', cfg.color);
            cfg.layer.appendChild(c);
            const tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            tx.setAttribute('x', pt.x + 0.35); tx.setAttribute('y', pt.y - 0.35);
            tx.setAttribute('fill', cfg.textColor); tx.setAttribute('font-size', '0.7'); tx.setAttribute('font-weight', 'bold');
            tx.textContent = i + 1; cfg.layer.appendChild(tx);
        }

        // 再開時: 既に描画済みの点を素早く復元
        if (rs.step > 0) {
            dot(pts[0], 0);
            for (let i = 0; i < rs.step; i++) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', pts[i].x); line.setAttribute('y1', pts[i].y);
                line.setAttribute('x2', pts[i+1].x); line.setAttribute('y2', pts[i+1].y);
                line.setAttribute('stroke', cfg.color); line.setAttribute('stroke-width', '0.08');
                line.setAttribute('stroke-dasharray', '0.3 0.3'); line.setAttribute('marker-end', `url(#${cfg.marker})`);
                cfg.layer.insertBefore(line, cfg.layer.firstChild);
                dot(pts[i+1], i+1);
            }
        } else {
            dot(pts[0], 0);
        }

        for (let step = rs.step; step < pts.length - 1; step++) {
            if (pauseSignal) { rs.step = step; rs.progress = 0; return resolve(); }            
            const from = pts[step], to = pts[step + 1];
            const startProgress = (step === rs.step) ? rs.progress : 0;
            const startMs       = startProgress * ANIM_MS;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', from.x); line.setAttribute('y1', from.y);
            // 再開時は途中位置から描画
            const resumeX = from.x + (to.x - from.x) * startProgress;
            const resumeY = from.y + (to.y - from.y) * startProgress;
            line.setAttribute('x2', resumeX); line.setAttribute('y2', resumeY);
            line.setAttribute('stroke', cfg.color); line.setAttribute('stroke-width', '0.08');
            line.setAttribute('stroke-dasharray', '0.3 0.3'); line.setAttribute('marker-end', `url(#${cfg.marker})`);
            cfg.layer.insertBefore(line, cfg.layer.firstChild);

            await new Promise(res => {
                let t0 = null;
                function frame(t) {
                    if (pauseSignal) {
                        const elapsed = t0 ? Math.min(t - t0 + startMs, ANIM_MS) : startMs;
                        rs.step = step; rs.progress = elapsed / ANIM_MS;
                        return res();
                    }
                    if (!t0) t0 = t;
                    let p = Math.min((t - t0 + startMs) / ANIM_MS, 1);
                    const e = p < .5 ? 2*p*p : -1+(4-2*p)*p;
                    line.setAttribute('x2', from.x + (to.x - from.x) * e);
                    line.setAttribute('y2', from.y + (to.y - from.y) * e);
                    if (p < 1) { requestAnimationFrame(frame); } else { rs.step = step + 1; rs.progress = 0; res(); }
                }
                requestAnimationFrame(frame);
            });
            if (pauseSignal) return resolve();
            dot(to, step + 1);
            if (step < pts.length - 2) { if (await pauseableDelay(INTERVAL_MS)) return resolve(); }
        }
        resolve();
    });

    // 全トラックを並列実行
    await Promise.all([
        animatePlayers(),
        animateRally('common'),
        animateRally('a'),
        animateRally('b'),
    ]);

    // 一時停止でなく自然終了した場合だけfinish
    if (!pauseSignal) finishAnimation();
}

// =====================================================
// localStorage ラッパー
// =====================================================
function storageGet(key)      { try { return localStorage.getItem(key); }          catch(e) { return null; } }
function storageSet(key, val) { try { localStorage.setItem(key, val); return true; } catch(e) { return false; } }

// =====================================================
// エクスポート / インポート
// =====================================================
exportBtn.addEventListener('click', async () => {
    const saved = storageGet('tennis_master_tactics') || '{}';
    if (saved === '{}') { alert('保存された戦術データがありません。先に戦術を保存してください。'); return; }
    transferData.value = saved;
    try {
        if (navigator.clipboard) { await navigator.clipboard.writeText(saved); alert('すべての戦術データをコピーしました！\nLINE等で他の端末に送ってください。'); }
        else { transferData.select(); transferData.setSelectionRange(0, 99999); document.execCommand('copy'); alert('戦術データをコピーしました！'); }
    } catch (e) { alert('自動コピーに失敗しました。下のテキストを手動でコピーしてください。'); }
});

importBtn.addEventListener('click', () => {
    const json = transferData.value.trim();
    if (!json) { alert('復元するデータ文字列を貼り付けてください。'); return; }
    try {
        const parsed = JSON.parse(json);
        if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
        const merged = { ...JSON.parse(storageGet('tennis_master_tactics') || '{}'), ...parsed };
        if (!storageSet('tennis_master_tactics', JSON.stringify(merged))) { alert('ストレージへの保存に失敗しました。'); return; }
        loadSavedTacticsList(); transferData.value = '';
        alert('戦術データを復元・統合しました！プルダウンから読み込んでください。');
    } catch { alert('無効なデータ文字列です。'); }
});

// =====================================================
// Save / Load
// =====================================================
function loadSavedTacticsList() {
    const saved = JSON.parse(storageGet('tennis_master_tactics') || '{}');
    savedList.innerHTML = '<option value="">-- 保存された戦術を選択 --</option>';
    for (const name in saved) { const o = document.createElement('option'); o.value = name; o.textContent = name; savedList.appendChild(o); }
}

saveBtn.addEventListener('click', () => {
    const name = tacticNameInput.value.trim();
    if (!name) { alert('戦術名を入力してください。'); return; }
    const data = {
        players: getCurrentPlayerPositions(),
        settings: {
            courtType:     document.querySelector('input[name="court-type"]:checked').value,
            heatmapType:   document.querySelector('input[name="heatmap-type"]:checked').value,
            showReturnAngle: returnCheckbox.checked,
            spinEffect:    spinCheckbox.checked,
            angleShot:     angleShotSlider.value,
            showFanDisplay: toggleFanDisplay.checked,
            netRange:      netRangeSlider.value,
            oppNetRange:   oppNetRangeSlider.value,
        },
        // シナリオ別軌跡を保存
        rallyScenarios: {
            common: JSON.parse(JSON.stringify(rallyData.common.points)),
            a:      JSON.parse(JSON.stringify(rallyData.a.points)),
            b:      JSON.parse(JSON.stringify(rallyData.b.points)),
        },
        playerHistory: JSON.parse(JSON.stringify(playerHistory)),
    };
    const saved = JSON.parse(storageGet('tennis_master_tactics') || '{}');
    saved[name] = data;
    if (!storageSet('tennis_master_tactics', JSON.stringify(saved))) { alert('保存に失敗しました。'); return; }
    tacticNameInput.value = ''; loadSavedTacticsList(); alert(`戦術「${name}」を保存しました。`);
});

loadBtn.addEventListener('click', () => {
    const name = savedList.value; if (!name) return;
    const data = JSON.parse(storageGet('tennis_master_tactics') || '{}')[name]; if (!data) return;
    for (const id in data.players) { const n = document.getElementById(id); if (n) { n.setAttribute('cx', data.players[id].x); n.setAttribute('cy', data.players[id].y); } }
    document.querySelector(`input[name="court-type"][value="${data.settings.courtType}"]`).checked = true;
    document.querySelector(`input[name="heatmap-type"][value="${data.settings.heatmapType}"]`).checked = true;
    returnCheckbox.checked = data.settings.showReturnAngle;
    spinCheckbox.checked   = data.settings.spinEffect || false;
    angleShotSlider.value  = data.settings.angleShot; angleShotValueSpan.innerText = data.settings.angleShot;
    if (data.settings.showFanDisplay !== undefined) toggleFanDisplay.checked = data.settings.showFanDisplay;
    if (data.settings.netRange)    { netRangeSlider.value = data.settings.netRange; netRangeValueSpan.innerText = data.settings.netRange; }
    if (data.settings.oppNetRange) { oppNetRangeSlider.value = data.settings.oppNetRange; oppNetRangeValueSpan.innerText = data.settings.oppNetRange; }

    // シナリオ別軌跡の復元（旧フォーマット互換）
    if (data.rallyScenarios) {
        rallyData.common.points = data.rallyScenarios.common || [];
        rallyData.a.points      = data.rallyScenarios.a      || [];
        rallyData.b.points      = data.rallyScenarios.b      || [];
    } else if (data.rally) {
        // 旧フォーマット（共通のみ）
        rallyData.common.points = data.rally; rallyData.a.points = []; rallyData.b.points = [];
    }
    rallyData.common.redo = []; rallyData.a.redo = []; rallyData.b.redo = [];

    playerHistory = data.playerHistory || []; playerRedoStack = [];
    updateRallyButtons(); updateGhostButtons(); drawAllRally(); drawGhosts(); updateTactics();
});

deleteBtn.addEventListener('click', () => {
    const name = savedList.value; if (!name) return;
    if (confirm(`戦術「${name}」を削除してもよろしいですか？`)) {
        const saved = JSON.parse(storageGet('tennis_master_tactics') || '{}');
        delete saved[name]; storageSet('tennis_master_tactics', JSON.stringify(saved)); loadSavedTacticsList();
    }
});
loadSavedTacticsList();

// =====================================================
// updateTactics（幾何学ガイド・ヒートマップ更新）
// =====================================================
function updateTactics() {
    const courtType = document.querySelector('input[name="court-type"]:checked').value;
    const isSingles = courtType === 'singles';

    document.getElementById('player-me-net').setAttribute('visibility',  isSingles ? 'hidden' : 'visible');
    document.getElementById('player-opp-net').setAttribute('visibility', isSingles ? 'hidden' : 'visible');
    document.getElementById('net-player-cover').setAttribute('visibility', isSingles ? 'hidden' : 'visible');
    document.getElementById('opp-net-cover').setAttribute('visibility',    isSingles ? 'hidden' : 'visible');
    netPlayerSettings.style.display = isSingles ? 'none' : 'block';

    const px  = parseFloat(document.getElementById('player-opp-base').getAttribute('cx'));
    const py  = parseFloat(document.getElementById('player-opp-base').getAttribute('cy'));
    const mx  = parseFloat(document.getElementById('player-me-base').getAttribute('cx'));
    const my  = parseFloat(document.getElementById('player-me-base').getAttribute('cy'));
    const nx  = parseFloat(document.getElementById('player-me-net').getAttribute('cx'));
    const ny  = parseFloat(document.getElementById('player-me-net').getAttribute('cy'));
    const nr  = parseFloat(netRangeSlider.value);
    const onx = parseFloat(document.getElementById('player-opp-net').getAttribute('cx'));
    const ony = parseFloat(document.getElementById('player-opp-net').getAttribute('cy'));
    const onr = parseFloat(oppNetRangeSlider.value);
    const ae  = parseFloat(angleShotSlider.value);
    const sp  = spinCheckbox.checked;

    let ax, bx, ay, by;
    if (isSingles)              { ax = 1.37 - ae;  bx = 9.60 + ae;                           ay = by = 23.77; }
    else if (courtType === 'serve-deuce') { ax = 5.485 - ae; bx = 9.60  + (sp ? 1.5 : 0) + ae; ay = by = 18.285; }
    else if (courtType === 'serve-ad')    { ax = 1.37 - (sp ? 1.5 : 0) - ae; bx = 5.485 + ae;  ay = by = 18.285; }
    else                        { ax = 0.00 - ae;  bx = 10.97 + ae;                          ay = by = 23.77; }

    document.getElementById('target-line').setAttribute('x1', ax); document.getElementById('target-line').setAttribute('y1', ay);
    document.getElementById('target-line').setAttribute('x2', bx); document.getElementById('target-line').setAttribute('y2', by);

    const ext = 2.5;
    document.getElementById('fan-area').setAttribute('points',
        `${px},${py} ${px+(ax-px)*ext},${py+(ay-py)*ext} ${px+(bx-px)*ext},${py+(by-py)*ext}`);

    document.getElementById('mask-net-circle').setAttribute('cx', nx); document.getElementById('mask-net-circle').setAttribute('cy', ny); document.getElementById('mask-net-circle').setAttribute('r', isSingles ? 0 : nr);
    document.getElementById('net-player-cover').setAttribute('cx', nx); document.getElementById('net-player-cover').setAttribute('cy', ny); document.getElementById('net-player-cover').setAttribute('r', nr);
    document.getElementById('opp-net-cover').setAttribute('cx', onx);  document.getElementById('opp-net-cover').setAttribute('cy', ony);  document.getElementById('opp-net-cover').setAttribute('r', onr);

    const lenA = Math.hypot(ax-px, ay-py), lenB = Math.hypot(bx-px, by-py);
    const dirX = (ax-px)/lenA + (bx-px)/lenB, dirY = (ay-py)/lenA + (by-py)/lenB;
    document.getElementById('center-line').setAttribute('x1', px); document.getElementById('center-line').setAttribute('y1', py);
    document.getElementById('center-line').setAttribute('x2', px+dirX*40); document.getElementById('center-line').setAttribute('y2', py+dirY*40);

    const returnFan = document.getElementById('return-fan-area');
    if (returnCheckbox.checked) {
        returnFan.style.display = 'block';
        const rax = isSingles ? 1.37-ae : 0.00-ae, rbx = isSingles ? 9.60+ae : 10.97+ae;
        const extR = 1.5;
        returnFan.setAttribute('points', `${mx},${my} ${mx+(rax-mx)*extR},${my+(0-my)*extR} ${mx+(rbx-mx)*extR},${my+(0-my)*extR}`);
    } else { returnFan.style.display = 'none'; }

    const heatmapMode = document.querySelector('input[name="heatmap-type"]:checked').value;
    const showFan     = toggleFanDisplay.checked;
    if (heatmapMode === 'none') {
        heatmapLayer.style.display = 'none';
        geometryGuides.style.display = showFan ? 'block' : 'none';
    } else {
        heatmapLayer.style.display = 'block';
        geometryGuides.style.display = 'none';
        gridCells.forEach(cell => {
            if (isSingles && (cell.x < 1.37 || cell.x > 9.60)) { cell.rect.setAttribute('fill', 'transparent'); return; }
            if (cell.y < 11.885) { cell.rect.setAttribute('fill', 'transparent'); return; }
            const distNet  = Math.hypot(cell.x - nx, cell.y - ny);
            if (!isSingles && distNet <= nr) { cell.rect.setAttribute('fill', 'rgba(0,200,0,0.4)'); return; }
            const distBase = Math.hypot(cell.x - mx, cell.y - my);
            const danger   = Math.max(0, Math.min(1, (distBase - (isSingles ? 1.0 : 1.5)) / (isSingles ? 9 : 8)));
            cell.rect.setAttribute('fill', `rgba(${Math.floor(255*danger)},${Math.floor(255*(1-danger))},0,0.5)`);
        });
    }
    drawGhosts();
}

// =====================================================
// 初期化
// =====================================================
updateTactics();
switchScenarioTab('common');