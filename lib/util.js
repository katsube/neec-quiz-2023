// WASDのキーコード
const KEY = {
  W: 87,
  A: 65,
  S: 83,
  D: 68
};


/**
 * ゲーム結果を計算する
 *
 */
function calcResult(){
  // TODO: 来週
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
  calcResult,
  findRoom,
  findMember,
  debugWaitingRoom,
  debugBattleRoom
};