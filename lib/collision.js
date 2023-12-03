/**
 * 2つのオブジェクトの当たり判定を行う
 *
 * @param {object} obj1
 * @param {object} obj2
 * @return {boolean}
 * @example
 *   const collision = require('./lib/collision.js');
 *   const obj1 = {x: 0, y: 0, width: 10, height: 10};
 *   const obj2 = {x: 5, y: 5, width: 10, height: 10};
 *
 *   if( collision(obj1, obj2) ){
 *     console.log('hit!');
 *   }
 */
module.exports = (obj1, obj2) => {
  return (
    obj1.x < (obj2.x + obj2.width)  &&
    obj1.y < (obj2.y + obj2.height) &&
    (obj1.x + obj1.width)  > obj2.x &&
    (obj1.y + obj1.height) > obj2.y
  );
}
