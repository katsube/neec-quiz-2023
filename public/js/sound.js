/**
 * 音声関連の処理を行うクラス
 *
 * @class Sound
 * @example
 *   const bgm = new Sound({
 *     // Audioオブジェクトのオプション
 *     loop: false,       // ループ再生
 *     volume: 0.5,       // 音量（0.0〜1.0）
 *     controls: false,   // コントロールの表示
 *     preload: 'auto'    // 事前読み込み（'auto', 'none', 'metadata'）
 *     autoplay: false,   // 自動再生（最近のWebブラウザはtrueにしても動作しません）
 *
 *     // その他のオプション
 *     single: false      // 1つの音声ファイルのみ再生
 *   });
 *
 *   // エラー時のコールバック関数
 *   bgm.on('error', (name, path, error) => {
 *     alert(`読み込みエラーが発生しました。${name} ${path} ${e.message}`);
 *   });
 *
 *   // 音声ファイルの登録
 *   bgm.add('sound1', '/sound/sound1.mp3');
 *
 *   // 音声の再生
 *   bgm.play('sound1');
 *   bgm.play('sound1'. {loop: true, volume: 0.5});
 *   bgm.volume('sound1', 0.1);
 *
 *   // 音声の停止
 *   bgm.stop('sound1');
 */
class Sound{
  //----------------------------------------
  // プロパティ
  //----------------------------------------
  #options = {};    // 再生時のオプション
  #files = {};      // 音声ファイル

  // コールバック関数
  #callbackError = null;    // エラー時
  #callbackEnded = null;    // 再生終了時

  /**
   * コンストラクタ
   *
   * @param {object} [options={}] - 再生時のオプション
   * @return {void}
   */
  constructor(options){
    // デフォルト値で初期化
    this.#options = Object.assign({
          loop: false,
        volume: 0.5,
      controls: false,
      preload: 'auto',
      autoplay: false,
        single: false
    }, options);
  }

  /**
   * イベントを登録
   *
   * @param {string} event
   * @param {function} callback
   */
  on(event, callback){
    if( typeof callback !== 'function'){
      return(false);
    }

    switch(event){
      case 'error':
        this.#callbackError = callback;
        break;
      case 'ended':
        this.#callbackEnded = callback;
        break;
    }
  }

  /**
   * 音声ファイルを登録する
   *
   * @param {string} name ファイル名
   * @param {string} path ファイルのパス（URL）
   * @return {void}
   */
  add(name, path){
    const audio = new Audio(path);    // 名前が被る場合は上書きされる

    // エラー処理
    audio.addEventListener('error', (e) => {
      console.error('[Sound.add()]', e);

      // コールバック関数が登録されていれば実行
      if(this.#callbackError !== null){
        this.#callbackError(name, path, e);
      }
    });

    // 再生終了時の処理
    audio.addEventListener('ended', (e) => {
      // コールバック関数が登録されていれば実行
      if(this.#callbackEnded !== null){
        this.#callbackEnded(name, path, e);
      }
    });

    // オプション設定
    audio.controls = this.#options.controls;    // コントロールの表示
    audio.preload  = this.#options.preload;     // 事前読み込み

    this.#files[name] = audio;
  }

  /**
   * 複数の音声ファイルを登録する
   *
   * @param {object} files ファイル名とパスの連想配列 [ {name:'foo', path:'foo.mp3'}, ...]
   * @return {void}
   */
  addAll(files){
    if( ! Array.isArray(files) ){
      return(false);
    }

    for(let i=0; i<files.length; i++){
      const file = files[i];
      if( !('name' in file) || !('path' in file) ){
        continue;
      }
      this.add(file.name, file.path);
    }
  }

  /**
   * 音声ファイルが再生中かどうかを返す
   *
   * @param {string} name ファイル名
   * @return {boolean} 再生中:true, 停止中:false
   */
  isPlaying(name){
    return ! this.#files[name].paused;
  }

  /**
   * 音声ファイルを再生する
   *
   * @param {string} name ファイル名
   * @param {object} [options={}] 再生時のオプション
   * @return {void}
   */
  play(name, options={}){
    if(name in this.#files === false){
      return(false);
    }

    // デフォルト値で初期化
    options = Object.assign({}, this.#options, options);

    // シングルモード時に再生中の音声を停止
    if( this.#options.single ){
      for(let name in this.#files){
        if( this.isPlaying(name) ){
          this.stop(name);
        }
      }
    }

    // 音声ファイルの再生
    this.#files[name].loop   = options.loop;
    this.#files[name].volume = options.volume;
    this.#files[name].play();
  }

  /**
   * 再生を停止する
   *
   * @param {string} name ファイル名
   * @return {void}
   */
  stop(name){
    if( name in this.#files === false ){
      return(false);
    }

    this.#files[name].pause();
    this.#files[name].currentTime = 0;
  }

  /**
   * 一時停止する
   *
   * @param {string} name ファイル名
   * @return {void}
   */
  pause(name){
    this.files[name].pause();
  }

  /**
   * 再生/一時停止を切り替える
   *
   * @param {string} name ファイル名
   * @return {void}
   */
  toggle(name){
    if(this.files[name].paused){
      this.play(name);
    }
    else{
      this.pause(name);
    }
  }

  /**
   * 音量を設定/取得する
   *
   * @param {string} name   ファイル名
   * @param {number} [volume=null] 音量（0.0〜1.0）
   * @returns {void}
   * @example
   *   const value = sound.volume('sound1');  // 音量を取得
   *   sound.volume('sound1', 0.5);  // 音量を設定
   */
  volume(name, volume=null){
    if( ! (name in this.#files) ){
      return(false);
    }

    //-------------------------------------
    // volumeがnullの場合は音量を返却
    //-------------------------------------
    if( volume === null ){
      return(this.#files[name].volume);
    }

    //-------------------------------------
    // volume指定時は音量を設定
    //-------------------------------------
    if( (typeof volume !== 'number') || !(0.0 <= volume && volume <=1.0) ){
      return(false);
    }
    this.#files[name].volume = volume;
  }

  /**
   * ミュート状態を切り替える
   *
   * 実行する度にミュートのON/OFFを切り替えます。再生は継続します。
   *
   * @param {string} name ファイル名
   * @returns {void|false}
   */
  mute(name){
    if( ! (name in this.#files) ){
      return(false);
    }

    const status = this.#files[name].muted;
    this.#files[name].muted = ! status;
  }

  /**
   * 再生するか確認するダイアログを表示
   *
   * @param {function} callback OKボタンが押された時に実行する関数
   * @return {void}
   */
  dialog(callback, message='音声を再生しますか？'){
    if( typeof callback !== 'function' ){
      return(false);
    }

    // ダイアログを準備
    const dialog = document.createElement('dialog');
    dialog.innerHTML = `
      <form method="dialog">
        <p>${message}</p>
        <menu>
          <button class="button-ok" value="ok">OK</button>
          <button class="button-cancel" value="cancel">Cancel</button>
        </menu>
      </form>
    `;

    // 見た目を整える
    dialog.style.height = '130px';  // 高さを指定
    dialog.style.width  = '350px';  // 幅を指定
    dialog.style.textAlign = 'center';  // 中央寄せ

    // ボタンを大きく
    dialog.querySelectorAll('button').forEach((button) => {
      button.style.width = '100px';
      button.style.height = '30px';
      button.style.margin = '10px';
      button.style.fontSize = '1.2em';

      // OKボタンの色を変更
      if( button.classList.contains('button-ok') ){
        button.style.backgroundColor = '#0d6efd'; // 濃い目の青色
        button.style.color = '#fff'; // 白色
      }
    });

    // ボタンが押された時の処理
    dialog.addEventListener('close', (e) => {
      // OKボタンが押されたらcallback関数を実行
      if( e.target.returnValue === 'ok' ){
        callback();
      }
      dialog.remove();  // ダイアログをHTMLごと削除
    });

    // HTMLに追加して表示
    document.body.appendChild(dialog);
    dialog.showModal();
  }


  //----------------------------------------------------------------------
  // getter/setter
  //----------------------------------------------------------------------
  /**
   * 音量を設定する
   *
   * デフォルト値の変更が可能。再生中の音量はsound.volume()で設定する。
   *
   * @param {number} volume 音量（0.0〜1.0）
   * @return {void}
   */
  set volume(volume){
    if( (typeof volume === 'number') && (0.0 <= volume && volume <= 1.0) ){
      this.#options.volume = volume;
    }
  }

  /**
   * 音量を取得する
   *
   * デフォルト値の取得のみ可能。再生中の音量はsound.volume()で取得する。
   *
   * @param {string} name ファイル名
   * @return {number} 音量（0.0〜1.0）
   */
  get volume(){
    return this.#options.volume;
  }
}