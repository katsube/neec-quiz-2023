// WASDのキーコード
const KEY = {
  W: 87,
  A: 65,
  S: 83,
  D: 68
};

// ゲーム結果
const RESULT = {
  WIN:  'W',  // 勝ち（未使用）
  LOSE: 'L',  // 負け（未使用）
  DRAW: -1    // 引き分け
};


/**
 * ゲーム結果を計算する
 *
 * @param {object} input  {1:{token:1, answer:true, time:123456789}, ...}
 * @param {boolean} answer true:正解, false:不正解
 * @returns {number} 勝者がいる場合: 勝者のtoken, 勝者がいない場合: -1
 */
function calcResult(input, answer){
  // 正解者を探す
  const winners = [ ];
  for(const token in input){
    if(input[token].answer === answer){
      winners.push(Number(token));
    }
  }

  // 正解者がいない場合は-1を返す(引き分け)
  if(winners.length === 0){
    return(RESULT.DRAW);
  }
  // 正解者が1人の場合はそのtokenを返す
  else if(winners.length === 1){
    return(winners[0]);
  }
  // 正解者が複数人の場合は最速のtokenを返す
  else{
    let fastest = null;   // 最速プレイヤーのtoken
    let fastestTime = (new Date().getTime() + (1000 * 60 * 60));  // 最速プレイヤーの回答時間

    for(const token of winners){
      if(input[token].time < fastestTime){
        fastest = token;
        fastestTime = input[token].time;
      }
    }

    return(fastest);
  }
}

/**
 * バトルルームから特定の部屋を探す
 *
 * @param {array} rooms
 * @param {string} name
 * @returns {object}
 */
function findRoom(rooms, name){
  return rooms.find((room)=>{
    return room.name === name;
  });
}

/**
 * 部屋から特定のメンバーを探す
 *
 * @param {object} room
 * @param {number} token
 * @returns {object}
 */
function findMember(room, token){
  return room.members.find((member)=>{
    return member.token === token;
  });
}

/**
 * WAITING_ROOM変数をデバッグ用に整形する
 *
 * @param {object} room
 * @returns {object}
 */
function debugWaitingRoom(room){
  return room.map((member)=>{
    return {
      token: member.token,
      name: member.name
    };
  });
}

/**
 * BATTLE_ROOM変数をデバッグ用に整形する
 *
 * @param {object} room
 * @returns {object}
 */
function debugBattleRoom(room){
  return room.map((room)=>{
    return {
      name: room.name,
      answer: room.answer,
      input: room.input,
      members: room.members.map((member)=>{
        return {
          token: member.token,
          name: member.name,
          avatar: member.avatar,
          pos: member.pos,
          size: member.size
        };
      })
    };
  });
}

//----------------------------------------
// exports
//----------------------------------------
module.exports = {
  KEY,
  RESULT,
  calcResult,
  findRoom,
  findMember,
  debugWaitingRoom,
  debugBattleRoom
};