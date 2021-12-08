function isOk(res: any) {
  return res.status === 200 && res.data.status === 0;
}

export {
  isOk
}
