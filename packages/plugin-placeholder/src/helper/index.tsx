function deepCopy(json: any) {
  return JSON.parse(JSON.stringify(json));
}

export {
  deepCopy
}
