import './resizeable.css';

import React from 'react';

enum ltList {
  lt1 = 'lt1',
  lt2 = 'lt2',
  lt3 = 'lt3',
  lt4 = 'lt4',
  lt5 = 'lt5',
  lt6 = 'lt6',
  lt7 = 'lt7',
  lt8 = 'lt8'
}

const positive = {
  'lt1': { x: -1, y: -1 },
  'lt2': { x: 0, y: -1 },
  'lt3': { x: 1, y: -1 },
  'lt4': { x: 1, y: 0 },
  'lt5': { x: 1, y: 1 },
  'lt6': { x: 0, y: 1 },
  'lt7': { x: -1, y: 1 },
  'lt8': { x: -1, y: 0 }
}

function ResizeBox(props: {
  width: number,
  height: number,
  maxWidth: number,
  onResize: (options: { width: number, height: number }, updateData?: boolean) => void,
  sensitivity?: number,
  enabled?: boolean,
}) {
  const { width, height, maxWidth, onResize, sensitivity = 1, enabled = false } = props;

  let startX = 0;
  let startY = 0;
  let positiveX = 0;
  let positiveY = 0;
  let resizeWidth = Math.min(width, maxWidth);
  let resizeHeight = height;

  function onMouseDown(event: React.MouseEvent<HTMLSpanElement>, name: ltList) {
    const { clientX, clientY } = event;
    startX = clientX;
    startY = clientY;
    positiveX = positive[name].x;
    positiveY = positive[name].y;

    event.preventDefault();
    event.stopPropagation();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(event: MouseEvent) {
    const { clientX, clientY } = event;
    resizeWidth = Math.min(maxWidth, width + Math.floor((clientX - startX) * positiveX * sensitivity));
    resizeHeight = height + Math.floor((clientY - startY) * positiveY * sensitivity);
    onResize({ width: resizeWidth, height: resizeHeight });
  }

  function onMouseUp() {
    onResize({ width: resizeWidth, height: resizeHeight }, true);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  if (!enabled) {
    return null;
  }

  /**
   *  lt1 --- lt2 ---- lt3
   *  |                |
   *  |                |
   *  lt8              lt4
   *  |                |
   *  |                |
   *  lt7------lt6-----lt5
   */
  return (
    <div className="resize-wrapper" data-ignore-adapt={true}>
      {
        ['lt1', 'lt2', 'lt3', 'lt4', 'lt5', 'lt6', 'lt7', 'lt8'].map((eachKey) =>
          <span className={'lt ' + eachKey}
            key={eachKey}
            onMouseDown={(event) => onMouseDown(event, eachKey as ltList)}
            onMouseUp={onMouseUp}/>)
      }
    </div>
  );
}

export {
  ResizeBox
}