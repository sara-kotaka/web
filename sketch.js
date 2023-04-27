// ---- エンティティ関連の関数 ---------------------------------------------

// 全エンティティ共通

function updatePosition(entity) {
  entity.x += entity.vx;
  entity.y += entity.vy;
}

// プレイヤーエンティティ用
let img;
let c;
function preload(){
  img = loadImage('p5.kaeru.jpg');
}




function createPlayer() {
  return {
    x: 200,
    y: 300,
    vx: 0,
    vy: 0
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

//画面効果ゆれ

//シェイクの強さ
let shakeMagnitude;

//シェイク係数
let shakeDampingFactor;

//シェイクリセット
function resetShake(){
  shakeMagnitude = 0;
  shakeDampingFactor = 0.95;

}

//シェイク発動
function setShake(magnitude){
  shakeMagnitude = magnitude;

}
//シェイク更新
function updateShake(){
  shakeMagnitude *= shakeDampingFactor;

}
//シェイク適用
function applyShake(){
  if (shakeMagnitude < 1) return;
//画面ずらす
  translate(
    random(-shakeMagnitude, shakeMagnitude),
    random(-shakeMagnitude, shakeMagnitude)
  );
 
}

//スクリーンフラッシュ
//フラッシュの値
let flashAlpha;

//フラッシュの持続時間
let flashDuration;

//フラッシュの残り時間
let flashRemainingCount;

//フラッシュリセット
function resetFlash(){
  flashAlpha = 255;
  flashDuration = 2;
  flashRemainingCount = 0;

}
//フラッシュ発動
function setFlash(alpha,duration){
  flashAlpha = alpha;
  flashDuration = duration;
  flashRemainingCount = duration;
}
  //フラッシュ更新
function updateFlash(){
  flashRemainingCount -= 1;
}

 
//フラッシュ適用
function applyFlash(){
  if(flashRemainingCount <= 0) return;
  
  let alphaRatio = flashRemainingCount / flashDuration;
  background(255, alphaRatio * flashAlpha);
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

  resetShake();
  resetFlash();
}

function setGameOver(){
  gameState = 'gameover';
  setShake(300);
  setFlash(128,60);
  
}
/** ゲームの更新 */
function updateGame() {
  updateShake();
  updateFlash();

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
  //スクリーンシェイク
  applyShake();

  // 全エンティティを描画
  //水色
  background('#cef6f5');
  drawPlayer(player);
  for (let block of blocks) drawBlock(block);
  for (let particle of particles) drawParticle(particle);
  // ゲームオーバーならそれ用の画面を表示
  if (gameState === "gameover") drawGameoverScreen();

  //スクリーンフラッシュ
  applyFlash();
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
  img.loadPixels();
  c = img.get(img.width/2, img.height/2);
}

function draw() {
  updateGame();
  drawGame();
}

function mousePressed() {
  onMousePress();
}