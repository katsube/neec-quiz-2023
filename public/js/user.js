/**
 * User class
 *
 * @class User
 */
class User{
  #STORAGE_KEY = 'user';
  name  = null;
  token = null;
  room  = null;

  constructor(){
    this.name = this.getName();
  }

  setName(name){
    this.name = name;
    this.#saveLocalStorage('name', name);
  }

  getName(){
    if( ! this.name ){
      this.name = this.#getLocalStorage('name');
    }
    return this.name;
  }

  #getLocalStorage(name){
    const key   = `${this.#STORAGE_KEY}-${name}`;
    const value = localStorage.getItem(key);
    const json  = JSON.parse(value);
    return json;
  }

  #saveLocalStorage(name, value){
    const key = `${this.#STORAGE_KEY}-${name}`;
    const json = JSON.stringify(value);
    localStorage.setItem(key, json);
  }
}