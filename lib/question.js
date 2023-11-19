/**
 * クイズ出題クラス
 *
 * @example
 *   const Question = require('./lib/question');
 *   const q = new Question();
 *
 *   // 問題文をランダムに決定
 *   q.setQuestion();
 *
 *  // 問題文と答えを取得
 *  const question = q.getQestion();
 *  const answer   = q.getAnswer();
 */

//-----------------------------------------------
// モジュール
//-----------------------------------------------
const path = require('path');

class Question {
  //----------------------------------------
  // プロパティ
  //----------------------------------------
  #list;              // 問題の一覧
  #question = null;   // 問題文 "スイカは野菜である"
  #answer   = null;   // 回答   true | false

  /**
   * コンストラクタ
   *
   * @constructor
   * @param {string} file 問題文のJSONファイル
   */
  constructor(file='../data/question.json') {
    const filepath = path.resolve(__dirname, file);
    this.#list = require(filepath);    // ToDo: エラー処理

    // 問題文をランダムに決定
    this.setQuestion();
  }

  /**
   * 問題文をランダムに決定
   */
  setQuestion() {
    const i = Math.floor(Math.random() * this.#list.length);

    // プロパティにセット
    this.#question = this.#list[i]['q'];
    this.#answer   = this.#list[i]['a'];
  }

  /**
   * 問題文を返却する
   *
   * @returns {string} 問題文
   */
  getQuestion() {
    return this.#question;
  }

  /**
   * 回答を返却する
   *
   * @returns {boolean} 答え
   */
  getAnswer() {
    return this.#answer;
  }
}

//-----------------------------------------------
// export
//-----------------------------------------------
module.exports = Question;