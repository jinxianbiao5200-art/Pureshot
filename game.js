// ==================== 飞机大战 - Pureshot ====================
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 480;
canvas.height = 640;

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
        // 血条
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

function screenShake(intensity, duration) {
    shakeIntensity = intensity;
    shakeTimer = duration;
}

// ==================== 子弹发射 ====================
function playerShoot() {
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
    const bossHp = 50 + stage * 30;
    enemies.push({
        type: 'boss',
        x: canvas.width / 2, y: -40,
        w: 60, h: 50,
        hp: bossHp, maxHp: bossHp,
        speed: 1.5,
        fireRate: 20 - stage * 2,
        fireTimer: 0,
        score: 2000 + stage * 1000,
        movePattern: 0, moveTimer: 0,
        startX: canvas.width / 2,
        phase: 0,
        entering: true
    });
}

function getStageConfig(s) {
    return {
        spawnRate: 0.02 + s * 0.008,
        mediumRate: 0.1 + s * 0.08,
        duration: 1200 + s * 300,
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

    enemyBullets.forEach(b => { b.x += b.vx; b.y += b.vy; });
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
                createExplosion(b.x, b.y, '#fff', 3);
                if (e.hp <= 0) {
                    score += e.score;
                    createExplosion(e.x, e.y, e.type === 'boss' ? '#ff5722' : '#ff9800', e.type === 'boss' ? 40 : 15);
                    if (e.type === 'boss') {
                        screenShake(10, 30);
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

    // Boss警告
    if (bossWarningTimer > 0) bossWarningTimer--;
}

function playerHit() {
    if (player.invincible > 0) return;
    lives--;
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

    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    const blink = Math.sin(Date.now() / 400) > 0;
    if (blink) ctx.fillText('按 ENTER 开始游戏', canvas.width / 2, 350);

    ctx.fillStyle = '#888';
    ctx.font = '14px sans-serif';
    ctx.fillText('方向键 / WASD - 移动', canvas.width / 2, 430);
    ctx.fillText('自动射击', canvas.width / 2, 455);
    ctx.fillText('空格键 - 炸弹', canvas.width / 2, 480);
    ctx.fillText('P - 暂停', canvas.width / 2, 505);
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
    if (blink) ctx.fillText('按 ENTER 重新开始', canvas.width / 2, 420);
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
    if (blink) ctx.fillText('按 ENTER 再来一次', canvas.width / 2, 400);

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
    score = 0;
    lives = 3;
    stage = 1;
    stageTimer = 0;
    player.x = 240;
    player.y = 560;
    player.power = 1;
    player.invincible = 60;
    player.bombCount = 3;
    player.fireTimer = 0;
    bullets = [];
    enemyBullets = [];
    enemies = [];
    particles = [];
    powerUps = [];
    bossActive = false;
    bossWarningTimer = 0;
    gameState = STATE.PLAYING;
}

// ==================== 输入处理 ====================
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === 'Enter') {
        if (gameState === STATE.MENU || gameState === STATE.GAME_OVER || gameState === STATE.WIN) {
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

// ==================== 游戏主循环 ====================
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
