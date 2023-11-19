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
  debugWaitingRoom,
  debugBattleRoom
};