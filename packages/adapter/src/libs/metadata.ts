// simple metadata
const MetadataWeakMap = new WeakMap<any, Map<any, any>>();

const defineMetadata = (key: any, value: any) => (atom: any) => {
  let metadataMap = MetadataWeakMap.get(atom);
  if (metadataMap) metadataMap.set(key, value);
  else metadataMap = new Map([[key, value]]);

  MetadataWeakMap.set(atom, metadataMap);
};

const getMetadata = (key: any, atom: any) => {
  let target = atom;

  while (target) {
    const metadataMap = MetadataWeakMap.get(target);
    if (!metadataMap) {
      target = Object.getPrototypeOf(target);
      continue;
    }
    const value = metadataMap.get(key);
    return value ? value : null;
  }
};

export { defineMetadata, getMetadata };
