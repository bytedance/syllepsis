import { ITypesetAttrs, Types } from '@syllepsis/adapter';
import { AttributeSpec } from 'prosemirror-model';

interface IDefaultConfig<T = number> {
  value: T;
  default: boolean;
}
// the supports the value configuration of the setting
type TAllowedValueConfig<T = number> = T | IDefaultConfig<T>;
type TAllowedValuesConfig<T = number> = Array<TAllowedValueConfig<T>> | IDefaultConfig | false;

// the values show in dropdown
type TValueConfig = number | { value?: number; default?: boolean; attrs?: Types.StringMap<any>; text?: any };
type TValuesConfig = Array<TValueConfig>;
interface ITypesetProps {
  defaultFontSize?: number;
  allowedAligns?: TAllowedValuesConfig<string>;
  allowedLineHeights?: TAllowedValuesConfig;
  allowedLineIndents?: TAllowedValuesConfig;
  allowedSpaceBefores?: TAllowedValuesConfig;
  allowedSpaceAfters?: TAllowedValuesConfig;
  allowedSpaceBoths?: TAllowedValuesConfig;
}

const getAttrName = (prop: string) => {
  const name = prop.replace(/^allowed/, '').replace(/([^s])s$/, '$1');
  return name.charAt(0).toLocaleLowerCase() + name.substr(1);
};
const getNestedValue = (val: number, valAllowed: Array<string | number> | false) => {
  if (!valAllowed) return;
  if (!valAllowed.length) return val;
  let res = valAllowed[0];
  valAllowed.some(standardVal => {
    if (val <= standardVal) {
      res = standardVal;

      return false;
    }
    return true;
  });
  return res;
};
// sort from largest to smallest
const sortTypesetConfig = (config: Array<number>) =>
  config.sort((a, b) => {
    if (typeof b !== 'number') return 0;
    return b - a;
  });

const formatAllowedValues = (
  config?: TAllowedValuesConfig,
): { values: false | Array<string | number>; defaultValue: undefined | number | string } => {
  let defaultValue;
  let values: any = false;
  if (config) {
    if (Array.isArray(config)) {
      values = sortTypesetConfig(
        config.map(val => {
          if (val instanceof Object) {
            if (val.default) defaultValue = val.value;
            return val.value;
          }
          return val;
        }),
      );
    } else if (config.default) {
      defaultValue = config.value;
      values = [] as string[];
    }
  }

  return { values, defaultValue };
};

// format the `allowedValues` config
const getFormatAttrsByValue = (allowedValues: TAllowedValuesConfig, attrName: string) => {
  const { values, defaultValue } = formatAllowedValues(allowedValues);

  const formatAttrs = (_attrs: Types.StringMap<any>) => {
    const val = getNestedValue(_attrs[attrName], values);
    if (val === defaultValue) return false;
    return { [attrName]: val };
  };

  return { formatAttrs, values, defaultValue };
};

/**
 * analysis of attrs for constructing typesetting
 * @param config ITypesetProps
 * @returns {number} defaultFontSize default font size, used to transform
 * @returns {Function} formatAttrs used to format and output `attrs` according to config
 * @returns {Object} defaultAttrs new default `attrs` constructed according to config
 */
const constructTypesetParseDOM = (config: ITypesetProps) => {
  const { defaultFontSize = 16 } = config;

  const defaultAttrs: Partial<{ [k in keyof ITypesetAttrs]: AttributeSpec } & { [T: string]: AttributeSpec }> = {};

  const getNestedValueByKey: {
    [key in keyof Omit<ITypesetAttrs, 'align'>]: (v: number) => number | string | undefined;
  } = {};

  const allowValues: Types.StringMap<Array<string | number>> = {
    align: ['left', 'center', 'right', 'justify'],
  };

  (Object.keys(config) as Array<keyof ITypesetProps>).forEach(key => {
    if (!/^allowed/.test(key) || !config[key]) return;
    const attrName = getAttrName(key);
    const { values, defaultValue } = formatAllowedValues(config[key] as TAllowedValuesConfig);
    defaultValue !== undefined && (defaultAttrs[attrName as any] = { default: defaultValue });
    values && (allowValues[attrName] = values);
    getNestedValueByKey[attrName as keyof typeof getNestedValueByKey] = (val: number) => getNestedValue(val, values);
  });

  const formatAttrs = (nodeAttrs: ITypesetAttrs & Types.StringMap<any>, dom?: HTMLElement) => {
    /**
     * * if not pass, do not accept all values (default behavior)
     * * pass [], accept all values
     * * other ['xx'] conditions are matched according to the configuration
     */
    const attrs = { ...nodeAttrs };
    (Object.keys(attrs) as Array<keyof ITypesetAttrs>).forEach(key => {
      const val: any = attrs[key];
      // not number, use match
      if (Number.isNaN(parseInt(val as string, 10))) {
        if (!allowValues[key]) {
          attrs[key] = undefined;
          return;
        }
        if (!allowValues[key].length) return;
        const resVal = allowValues[key].includes(val as string) ? val : undefined;
        attrs[key] = resVal as any;
        return;
      }

      const formatFn = getNestedValueByKey[key as keyof typeof getNestedValueByKey];
      if (formatFn) {
        val !== undefined && val !== '' && (attrs[key] = formatFn(+val) as any);
      } else {
        attrs[key] = undefined;
      }
    });
    return attrs;
  };

  return { defaultFontSize, formatAttrs, defaultAttrs };
};

const formatMenuValues = (attrsName: string, valueConfigs: TValuesConfig = [], defaultVal: any = false) => {
  const res: Array<{ text: any; attrs: false | any }> = [];
  if (!valueConfigs) return res;
  let values = valueConfigs;
  if (!Array.isArray(valueConfigs)) values = [valueConfigs];
  values.forEach(val => {
    if (typeof val === 'object') {
      const config = { ...val };
      if (val.value !== undefined) config.text = val.value;
      if (!val.attrs) config.attrs = val.default ? defaultVal : { [attrsName]: val.value };
      res.push(config as { text: any; attrs: any });
    } else {
      res.push({ text: val, attrs: { [attrsName]: val } });
    }
  });
  return res;
};

export {
  constructTypesetParseDOM,
  formatMenuValues,
  getFormatAttrsByValue,
  getNestedValue,
  ITypesetProps,
  TAllowedValuesConfig,
  TValuesConfig,
};
