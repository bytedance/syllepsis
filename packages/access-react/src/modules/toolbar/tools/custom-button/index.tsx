import './style.css';

import { SylApi } from '@syllepsis/adapter';
import { TCustomContent } from '@syllepsis/editor';
import React from 'react';

import { Tooltip } from '../utils';

const CustomButton = ({ render, name, tooltip: configTooltip, editor }: TCustomContent & { editor: SylApi }) => {
  const renderContent = () => render(editor);
  const localeTip = editor.configurator.getLocaleValue(name).tooltip;
  const tooltip = configTooltip || localeTip;
  return (
    <div className={'syl-toolbar-tool custom ' + (name || '')}>
      {tooltip ? <Tooltip content={tooltip}>{renderContent()}</Tooltip> : renderContent()}
    </div>
  );
};

export { CustomButton };
