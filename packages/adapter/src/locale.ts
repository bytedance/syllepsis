class LocaleStore {
  public localeStore: { [key: string]: any } = {};

  public constructor(json?: { [key: string]: any }) {
    this._set(json);
  }

  public _get(name: string) {
    return this.localeStore[name] || {};
  }

  public _set(json?: { [key: string]: any }) {
    this.localeStore = json || {};
  }
}

export { LocaleStore };
