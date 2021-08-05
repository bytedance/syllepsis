import { toHex } from '@syllepsis/plugin-basic';

class StashStore {
  public data: string[] = [];
  public maxSize = 0;
  public key = '';

  constructor(key: string, max: number) {
    this.maxSize = max;
    this.key = `syl-${key}`;
    if (!localStorage) return;
    const stashData = localStorage.getItem(this.key);
    if (stashData) {
      try {
        this.data = JSON.parse(stashData);
      } catch (err) {
        this.data = [];
      }
    } else {
      this.data = [];
    }
  }

  add(data: string, transformToHex = false) {
    if (!localStorage) return;
    const _data = transformToHex ? toHex(data) || '#000000' : data;
    const idx = this.data.findIndex(val => val === _data);
    if (idx < 0) {
      this.data.unshift(_data);
      if (this.data.length > this.maxSize) this.data.pop();
    } else {
      this.data.splice(idx, 1);
      this.data.unshift(_data);
    }
    localStorage.setItem(this.key, JSON.stringify(this.data));
  }
}

export { StashStore, toHex };
