interface IData {
  [key: string]: [value: any]
}

const tempData: IData = {};

function setData(name: string, value: any) {
  tempData[name] = value;
  if (observeObj[name]) {
    observeObj[name].forEach((eachFunc) => {
      eachFunc(value);
    })
  }
}

function getData(name: string) {
  return tempData[name] || {};
}

interface IObserveData {
  [key: string]: [value: (data: any) => void]
}

const observeObj: IObserveData = {};

export {
  getData,
  IData,
  setData
}
