# Types of

## IDefaultConfig

```typescript
interface IDefaultConfig<T = number> {
   value: T;
   default: boolean;
}
```

## TAllowedValuesConfig

```typescript
type TAllowedValueConfig<T = number> = T | IDefaultConfig<T>;
type TAllowedValuesConfig<T = number> = Array<TAllowedValueConfig<T>> | IDefaultConfig | false;
```

## TValuesConfig

```typescript
type TValueConfig = number | {value?: number; default?: boolean; attrs?: Types.StringMap<any>; text?: any };
type TValuesConfig = Array<TValueConfig>;
```

## IUserAttrsConfig

```typescript
type IUserAttrsConfig = Types.StringMap<{
   default: any;
   [key: string]: any;
   getFromDOM: (dom: HTMLElement) => any | void | undefined; // used in `parseDOM`
   setDOMAttr: (value: string, attrs: Types.StringMap<any>) => void; // used in `toDOM`
}>;
```