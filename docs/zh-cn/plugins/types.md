# 类型

## IDefaultConfig

```typescript
interface IDefaultConfig<T = number> {
  value: T;
  default: boolean;
}
```

## TAllowedValuesConfig

```typescript
// the supports the value configuration of the setting
type TAllowedValueConfig<T = number> = T | IDefaultConfig<T>;
type TAllowedValuesConfig<T = number> = Array<TAllowedValueConfig<T>> | IDefaultConfig | false;
```

## TValuesConfig

```typescript
// the values show in dropdown
type TValueConfig = number | { value?: number; default?: boolean; attrs?: Types.StringMap<any>; text?: any };
type TValuesConfig = Array<TValueConfig>;
```

## IUserAttrsConfig

```typescript
// used to extend default attrs
type IUserAttrsConfig = Types.StringMap<{
  default: any;
  [key: string]: any; // other attrs spec
  getFromDOM: (dom: HTMLElement) => any | void | undefined; // used in `parseDOM`
  setDOMAttr: (value: string, attrs: Types.StringMap<any>) => void; // used in `toDOM`
}>;
```
