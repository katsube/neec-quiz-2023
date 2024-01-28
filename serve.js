/**
 * クイズサーバ
 *
 */
const express = require('express');
const app  = express();
const http = require('http').createServer(app);
const io   = require('socket.io')(http);
const util = require('./lib/util');
const config = require('./lib/config');
const Question = require('./lib/question');
const collision = require('./lib/collision');

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
  //   question: "スイカは野菜である",
  //   answer: true,
  //   members: [
  //     {socket:socket, token:1, name:'プレイヤー1', pos:{x:1, y:1}, size:{width:10, height:10}},
  //     {socket:socket, token:2, name:'プレイヤー2', pos:{x:1, y:1}, size:{width:10, height:10}},
  //   ],
  //   input: {
  //     1:{token:1, answer:true, time:123456789},
  //     2:{token:2, answer:false, time:123456789},
  //   }
  // }
];
let BATTLE_ID = 1;    // 戦闘部屋のIDの最大値

// 解答パネルの位置、サイズ
const ANSWER = config('game.answer');

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

  //---------------------------
  // [Game] キャラ移動
  //---------------------------
  socket.on('move', (data) => {   // {room:'battle-1', token:123, key:50}
    console.log('[move]', data)
    const room = util.findRoom(BATTLE_ROOM, data.room);
    const user = util.findMember(room, data.token);

    //----------------------------------------
    // 座標を移動
    //----------------------------------------
    const ismove = moveChara(user, data.key);
    if( ismove ){
      // メンバーへ通知
      io.to(data.room).emit('member-move', {token:user.token, pos:user.pos});

      //----------------------------------------
      // あたり判定
      //----------------------------------------
      // ◯とユーザーが当たっている？
      if( collision({...user.pos, ...user.size}, ANSWER.o) ){
        room.input[user.token] = {token:user.token, answer:true, time:Date.now()};
        console.log('[answer - o]', user.name, room.input)
      }
      // ×とユーザーが当たっている？
      else if( collision({...user.pos, ...user.size}, ANSWER.x) ){
        room.input[user.token] = {token:user.token, answer:false, time:Date.now()};
        console.log('[answer - x]', user.token, room.input)
      }
      // 当たっていない
      else{
        delete room.input[user.token];
        console.log('[answer - !]', user.token, room.input)
      }

      //----------------------------------------
      // 全員が回答したら結果を通知
      //----------------------------------------
      if( Object.keys(room.input).length >= room.members.length ){
        // 戦闘結果を計算
        const win = util.calcResult(room.input, room.answer);

        //----------------------------------------
        // 勝者がいたら戦闘を終了
        //----------------------------------------
        if( win !== util.RESULT.DRAW ){
          const params = {
            answer: room.answer,
            win: win
          };
          // クライアントへ通知
          io.to(data.room).emit('finish', params);
        }
        //----------------------------------------
        // 引き分けなら戦闘を続ける
        //----------------------------------------
        else{
          // 部屋をリセット（問題文、キャラ座標、回答内容）
          resetRoom(room);

          // クライアントへ通知
          const params = {
            question: room.question,
            members: room.members,
          };

          // クライアントへ通知
          io.to(data.room).emit('draw', params);
        }
      }
    }
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
  const pos  = config('game.player.pos');   // プレイヤーの初期位置（配列）
  const size = config('game.player.size');  // プレイヤー画像のサイズ

  const members = [ ];
  for(let i=0; i<players; i++){
    const member  = WAITING_ROOM.shift();
    member.pos    = pos[i];   // 初期位置
    member.size   = size;     // 画像のサイズ
    member.avatar = i + 1;    // 1:アルパカ, 2:パンダ

    members.push(member);     // 追加
  }

  //----------------------------------------
  // 戦闘用の部屋を作る
  //----------------------------------------
  const q = new Question();
  q.setQuestion();  // 問題を決定

  const room = {
    name: `battle-${BATTLE_ID++}`,  // 部屋の名前
    members: members,               // 対戦メンバー
    question: q.getQuestion(),      // 問題文
    answer: q.getAnswer(),          // 回答（クライアントには渡さない）
    input: { },                     // 入力情報
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

  //----------------------------------------
  // 部屋内の全プレイヤーへ通知
  //----------------------------------------
  const data = createInitData(room);
  io.to(room.name).emit('start', data);
}


/**
 * クライアントに送信する初期情報を作成
 *
 * @param {object} room 戦闘部屋
 * @returns {object} 初期情報
 *     {
 *        room: 'battle1',
 *        question: 'スイカは野菜である',
 *        members: [{token:1, name:'プレイヤー1', avaatr:1, pos:{x:1, y:1}, size:{width:10, height:10}}, ...]},
 *        answer: pos[o:{x:1, y:1, width:80, height:80}, x:{...}],
 *     }
 */
function createInitData(room){
  const data = {
    room: null,
    question: null,
    members: [ ],
    answer: null,
  };

  // 部屋名をセット
  data.room = room.name;

  // 問題文をセット
  data.question = room.question;

  // メンバー情報を作成
  for(let i=0; i<room.members.length; i++){
    const member = room.members[i];
    delete member.socket;
    data.members.push(member);
  }

  // 回答の位置をセット
  data.answer = config('game.answer');

  return(data);
}

/**
 * キャラクターを移動する
 *
 * @param {object} user
 * @param {number} key
 * @returns {boolean}
 */
function moveChara(user, key){
  const speed = config('game.player.speed');
  let ismove = true;

  // 上下左右の移動
  switch(key){
    case util.KEY.A:  // 左 A
      user.pos.x -= speed;
      break;
    case util.KEY.W:  // 上 W
      user.pos.y -= speed;
      break;
    case util.KEY.D:  // 右 D
      user.pos.x += speed;
      break;
    case util.KEY.S:  // 下 S
      user.pos.y += speed;
      break;
    default:
      ismove = false;
      break;
  }

  return(ismove);
}


/**
 * 部屋の問題、回答、入力情報をリセットする
 *
 * @param {object} room
 * @returns {void}
 */
function resetRoom(room){
  const pos = config('game.player.pos');

  // 座標をリセット
  for(let i=0; i<room.members.length; i++){
    const member = room.members[i];
    member.pos = pos[i];
  }

  // 回答をリセット
  room.input = { };

  // 問題文を変更
  const q = new Question();
  q.setQuestion();                  // 問題を決定
  room.question = q.getQuestion();  // 部屋に問題文をセット
  room.answer = q.getAnswer();      // 部屋に回答をセット
}