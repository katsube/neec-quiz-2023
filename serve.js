/**
 * クイズサーバ
 *
 */
const express = require('express');
const app  = express();
const http = require('http').createServer(app);
const io   = require('socket.io')(http);
const util = require('./lib/util');

//----------------------------------------
// express(webサーバ)の設定
//----------------------------------------
// 静的ファイルの配信
app.use(express.static('public'));

// グローバル変数の確認
app.get('/status', (req, res) => {
  const waiting = util.debugWaitingRoom(WAITING_ROOM);
  const battle = util.debugBattleRoom(BATTLE_ROOM);

  res.json({
    MAX_TOKEN: MAX_TOKEN,
    WAITING_ROOM: waiting,
    BATTLE_ROOM: battle,
  });
});

//----------------------------------------
// Socket.io
//----------------------------------------
// トークンの最大値
let MAX_TOKEN = 1;

// 待機中の部屋
const WAITING_ROOM = [
  // {socket:socket, token:1, name:'プレイヤー1'},
  // {socket:socket, token:2, name:'プレイヤー2'},
];

// 戦闘中の部屋
const BATTLE_ROOM = [
  // {
  //   name: 'battle1',
  //   members: [
  //     {socket:socket, token:1, name:'プレイヤー1'},
  //     {socket:socket, token:2, name:'プレイヤー2'},
  //   ]
  // }
];
let BATTLE_ID = 1;    // 戦闘部屋のIDの最大値

//----------------------------------------
// [Socket.io] 接続
//----------------------------------------
io.on('connection', (socket) => {
  //----------------------------------------
  // 接続したら本人にトークンを通知する
  //----------------------------------------
  const token = MAX_TOKEN++;
  io.to(socket.id).emit('token', token);
  console.log(`[user] connected ${token}`);

  //----------------------------------------
  // 入室＝待機部屋に入る
  //----------------------------------------
  socket.on('join', (data) => {   // data = {token:1, name:'プレイヤー1'}
    WAITING_ROOM.push({
      socket: socket,
      token: data.token,
      name: data.name
    });
    console.log('[join]', socket.id, data);
  });
});

//----------------------------------------
// サーバを起動する
//----------------------------------------
http.listen(3000, () => {
  console.log('起動したよ！');
});

//----------------------------------------
// 1秒ごとにマッチングを行う
//----------------------------------------
setInterval(()=>{
  doMatching();
}, 1000);


/**
 * マッチングを行う
 *
 * @param {number} [member=2] 何人でマッチングするか
 * @returns {void}
 */
function doMatching(players=2){
  // 人数が足りない場合は何もしない
  if( WAITING_ROOM.length < players ){
    return;
  }

  //----------------------------------------
  // メンバー数分のプレイヤーを取り出す
  //----------------------------------------
  const members = [ ];
  for(let i=0; i<players; i++){
    const member = WAITING_ROOM.shift();
    members.push(member);
  }

  //----------------------------------------
  // 戦闘用の部屋を作る
  //----------------------------------------
  const room = {
    name: `battle-${BATTLE_ID++}`,
    members: members
  };
  BATTLE_ROOM.push(room);

  //----------------------------------------
  // 部屋へ入れる
  //----------------------------------------
  for(let i=0; i<players; i++){
    const member = members[i];
    member.socket.join(room.name);
    console.log('[match]', room.name, member.token, member.name);
  }
  io.to(room.name).emit('start');
}
