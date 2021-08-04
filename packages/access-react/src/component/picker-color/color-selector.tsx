import AllApplication from '@icon-park/react/lib/icons/AllApplication';
import CheckSmall from '@icon-park/react/lib/icons/CheckSmall';
import History from '@icon-park/react/lib/icons/History';
import classnames from 'classnames';
import React, { useEffect, useState } from 'react';

import { RECOMMEND_COLORS } from './const';
import { StashStore, toHex } from './utils';

const ALLOW_REG = /[^0-9|a-f|A-F]/g;

const colorIsEqual = (color1: string, color2: string) => toHex(color1) === toHex(color2);

const renderTitle = (title: React.ReactElement) => <h5 className="syl-dropdown-list-title color">{title}</h5>;

const renderColorSpan = (color: string, resetColor: string, selectedColor = '') => (
  <span
    className={classnames('syl-color-span-wrapper', { selected: colorIsEqual(color, selectedColor) })}
    key={color}
    data-color={color}
  >
    <span
      style={{ backgroundColor: color }}
      className={classnames('syl-color-span', {
        reset: resetColor === color,
        rim: ['#F8F8F8', '#FFFFFF'].includes(color),
      })}
    />
  </span>
);

const pureColor = (color: string) => color && color.replace(/#/g, '');

interface IInputColorProps {
  setColor: (color: string) => any;
  color: string;
  onChange: (color: string) => any;
}

const InputColor = ({ setColor, color, onChange }: IInputColorProps) => {
  const colorStr = pureColor(color);

  return (
    <div className={classnames('syl-color-preview-container')}>
      <span className="syl-color-preview-wrapper">
        <span className="syl-color-span" style={{ backgroundColor: `#${colorStr}` }} />
      </span>
      <span className="syl-fake-dash">#</span>
      <input
        spellCheck={false}
        value={pureColor(color)}
        maxLength={8}
        onChange={e => onChange((e.target as HTMLInputElement).value)}
        onFocus={e => e.target.setSelectionRange(0, colorStr.length)}
        onClick={e => e.stopPropagation()}
      />
      <button
        onClick={() => {
          setColor(`#${colorStr}`);
        }}
      >
        <CheckSmall theme="outline" size="18" fill="#222" />
      </button>
    </div>
  );
};

const renderPickData = (data: string[], resetColor: string) => {
  if (!data.length) return;
  return (
    <>
      {renderTitle(<History theme="outline" size="14" fill="#222" />)}
      <div className="prev-wrapper">{data.map(color => renderColorSpan(color, resetColor))}</div>
    </>
  );
};

interface IColorListProps {
  name: string;
  max?: number;
  onClick: (color: string | false, force: boolean) => any;
  resetColor: string;
  selectedColor: string;
}

const ColorSelector = ({ name, max = 10, onClick, resetColor, selectedColor }: IColorListProps) => {
  const [store, setStore] = useState<null | StashStore>(null);
  const [inputColor, _setInputColor] = useState(selectedColor);

  useEffect(() => {
    const _store = new StashStore(name, max);
    setStore(_store);
  }, []);

  const setInputColor = (color: string) => {
    if (color === inputColor) {
      return;
    }
    _setInputColor(color);
  };

  const prevPick = store ? store.data : [];

  const setColor = (color: string, force = false) => {
    const realColor = toHex(color);
    if (!realColor) {
      // remove format when empty
      if (color === '#') onClick(false, force);
      return;
    }
    setInputColor(color);
    onClick(color === resetColor ? false : realColor, force);
    store && store.add(realColor, true);
  };

  return (
    <div className="syl-dropdown-wrapper">
      <div
        className="syl-color-list-wrapper"
        onClick={e => {
          const target = e.target as HTMLElement;
          if (target && target.dataset && target.dataset.color) {
            setColor(target.dataset.color);
          }
        }}
      >
        {renderPickData(prevPick, resetColor)}
        {renderTitle(<AllApplication theme="outline" size="14" fill="#222" />)}
        <div className="syl-color-recommend">
          {RECOMMEND_COLORS.map(color => renderColorSpan(color, resetColor, selectedColor))}
        </div>
        <div className="dropdown-hr" />
        <InputColor
          setColor={_color => {
            setColor(_color, true);
          }}
          color={inputColor}
          onChange={val => {
            setInputColor(val.replace(ALLOW_REG, ''));
          }}
        />
      </div>
    </div>
  );
};

export { ColorSelector, IColorListProps };
