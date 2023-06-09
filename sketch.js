// ---- エンティティ関連の関数 ---------------------------------------------

// 全エンティティ共通

function updatePosition(entity) {
  entity.x += entity.vx;
  entity.y += entity.vy;
}

// プレイヤーエンティティ用




function createPlayer() {
  return {
    x: 200,//位置
    y: 300,//位置
    vx: 0,//速度
    vy: 0//速度
  };
}

function applyGravity(entity) {
  entity.vy += 0.15;
}

function applyJump(entity) {
  entity.vy = -5;
}

function drawPlayer(entity) {
  //色
  fill('#f4fa58')
  square(entity.x, entity.y, 40);
}

function playerIsAlive(entity) {
  // プレイヤーの位置が生存圏内なら true を返す。
  // 600 は画面の下端
  return entity.y < 600;
}

// ブロックエンティティ用

function createBlock(y) {
  return {
    x: 900,
    y,
    vx: -2,
    vy: 0
  };
}

function drawBlock(entity) {
  fill('#088a08')
  rect(entity.x, entity.y, 80, 400);
}

function blockIsAlive(entity) {
  // ブロックの位置が生存圏内なら true を返す。
  // -100 は適当な値（ブロックが見えなくなる位置であればよい）
  return -100 < entity.x;
}

// パーティクルエンティティ

function createParticle(x,y){
  let direction = random(TWO_PI);
  let speed = 1.5;

  return{
    x,
    y,
    vx: -4 + speed * cos(direction),
    vy: speed * sin(direction),
    life: 1 // = 100%
  };
}

function decreaseLife(particle){
  particle.life -= 0.03;
}

function particleIsAlive(particle){
  return particle.life > 0;

}

function drawParticle(particle){
  push();
  noStroke();
  fill(255, particle.life * 255);
  square(particle.x, particle.y, particle.life * 10);
  pop();

}



function entitiesAreColliding(
  entityA,
  entityB,
  collisionXDistance,
  collisionYDistance
){

  let currentXDistance = abs(entityA.x - entityB.x);
  if (collisionXDistance <= currentXDistance) return false;

  let currentYDistance = abs(entityA.y - entityB.y);
  if (collisionYDistance <= currentYDistance) return false;

  return true;
}


// ---- ゲーム全体に関わる部分 --------------------------------------------

/** プレイヤーエンティティ */
let player;

/** ブロックエンティティの配列 */
let blocks;

//パーティクルエンティティの配列//
let particles;

/** ゲームの状態。"play" か "gameover" を入れるものとする */
let gameState;

/** ブロックを上下ペアで作成し、`blocks` に追加する */
function addBlockPair() {
  let y = random(-100, 100);
  blocks.push(createBlock(y)); // 上のブロック
  blocks.push(createBlock(y + 600)); // 下のブロック
}

/** ゲームオーバー画面を表示する */
function drawGameoverScreen() {
  background(20, 220); // 透明度 192 の黒
  fill(200);
  textSize(100);
  textAlign(CENTER, CENTER); // 横に中央揃え ＆ 縦にも中央揃え
  text("GAME OVER", width / 2, height / 2); // 画面中央にテキスト表示
}

/** ゲームの初期化・リセット */
function resetGame() {
  // 状態をリセット
  gameState = "play";

  // プレイヤーを作成
  player = createPlayer();

  // ブロックの配列準備
  blocks = [];

  //パーティクルの配列準備//
  particles = [];

}

/** ゲームの更新 */
function updateGame() {


  // ゲームオーバーなら更新しない
  if (gameState === "gameover") return;

  // ブロックの追加と削除
  if (frameCount % 120 === 1) addBlockPair(blocks); 
  
  // 一定間隔で追加


  //パーティクルの追加
  particles.push(createParticle(player.x, player.y));

  blocks = blocks.filter(blockIsAlive); // 生きているブロックだけ残す
  particles = particles.filter(particleIsAlive);

  // 全エンティティの位置を更新
  updatePosition(player);
  for (let block of blocks) updatePosition(block);
  for (let particle of particles) updatePosition(particle);
  
  // プレイヤーに重力を適用
  applyGravity(player);

  //パーティクルのライフ減少
  for (let particle of particles) decreaseLife(particle);

  // プレイヤーが死んでいたらゲームオーバー
  if (!playerIsAlive(player)) gameState = "gameover";



  for (let block of blocks){
  if (entitiesAreColliding(player, block, 20 + 40, 20+ 200)){
    gameState = 'gameover';
    break;
  }
}
}
/** ゲームの描画 */
function drawGame() {


  // 全エンティティを描画
  //水色
  background('#cef6f5');
  drawPlayer(player);
  for (let block of blocks) drawBlock(block);
  for (let particle of particles) drawParticle(particle);
  // ゲームオーバーならそれ用の画面を表示
  if (gameState === "gameover") drawGameoverScreen();


}

/** マウスボタンが押されたときのゲームへの影響 */
function onMousePress() {
  switch (gameState) {
    case "play":
      // プレイ中の状態ならプレイヤーをジャンプさせる
      applyJump(player);
      break;
    case "gameover":
      // ゲームオーバー状態ならリセット
      resetGame();
      break;
  }
}

// ---- setup/draw 他 ---------------------------------------------------

function setup() {
  createCanvas(800, 600);
  rectMode(CENTER);

  resetGame();

}

function draw() {
  updateGame();
  drawGame();
}

function mousePressed() {
  onMousePress();
}