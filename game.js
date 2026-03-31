// ==================== 飞机大战 - Pureshot ====================
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 480;
canvas.height = 640;

// ==================== 音效系统 ====================
let audioCtx = null;
let audioUnlocked = false;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // iOS Safari 需要在触摸事件中 resume 并播放一个空声音来解锁
    if (!audioUnlocked && audioCtx) {
        audioCtx.resume().then(() => {
            // 播放一个静音buffer来解锁iOS音频
            const silentBuffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
            const source = audioCtx.createBufferSource();
            source.buffer = silentBuffer;
            source.connect(audioCtx.destination);
            source.start(0);
            audioUnlocked = true;
        });
    }
}

function playSound(type) {
    if (!audioCtx || audioCtx.state === 'suspended') return;
    const now = audioCtx.currentTime;
    const gain = audioCtx.createGain();
    gain.connect(audioCtx.destination);
    const osc = audioCtx.createOscillator();
    osc.connect(gain);

    if (type === 'shoot') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
    } else if (type === 'explode') {
        // 用噪声模拟爆炸
        const bufferSize = audioCtx.sampleRate * 0.3;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        noise.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noise.start(now);
        noise.stop(now + 0.3);
        // 低频轰鸣
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'bossExplode') {
        // 大爆炸
        const bufferSize = audioCtx.sampleRate * 0.8;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        noise.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noise.start(now);
        noise.stop(now + 0.8);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(15, now + 0.8);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
    } else if (type === 'bomb') {
        // 全屏炸弹
        const bufferSize = audioCtx.sampleRate * 0.6;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.35, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        noise.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noise.start(now);
        noise.stop(now + 0.6);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'powerup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        osc.frequency.setValueAtTime(784, now + 0.16);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
    } else if (type === 'playerHit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'select') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(800, now + 0.06);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
    } else if (type === 'start') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(550, now + 0.1);
        osc.frequency.setValueAtTime(660, now + 0.2);
        osc.frequency.setValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.setValueAtTime(0.12, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
    }
}

// ==================== 游戏状态 ====================
const STATE = { MENU: 0, PLAYING: 1, PAUSED: 2, GAME_OVER: 3, STAGE_CLEAR: 4, WIN: 5 };
let gameState = STATE.MENU;
let score = 0;
let lives = 3;
let stage = 1;
const MAX_STAGE = 5;
let stageTimer = 0;
let stageTransitionTimer = 0;
let keys = {};
let bullets = [];
let enemyBullets = [];
let enemies = [];
let particles = [];
let powerUps = [];
let stars = [];
let shakeTimer = 0;
let shakeIntensity = 0;
let bossWarningTimer = 0;
let bossActive = false;
let difficulty = 'normal'; // 'easy' or 'normal'
let hitFlashTimer = 0;       // 全屏白闪
let slowMoTimer = 0;         // 击杀慢动作
let damageNumbers = [];      // 伤害数字
let menuSelection = 0; // 0 = easy, 1 = normal

// ==================== 触摸控制 ====================
let touch = { active: false, x: 0, y: 0, startX: 0, startY: 0, playerStartX: 0, playerStartY: 0 };
let isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

// Canvas缩放适配
let canvasScale = 1;
let canvasOffsetX = 0;
let canvasOffsetY = 0;

function resizeCanvas() {
    const ratio = canvas.width / canvas.height;
    let w = window.innerWidth;
    let h = window.innerHeight;
    if (w / h > ratio) {
        w = h * ratio;
    } else {
        h = w / ratio;
    }
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvasScale = canvas.width / w;
    const rect = canvas.getBoundingClientRect();
    canvasOffsetX = rect.left;
    canvasOffsetY = rect.top;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getTouchPos(e) {
    const t = e.touches[0] || e.changedTouches[0];
    return {
        x: (t.clientX - canvasOffsetX) * canvasScale,
        y: (t.clientY - canvasOffsetY) * canvasScale
    };
}

// ==================== 玩家 ====================
const player = {
    x: 240, y: 560, w: 32, h: 32,
    speed: 5, fireRate: 10, fireTimer: 0,
    power: 1, invincible: 0, bombCount: 3
};

// ==================== 星空背景 ====================
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random() * 2,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random()
    });
}

// ==================== 绘制函数 ====================
function drawPlayer() {
    if (player.invincible > 0 && Math.floor(player.invincible / 3) % 2 === 0) return;
    const cx = player.x;
    const cy = player.y;
    ctx.save();
    // 火焰尾迹
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + 16);
    ctx.lineTo(cx, cy + 22 + Math.random() * 6);
    ctx.lineTo(cx + 6, cy + 16);
    ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy + 16);
    ctx.lineTo(cx, cy + 18 + Math.random() * 4);
    ctx.lineTo(cx + 3, cy + 16);
    ctx.fill();
    // 机身
    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16);
    ctx.lineTo(cx - 8, cy + 4);
    ctx.lineTo(cx - 6, cy + 16);
    ctx.lineTo(cx + 6, cy + 16);
    ctx.lineTo(cx + 8, cy + 4);
    ctx.closePath();
    ctx.fill();
    // 机翼
    ctx.fillStyle = '#29b6f6';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + 4);
    ctx.lineTo(cx - 20, cy + 14);
    ctx.lineTo(cx - 6, cy + 12);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy + 4);
    ctx.lineTo(cx + 20, cy + 14);
    ctx.lineTo(cx + 6, cy + 12);
    ctx.closePath();
    ctx.fill();
    // 驾驶舱
    ctx.fillStyle = '#e0f7fa';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 4, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawEnemy(e) {
    const cx = e.x;
    const cy = e.y;
    ctx.save();
    // 受击闪白效果
    if (e.flashTimer > 0) {
        ctx.globalAlpha = 0.5 + Math.random() * 0.5;
    }
    if (e.type === 'boss') {
        // Boss
        const hpRatio = e.hp / e.maxHp;
        // 机身
        ctx.fillStyle = '#e53935';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 30);
        ctx.lineTo(cx - 25, cy);
        ctx.lineTo(cx - 20, cy + 20);
        ctx.lineTo(cx + 20, cy + 20);
        ctx.lineTo(cx + 25, cy);
        ctx.closePath();
        ctx.fill();
        // 机翼
        ctx.fillStyle = '#c62828';
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy);
        ctx.lineTo(cx - 45, cy + 15);
        ctx.lineTo(cx - 15, cy + 15);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 20, cy);
        ctx.lineTo(cx + 45, cy + 15);
        ctx.lineTo(cx + 15, cy + 15);
        ctx.closePath();
        ctx.fill();
        // 驾驶舱
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 8, 6, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // 受击闪白覆盖
        if (e.flashTimer > 0) {
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(cx - 50, cy - 35, 100, 60);
            ctx.globalCompositeOperation = 'source-over';
        }
        // 血条
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#333';
        ctx.fillRect(cx - 40, cy - 45, 80, 6);
        ctx.fillStyle = hpRatio > 0.5 ? '#4caf50' : hpRatio > 0.25 ? '#ff9800' : '#f44336';
        ctx.fillRect(cx - 40, cy - 45, 80 * hpRatio, 6);
    } else if (e.type === 'medium') {
        ctx.fillStyle = '#ff9800';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 14);
        ctx.lineTo(cx - 14, cy + 6);
        ctx.lineTo(cx - 10, cy + 14);
        ctx.lineTo(cx + 10, cy + 14);
        ctx.lineTo(cx + 14, cy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f57c00';
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy + 2);
        ctx.lineTo(cx - 22, cy + 12);
        ctx.lineTo(cx - 8, cy + 10);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 10, cy + 2);
        ctx.lineTo(cx + 22, cy + 12);
        ctx.lineTo(cx + 8, cy + 10);
        ctx.closePath();
        ctx.fill();
    } else {
        // 小敌机
        ctx.fillStyle = '#ef5350';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx - 10, cy + 6);
        ctx.lineTo(cx - 6, cy + 10);
        ctx.lineTo(cx + 6, cy + 10);
        ctx.lineTo(cx + 10, cy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#c62828';
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy + 2);
        ctx.lineTo(cx - 15, cy + 10);
        ctx.lineTo(cx - 6, cy + 8);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy + 2);
        ctx.lineTo(cx + 15, cy + 10);
        ctx.lineTo(cx + 6, cy + 8);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
}

function drawBullet(b) {
    ctx.save();
    if (b.isEnemy) {
        ctx.fillStyle = '#ff5252';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r || 3, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = '#76ff03';
        ctx.shadowColor = '#76ff03';
        ctx.shadowBlur = 8;
        ctx.fillRect(b.x - 2, b.y - 6, 4, 12);
    }
    ctx.restore();
}

function drawPowerUp(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    const pulse = 1 + Math.sin(Date.now() / 200) * 0.1;
    ctx.scale(pulse, pulse);
    if (p.type === 'power') {
        ctx.fillStyle = '#ff9800';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('P', 0, 6);
    } else if (p.type === 'bomb') {
        ctx.fillStyle = '#2196f3';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('B', 0, 6);
    } else if (p.type === 'life') {
        ctx.fillStyle = '#f44336';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♥', 0, 6);
    }
    ctx.restore();
}

// ==================== 粒子效果 ====================
function createExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 20 + Math.random() * 20,
            maxLife: 40,
            color,
            size: 1 + Math.random() * 3
        });
    }
}

function vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
}

function screenShake(intensity, duration) {
    shakeIntensity = intensity;
    shakeTimer = duration;
    // 震动强度按屏幕震动等级映射
    if (intensity >= 10) vibrate([50, 30, 80, 30, 50]); // 大爆炸：连续震动
    else if (intensity >= 8) vibrate([40, 20, 60]);       // 炸弹
    else vibrate(30);                                      // 轻微
}

// ==================== 子弹发射 ====================
function playerShoot() {
    playSound('shoot');
    const bx = player.x;
    const by = player.y - 16;
    if (player.power === 1) {
        bullets.push({ x: bx, y: by, vx: 0, vy: -10, w: 4, h: 12 });
    } else if (player.power === 2) {
        bullets.push({ x: bx - 8, y: by, vx: 0, vy: -10, w: 4, h: 12 });
        bullets.push({ x: bx + 8, y: by, vx: 0, vy: -10, w: 4, h: 12 });
    } else {
        bullets.push({ x: bx, y: by, vx: 0, vy: -10, w: 4, h: 12 });
        bullets.push({ x: bx - 14, y: by + 4, vx: -1.5, vy: -9, w: 4, h: 12 });
        bullets.push({ x: bx + 14, y: by + 4, vx: 1.5, vy: -9, w: 4, h: 12 });
    }
}

// ==================== 敌人生成 ====================
function spawnEnemy() {
    const stageConfig = getStageConfig(stage);
    if (bossActive) return;

    if (Math.random() < stageConfig.spawnRate) {
        const type = Math.random() < stageConfig.mediumRate ? 'medium' : 'small';
        const e = {
            type,
            x: 30 + Math.random() * (canvas.width - 60),
            y: -20,
            w: type === 'medium' ? 28 : 20,
            h: type === 'medium' ? 28 : 20,
            hp: type === 'medium' ? 5 + stage : 1 + Math.floor(stage / 2),
            speed: type === 'medium' ? 1 + stage * 0.2 : 1.5 + stage * 0.3,
            fireRate: type === 'medium' ? 60 : 120,
            fireTimer: Math.random() * 60,
            score: type === 'medium' ? 200 : 100,
            movePattern: Math.floor(Math.random() * 3),
            moveTimer: 0,
            startX: 0
        };
        e.startX = e.x;
        enemies.push(e);
    }
}

function spawnBoss() {
    bossActive = true;
    bossWarningTimer = 120;
    const easy = difficulty === 'easy';
    const bossHp = easy ? 30 + stage * 15 : 50 + stage * 30;
    enemies.push({
        type: 'boss',
        x: canvas.width / 2, y: -40,
        w: 60, h: 50,
        hp: bossHp, maxHp: bossHp,
        speed: easy ? 1 : 1.5,
        fireRate: easy ? 30 - stage * 2 : 20 - stage * 2,
        fireTimer: 0,
        score: 2000 + stage * 1000,
        movePattern: 0, moveTimer: 0,
        startX: canvas.width / 2,
        phase: 0,
        entering: true
    });
}

function getStageConfig(s) {
    const easy = difficulty === 'easy';
    return {
        spawnRate: easy ? 0.012 + s * 0.004 : 0.02 + s * 0.008,
        mediumRate: easy ? 0.05 + s * 0.04 : 0.1 + s * 0.08,
        duration: easy ? 900 + s * 200 : 1200 + s * 300,
        bgColor: ['#0a0a2e', '#1a0a0a', '#0a1a0a', '#1a1a0a', '#0a0a1a'][s - 1] || '#0a0a2e'
    };
}

// ==================== 敌人AI ====================
function updateEnemyAI(e) {
    e.moveTimer++;
    if (e.type === 'boss') {
        if (e.entering) {
            e.y += 1.5;
            if (e.y >= 70) {
                e.entering = false;
                e.startX = e.x;
            }
            return;
        }
        // Boss移动模式
        const phase = Math.floor(e.moveTimer / 180) % 3;
        if (phase === 0) {
            e.x = e.startX + Math.sin(e.moveTimer * 0.02) * 150;
        } else if (phase === 1) {
            e.x += Math.cos(e.moveTimer * 0.03) * 3;
            e.y = 70 + Math.sin(e.moveTimer * 0.02) * 30;
        } else {
            e.x = canvas.width / 2 + Math.cos(e.moveTimer * 0.015) * 180;
        }
        e.x = Math.max(50, Math.min(canvas.width - 50, e.x));
        // Boss射击
        e.fireTimer++;
        if (e.fireTimer >= Math.max(8, e.fireRate)) {
            e.fireTimer = 0;
            const hpRatio = e.hp / e.maxHp;
            if (hpRatio > 0.6) {
                // 普通弹幕
                const angle = Math.atan2(player.y - e.y, player.x - e.x);
                enemyBullets.push({ x: e.x, y: e.y + 20, vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4, r: 4, isEnemy: true });
            } else if (hpRatio > 0.3) {
                // 扇形弹幕
                for (let i = -2; i <= 2; i++) {
                    const angle = Math.PI / 2 + i * 0.25;
                    enemyBullets.push({ x: e.x, y: e.y + 20, vx: Math.cos(angle) * 3.5, vy: Math.sin(angle) * 3.5, r: 3, isEnemy: true });
                }
            } else {
                // 螺旋弹幕
                const angle = e.moveTimer * 0.15;
                for (let i = 0; i < 3; i++) {
                    const a = angle + i * (Math.PI * 2 / 3);
                    enemyBullets.push({ x: e.x, y: e.y + 20, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, r: 3, isEnemy: true });
                }
            }
        }
    } else {
        // 普通敌机移动
        e.y += e.speed;
        if (e.movePattern === 1) {
            e.x = e.startX + Math.sin(e.moveTimer * 0.05) * 60;
        } else if (e.movePattern === 2) {
            e.x += Math.cos(e.moveTimer * 0.03) * 2;
        }
        // 射击
        e.fireTimer++;
        if (e.fireTimer >= e.fireRate && e.y > 0) {
            e.fireTimer = 0;
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            enemyBullets.push({ x: e.x, y: e.y + 10, vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3, r: 3, isEnemy: true });
        }
    }
}

// ==================== 炸弹 ====================
function useBomb() {
    if (player.bombCount <= 0) return;
    player.bombCount--;
    playSound('bomb');
    screenShake(8, 20);
    // 消灭所有敌弹
    enemyBullets.forEach(b => {
        createExplosion(b.x, b.y, '#fff', 2);
    });
    enemyBullets = [];
    // 对所有敌人造成伤害
    enemies.forEach(e => {
        e.hp -= 10;
        createExplosion(e.x, e.y, '#ffeb3b', 8);
    });
    // 全屏闪白
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ==================== 碰撞检测 ====================
function rectCollide(a, b) {
    return Math.abs(a.x - b.x) < (a.w + b.w) / 2 &&
           Math.abs(a.y - b.y) < (a.h + b.h) / 2;
}

function circleRectCollide(circle, rect) {
    const dx = Math.abs(circle.x - rect.x);
    const dy = Math.abs(circle.y - rect.y);
    return dx < rect.w / 2 + circle.r && dy < rect.h / 2 + circle.r;
}

// ==================== 主更新逻辑 ====================
function update() {
    if (gameState !== STATE.PLAYING) return;
    // 慢动作效果：只更新计时器，跳过其他逻辑
    if (slowMoTimer > 0 && slowMoTimer % 3 !== 0) {
        slowMoTimer--;
        damageNumbers.forEach(d => { d.y -= 0.5; d.life--; });
        damageNumbers = damageNumbers.filter(d => d.life > 0);
        if (hitFlashTimer > 0) hitFlashTimer--;
        return;
    }

    stageTimer++;
    const stageConfig = getStageConfig(stage);

    // 检查是否该出Boss了
    if (stageTimer >= stageConfig.duration && !bossActive) {
        spawnBoss();
    }

    // 玩家移动
    if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
    if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
    if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
    player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
    player.y = Math.max(20, Math.min(canvas.height - 20, player.y));

    // 自动射击
    player.fireTimer++;
    if (player.fireTimer >= player.fireRate) {
        player.fireTimer = 0;
        playerShoot();
    }

    // 无敌时间
    if (player.invincible > 0) player.invincible--;

    // 更新子弹
    bullets.forEach(b => { b.x += b.vx; b.y += b.vy; });
    bullets = bullets.filter(b => b.y > -20 && b.y < canvas.height + 20 && b.x > -20 && b.x < canvas.width + 20);

    const ebSpeed = difficulty === 'easy' ? 0.6 : 1;
    enemyBullets.forEach(b => { b.x += b.vx * ebSpeed; b.y += b.vy * ebSpeed; });
    enemyBullets = enemyBullets.filter(b => b.y > -20 && b.y < canvas.height + 20 && b.x > -20 && b.x < canvas.width + 20);

    // 生成敌机
    if (!bossActive) spawnEnemy();

    // 更新敌机
    enemies.forEach(e => updateEnemyAI(e));
    enemies = enemies.filter(e => e.y < canvas.height + 60);

    // 子弹击中敌人
    bullets = bullets.filter(b => {
        let hit = false;
        enemies.forEach(e => {
            if (rectCollide(b, { x: e.x, y: e.y, w: e.w, h: e.h })) {
                e.hp--;
                hit = true;
                e.flashTimer = 4; // 敌机受击闪白
                createExplosion(b.x, b.y, '#fff', 3);
                if (e.type === 'boss') {
                    vibrate(15);
                    screenShake(2, 3); // Boss命中微震屏幕
                    playSound('hit');
                    // 伤害数字
                    damageNumbers.push({ x: b.x + (Math.random()-0.5)*20, y: b.y, text: '1', life: 30, color: '#ffeb3b' });
                }
                if (e.hp <= 0) {
                    score += e.score;
                    playSound(e.type === 'boss' ? 'bossExplode' : 'explode');
                    createExplosion(e.x, e.y, e.type === 'boss' ? '#ff5722' : '#ff9800', e.type === 'boss' ? 40 : 15);
                    // 伤害/击杀数字
                    damageNumbers.push({ x: e.x, y: e.y - 10, text: e.type === 'boss' ? 'DESTROYED!' : `+${e.score}`, life: 50, color: e.type === 'boss' ? '#ff5722' : '#fff', big: e.type === 'boss' });
                    if (e.type === 'boss') {
                        screenShake(12, 40);
                        hitFlashTimer = 10; // 击杀Boss全屏闪白
                        slowMoTimer = 30;   // 慢动作
                        bossActive = false;
                        // 关卡通过
                        if (stage >= MAX_STAGE) {
                            gameState = STATE.WIN;
                        } else {
                            gameState = STATE.STAGE_CLEAR;
                            stageTransitionTimer = 180;
                        }
                    }
                    // 掉落道具
                    if (Math.random() < 0.15 || e.type === 'boss') {
                        const types = ['power', 'bomb', 'life'];
                        const weights = [0.6, 0.25, 0.15];
                        let r = Math.random();
                        let type = types[0];
                        for (let i = 0; i < weights.length; i++) {
                            r -= weights[i];
                            if (r <= 0) { type = types[i]; break; }
                        }
                        powerUps.push({ x: e.x, y: e.y, type, w: 20, h: 20, vy: 1.5 });
                    }
                    e.y = 9999; // mark for removal
                }
            }
        });
        return !hit;
    });

    // 敌弹击中玩家
    if (player.invincible <= 0) {
        enemyBullets = enemyBullets.filter(b => {
            if (circleRectCollide(b, { x: player.x, y: player.y, w: 16, h: 16 })) {
                playerHit();
                return false;
            }
            return true;
        });
        // 敌机撞玩家
        enemies.forEach(e => {
            if (e.y > 0 && rectCollide({ x: player.x, y: player.y, w: 20, h: 20 }, { x: e.x, y: e.y, w: e.w, h: e.h })) {
                playerHit();
                if (e.type !== 'boss') {
                    e.hp = 0;
                    e.y = 9999;
                    createExplosion(e.x, e.y, '#ff9800', 10);
                }
            }
        });
    }

    // 道具
    powerUps.forEach(p => { p.y += p.vy; });
    powerUps = powerUps.filter(p => {
        if (rectCollide({ x: player.x, y: player.y, w: 30, h: 30 }, { x: p.x, y: p.y, w: p.w, h: p.h })) {
            if (p.type === 'power') player.power = Math.min(3, player.power + 1);
            else if (p.type === 'bomb') player.bombCount = Math.min(5, player.bombCount + 1);
            else if (p.type === 'life') lives = Math.min(5, lives + 1);
            playSound('powerup');
            createExplosion(p.x, p.y, '#76ff03', 8);
            return false;
        }
        return p.y < canvas.height + 20;
    });

    // 粒子
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.vx *= 0.96;
        p.vy *= 0.96;
    });
    particles = particles.filter(p => p.life > 0);

    // 屏幕震动
    if (shakeTimer > 0) shakeTimer--;
    // 全屏闪白
    if (hitFlashTimer > 0) hitFlashTimer--;
    // 慢动作（通过跳帧实现）
    if (slowMoTimer > 0) slowMoTimer--;

    // Boss警告
    if (bossWarningTimer > 0) bossWarningTimer--;

    // 敌机闪白计时
    enemies.forEach(e => { if (e.flashTimer > 0) e.flashTimer--; });

    // 伤害数字
    damageNumbers.forEach(d => { d.y -= 1.5; d.life--; });
    damageNumbers = damageNumbers.filter(d => d.life > 0);
}

function playerHit() {
    if (player.invincible > 0) return;
    lives--;
    playSound('playerHit');
    player.invincible = 120;
    player.power = Math.max(1, player.power - 1);
    screenShake(6, 15);
    createExplosion(player.x, player.y, '#4fc3f7', 20);
    if (lives <= 0) {
        gameState = STATE.GAME_OVER;
        createExplosion(player.x, player.y, '#ff5722', 40);
    }
}

// ==================== 渲染 ====================
function draw() {
    ctx.save();

    // 屏幕震动
    if (shakeTimer > 0) {
        const sx = (Math.random() - 0.5) * shakeIntensity;
        const sy = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(sx, sy);
    }

    // 背景
    const bgColor = getStageConfig(stage).bgColor;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 星空
    stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
        const alpha = 0.3 + s.brightness * 0.7;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    if (gameState === STATE.MENU) {
        drawMenu();
    } else if (gameState === STATE.PLAYING) {
        drawGame();
    } else if (gameState === STATE.GAME_OVER) {
        drawGame();
        drawGameOver();
    } else if (gameState === STATE.STAGE_CLEAR) {
        drawGame();
        drawStageClear();
    } else if (gameState === STATE.WIN) {
        drawGame();
        drawWin();
    }

    ctx.restore();
}

function drawGame() {
    // 道具
    powerUps.forEach(p => drawPowerUp(p));
    // 敌人
    enemies.forEach(e => drawEnemy(e));
    // 玩家
    drawPlayer();
    // 子弹
    bullets.forEach(b => drawBullet(b));
    enemyBullets.forEach(b => drawBullet(b));
    // 粒子
    particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
    // Boss警告
    if (bossWarningTimer > 0) {
        const alpha = Math.abs(Math.sin(bossWarningTimer * 0.1));
        ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.3})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ WARNING ⚠', canvas.width / 2, canvas.height / 2);
        ctx.font = '18px sans-serif';
        ctx.fillText('BOSS 来袭！', canvas.width / 2, canvas.height / 2 + 35);
    }
    // 伤害数字
    damageNumbers.forEach(d => {
        const alpha = Math.min(1, d.life / 15);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = d.color;
        ctx.font = d.big ? 'bold 28px sans-serif' : 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.text, d.x, d.y);
        ctx.globalAlpha = 1;
    });
    // 全屏闪白（击杀Boss等）
    if (hitFlashTimer > 0) {
        ctx.fillStyle = `rgba(255,255,255,${hitFlashTimer / 10 * 0.5})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // HUD
    drawHUD();
}

function drawHUD() {
    // 分数
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`分数: ${score}`, 10, 25);
    // 关卡
    ctx.textAlign = 'center';
    ctx.fillText(`第 ${stage} 关`, canvas.width / 2, 25);
    // 生命
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f44336';
    let livesStr = '';
    for (let i = 0; i < lives; i++) livesStr += '♥ ';
    ctx.fillText(livesStr, canvas.width - 10, 25);
    // 炸弹
    ctx.fillStyle = '#2196f3';
    ctx.textAlign = 'left';
    let bombStr = '';
    for (let i = 0; i < player.bombCount; i++) bombStr += '💣 ';
    ctx.fillText(bombStr, 10, 50);
    // 火力等级
    ctx.fillStyle = '#ff9800';
    ctx.textAlign = 'right';
    ctx.fillText(`火力: ${'★'.repeat(player.power)}${'☆'.repeat(3 - player.power)}`, canvas.width - 10, 50);
    // 手机炸弹按钮
    if (isMobile && player.bombCount > 0) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#2196f3';
        ctx.beginPath();
        ctx.arc(canvas.width - 45, canvas.height - 45, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💣', canvas.width - 45, canvas.height - 45);
        ctx.font = '12px sans-serif';
        ctx.fillText(`x${player.bombCount}`, canvas.width - 45, canvas.height - 18);
        ctx.restore();
    }
}

function drawMenu() {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pulse = 1 + Math.sin(Date.now() / 500) * 0.05;
    ctx.save();
    ctx.translate(canvas.width / 2, 200);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('飞机大战', 0, 0);
    ctx.restore();

    ctx.fillStyle = '#aaa';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PURESHOT', canvas.width / 2, 240);

    // 难度选择按钮
    const btnY = 310;
    const btnW = 130;
    const btnH = 44;
    const easyX = canvas.width / 2 - 80;
    const normalX = canvas.width / 2 + 80;

    // 简单模式按钮
    ctx.fillStyle = menuSelection === 0 ? '#4caf50' : '#333';
    ctx.beginPath();
    ctx.roundRect(easyX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
    ctx.fill();
    ctx.fillStyle = menuSelection === 0 ? '#fff' : '#888';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('简单模式', easyX, btnY + 7);

    // 普通模式按钮
    ctx.fillStyle = menuSelection === 1 ? '#ff9800' : '#333';
    ctx.beginPath();
    ctx.roundRect(normalX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
    ctx.fill();
    ctx.fillStyle = menuSelection === 1 ? '#fff' : '#888';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('普通模式', normalX, btnY + 7);

    // 难度说明
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#666';
    if (menuSelection === 0) {
        ctx.fillText('5条命 / 敌人少 / 子弹慢 / 初始双发', canvas.width / 2, btnY + 38);
    } else {
        ctx.fillText('3条命 / 敌人多 / 子弹快 / 经典难度', canvas.width / 2, btnY + 38);
    }

    // 开始提示
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    const blink = Math.sin(Date.now() / 400) > 0;
    if (isMobile) {
        if (blink) ctx.fillText('选择难度后点击下方开始', canvas.width / 2, 410);
        ctx.fillStyle = '#888';
        ctx.font = '14px sans-serif';
        ctx.fillText('手指拖动 - 控制飞机', canvas.width / 2, 460);
        ctx.fillText('自动射击 / 右下角 - 炸弹', canvas.width / 2, 485);
    } else {
        if (blink) ctx.fillText('← → 选择难度，ENTER 开始', canvas.width / 2, 410);
        ctx.fillStyle = '#888';
        ctx.font = '14px sans-serif';
        ctx.fillText('方向键 / WASD - 移动', canvas.width / 2, 460);
        ctx.fillText('自动射击 / 空格 - 炸弹 / P - 暂停', canvas.width / 2, 485);
    }
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f44336';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, 260);
    ctx.fillStyle = '#fff';
    ctx.font = '22px sans-serif';
    ctx.fillText(`最终得分: ${score}`, canvas.width / 2, 310);
    ctx.fillText(`到达关卡: 第 ${stage} 关`, canvas.width / 2, 345);
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#aaa';
    const blink = Math.sin(Date.now() / 400) > 0;
    if (blink) ctx.fillText(isMobile ? '点击屏幕重新开始' : '按 ENTER 重新开始', canvas.width / 2, 420);
}

function drawStageClear() {
    stageTransitionTimer--;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#4caf50';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`第 ${stage} 关 通过!`, canvas.width / 2, 280);
    ctx.fillStyle = '#fff';
    ctx.font = '18px sans-serif';
    ctx.fillText(`当前得分: ${score}`, canvas.width / 2, 330);
    if (stageTransitionTimer <= 0) {
        nextStage();
    }
}

function drawWin() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const colors = ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0'];
    const colorIdx = Math.floor(Date.now() / 200) % colors.length;
    ctx.fillStyle = colors[colorIdx];
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('恭喜通关！', canvas.width / 2, 240);

    ctx.fillStyle = '#ffeb3b';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`总分: ${score}`, canvas.width / 2, 300);

    ctx.fillStyle = '#fff';
    ctx.font = '18px sans-serif';
    const blink = Math.sin(Date.now() / 400) > 0;
    if (blink) ctx.fillText(isMobile ? '点击屏幕再来一次' : '按 ENTER 再来一次', canvas.width / 2, 400);

    // 持续放烟花
    if (Math.random() < 0.1) {
        createExplosion(
            Math.random() * canvas.width,
            Math.random() * canvas.height * 0.6,
            colors[Math.floor(Math.random() * colors.length)],
            15
        );
    }
}

function nextStage() {
    stage++;
    stageTimer = 0;
    bossActive = false;
    enemies = [];
    enemyBullets = [];
    player.bombCount = Math.min(5, player.bombCount + 1);
    gameState = STATE.PLAYING;
}

function resetGame() {
    difficulty = menuSelection === 0 ? 'easy' : 'normal';
    const easy = difficulty === 'easy';
    score = 0;
    lives = easy ? 5 : 3;
    stage = 1;
    stageTimer = 0;
    player.x = 240;
    player.y = 560;
    player.power = easy ? 2 : 1;
    player.invincible = 60;
    player.bombCount = easy ? 5 : 3;
    player.fireTimer = 0;
    bullets = [];
    enemyBullets = [];
    enemies = [];
    particles = [];
    powerUps = [];
    bossActive = false;
    bossWarningTimer = 0;
    hitFlashTimer = 0;
    slowMoTimer = 0;
    damageNumbers = [];
    gameState = STATE.PLAYING;
}

// ==================== 输入处理 ====================
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (gameState === STATE.MENU) {
        if (e.key === 'ArrowLeft' || e.key === 'a') { menuSelection = 0; initAudio(); playSound('select'); }
        if (e.key === 'ArrowRight' || e.key === 'd') { menuSelection = 1; initAudio(); playSound('select'); }
    }
    if (e.key === 'Enter') {
        if (gameState === STATE.MENU || gameState === STATE.GAME_OVER || gameState === STATE.WIN) {
            initAudio(); playSound('start');
            resetGame();
        }
    }
    if (e.key === ' ' && gameState === STATE.PLAYING) {
        e.preventDefault();
        useBomb();
    }
    if (e.key === 'p' || e.key === 'P') {
        if (gameState === STATE.PLAYING) gameState = STATE.PAUSED;
        else if (gameState === STATE.PAUSED) gameState = STATE.PLAYING;
    }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

// ==================== 触摸事件 ====================
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    initAudio(); // 每次触摸都尝试解锁iOS音频
    const pos = getTouchPos(e);
    if (gameState === STATE.MENU) {
        // 难度按钮区域
        const btnY = 310;
        const btnW = 130, btnH = 44;
        const easyX = canvas.width / 2 - 80;
        const normalX = canvas.width / 2 + 80;
        if (pos.y >= btnY - btnH / 2 && pos.y <= btnY + btnH / 2) {
            initAudio();
            if (pos.x >= easyX - btnW / 2 && pos.x <= easyX + btnW / 2) { menuSelection = 0; playSound('select'); return; }
            if (pos.x >= normalX - btnW / 2 && pos.x <= normalX + btnW / 2) { menuSelection = 1; playSound('select'); return; }
        }
        // 点击其他区域开始游戏（按钮下方）
        if (pos.y > btnY + btnH / 2 + 10) { initAudio(); playSound('start'); resetGame(); return; }
        return;
    }
    if (gameState === STATE.GAME_OVER || gameState === STATE.WIN) {
        initAudio(); playSound('start');
        resetGame();
        return;
    }
    if (gameState === STATE.PAUSED) {
        gameState = STATE.PLAYING;
        return;
    }
    // 检查是否点击了炸弹按钮
    if (gameState === STATE.PLAYING && pos.x >= canvas.width - 80 && pos.y >= canvas.height - 80) {
        useBomb();
        return;
    }
    touch.active = true;
    touch.startX = pos.x;
    touch.startY = pos.y;
    touch.playerStartX = player.x;
    touch.playerStartY = player.y;
}, { passive: false });

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!touch.active || gameState !== STATE.PLAYING) return;
    const pos = getTouchPos(e);
    // 手指偏移量直接映射到飞机位移，1.5倍灵敏度
    player.x = touch.playerStartX + (pos.x - touch.startX) * 1.5;
    player.y = touch.playerStartY + (pos.y - touch.startY) * 1.5;
    player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
    player.y = Math.max(20, Math.min(canvas.height - 20, player.y));
}, { passive: false });

canvas.addEventListener('touchend', e => {
    e.preventDefault();
    touch.active = false;
}, { passive: false });

// ==================== 游戏主循环 ====================
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
