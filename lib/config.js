const path = require('path');
const fs = require('fs');

/**
 * キーに応じた設定を返す
 *
 * @param {string} key 設定のキー
 * @param {string} [namespace='define'] 設定ファイルの名前
 * @returns {any}
 * @example
 *   const config = require('./lib/config');
 *   const size = config('game.player.size');  // {width:120, height:150}
 */
module.exports = (key, namespace='define')=>{
  const filepath = path.resolve(__dirname, `../config/${namespace}.json`);    // 毎回ファイルを読み込むので効率は良くない
  const json = fs.readFileSync(filepath, 'utf8');
  let config = JSON.parse(json);

  const keys = key.split('.');
  for( const k of keys ){
    if( k in config ){
      config = config[k];
    }
    else{
      throw new Error(`[config] ${key} is not defined.`);
    }
  }

  //----------------------------------------
  // オブジェクトと配列はコピーを返す
  //----------------------------------------
  // オブジェクト
  if( typeof config === 'object' ){
    return Object.assign({}, config);
  }
  // 配列
  else if( Array.isArray(config) ){
    return config.slice();
  }
  return config;
}