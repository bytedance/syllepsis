import MoreIcon from '@icon-park/react/es/icons/Add';
import AlignJustifyIcon from '@icon-park/react/es/icons/AlignTextBoth';
import AlignCenterIcon from '@icon-park/react/es/icons/AlignTextCenter';
import AlignLeftIcon from '@icon-park/react/es/icons/AlignTextLeft';
import AlignRightIcon from '@icon-park/react/es/icons/AlignTextRight';
import LetterSpaceIcon from '@icon-park/react/es/icons/AutoLineWidth';
import FormatClearIcon from '@icon-park/react/es/icons/ClearFormat';
import CodeBlockIcon from '@icon-park/react/es/icons/Code';
import HrIcon from '@icon-park/react/es/icons/DividingLine';
import EmojiIcon from '@icon-park/react/es/icons/EmotionHappy';
import FormatPainterIcon from '@icon-park/react/es/icons/FormatBrush';
import HeaderIcon from '@icon-park/react/es/icons/H';
import HeaderOneIcon from '@icon-park/react/es/icons/H1';
import HeaderTwoIcon from '@icon-park/react/es/icons/H2';
import HeaderThreeIcon from '@icon-park/react/es/icons/H3';
import ImageIcon from '@icon-park/react/es/icons/ImageFiles';
import LineIndentIcon from '@icon-park/react/es/icons/IndentRight';
import TableIcon from '@icon-park/react/es/icons/InsertTable';
import LinkIcon from '@icon-park/react/es/icons/LinkOne';
import BulletListIcon from '@icon-park/react/es/icons/ListTwo';
import AudioIcon from '@icon-park/react/es/icons/MusicOne';
import OrderedListIcon from '@icon-park/react/es/icons/OrderedList';
import BlockQuoteIcon from '@icon-park/react/es/icons/Quote';
import RedoIcon from '@icon-park/react/es/icons/Redo';
import LineHeightIcon from '@icon-park/react/es/icons/RowHeight';
import StrikeIcon from '@icon-park/react/es/icons/Strikethrough';
import BoldIcon from '@icon-park/react/es/icons/TextBold';
import ItalicIcon from '@icon-park/react/es/icons/TextItalic';
import UnderlineIcon from '@icon-park/react/es/icons/TextUnderline';
import UndoIcon from '@icon-park/react/es/icons/Undo';
import VideoIcon from '@icon-park/react/es/icons/VideoTwo';
import { IconWrapper, IIconProps } from '@icon-park/react/es/runtime';
import React from 'react';

const SpaceBeforeIcon = IconWrapper('space_before', false, (props: IIconProps) => (
  <svg width={props.size} height={props.size} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48">
    <g>
      <rect fillOpacity="0.01" fill="white" transform="matrix(-1,0,0,1,48,0) " />
      <path
        transform="rotate(-90 24.000003814697266,8.511279106140135) "
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="4"
        stroke="#333"
        d="m21.499999,3.511279l5,5l-5,5"
      />
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="4" stroke="#333" d="m42,39l-36,0" />
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="4" stroke="#333" d="m42.150376,29.075189l-36,0" />
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="4" stroke="#333" d="m42.15038,19.000003l-36,0" />
    </g>
  </svg>
));

const SpaceAfterIcon = IconWrapper('space_after', false, (props: IIconProps) => (
  <svg width={props.size} height={props.size} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48">
    <g>
      <rect fillOpacity="0.01" fill="white" transform="matrix(-1,0,0,1,48,0)" />
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="4" stroke="#333" d="m42,9l-36,0" />
      <path
        transform="rotate(90 23.999998092651364,38.894760131835945) "
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="4"
        stroke="#333"
        d="m21.499999,33.894738l5,5l-5,5"
      />
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="4" stroke="#333" d="m42.150376,29.075189l-36,0" />
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="4" stroke="#333" d="m42.15038,19.000003l-36,0" />
    </g>
  </svg>
));

const SpaceBothIcon = IconWrapper('space_both', false, (props: IIconProps) => (
  <svg width={props.size} height={props.size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <g>
      <rect x="-0.43956" y="-0.659341" fillOpacity="0.01" fill="white" transform="matrix(-1,0,0,1,48,0) " />
      <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="4" stroke="#333" d="m42,9l-36,0" />
      <path
        transform="rotate(180 39.5,24.000000000000004) "
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="4"
        stroke="#333"
        d="m37,19l5,5l-5,5"
      />
      <path id="svg_6" strokeLinejoin="round" strokeLinecap="round" strokeWidth="4" stroke="#333" d="m42,39l-36,0" />
      <path stroke="#333" strokeLinejoin="round" strokeLinecap="round" strokeWidth="4" d="m30.499999,18.89011l-13,0" />
      <path
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="4"
        stroke="#333"
        d="m6.010988,18.999999l5,5l-5,5"
      />
      <path stroke="#333" strokeLinejoin="round" strokeLinecap="round" strokeWidth="4" d="m30.5,28.120879l-13,0" />
    </g>
  </svg>
));

const BackgroundIcon = IconWrapper('background', false, (props: IIconProps) => (
  <svg width={props.size} height={props.size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" fill="white" fillOpacity="0.01" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M37 37C39.2091 37 41 35.2091 41 33C41 31.5272 39.6667 29.5272 37 27C34.3333 29.5272 33 31.5272 33 33C33 35.2091 34.7909 37 37 37Z"
      fill="#333"
    />
    <path d="M20.8535 5.50439L24.389 9.03993" stroke="#333" strokeWidth="4" strokeLinecap="round" />
    <path
      d="M23.6818 8.33281L8.12549 23.8892L19.4392 35.2029L34.9955 19.6465L23.6818 8.33281Z"
      stroke="#333"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path d="M12 20.0732L28.961 25.6496" stroke="#333" strokeWidth="4" strokeLinecap="round" />
    <path d="M4 43H44" stroke="#333" strokeWidth="4" strokeLinecap="round" color-line="true" />
  </svg>
));

const ColorIcon = IconWrapper('color', false, (props: IIconProps) => (
  <svg width={props.size} height={props.size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <g>
      <g stroke="null">
        <rect stroke="null" fill="white" fillOpacity="0.01" y="-8.914748" x="20.415585" />
        <path
          stroke="#333"
          d="m10.857144,34.17365l4.380992,-9.575199m21.904722,9.575199l-4.380992,-9.575199m0,0l-2.190436,-4.7876l-6.571429,-14.362799l-6.571429,14.362799l-2.190436,4.7876m17.52373,0l-17.52373,0"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          stroke="#333"
          d="m4.883118,42.551949l38.233766,0"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          color-line="true"
        />
      </g>
    </g>
  </svg>
));

const SubIcon = IconWrapper('sub', false, (props: IIconProps) => (
  <svg width={props.size} height={props.size} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48">
    <g>
      <rect fillOpacity="0.01" fill="white" height="48" width="48" />
      <path
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="4"
        stroke="#333"
        d="m4,42l4.94118,-12m23.05882,12l-4.9412,-12m0,0l-2.0588,-5l-7,-17l-7,17l-2.05882,5m18.11762,0l-18.11762,0"
      />
      <path
        xmlns="http://www.w3.org/2000/svg"
        stroke="#333"
        id="svg_3"
        transform="translate(32.048091888427734,22.16860580444336) scale(0.4000000059604645) "
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="4"
        d="m10.626485,51.397561l3.750538,-9.788809m17.502495,9.788809l-3.750553,-9.788809m0,0l-1.562705,-4.07867l-5.313258,-13.86748l-5.313258,13.86748l-1.56272,4.07867m13.751942,0l-13.751942,0"
      />
    </g>
  </svg>
));

const SupIcon = IconWrapper('sup', false, (props: IIconProps) => (
  <svg width={props.size} height={props.size} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 48 48">
    <g>
      <rect fillOpacity="0.01" fill="white" />
      <path
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="4"
        stroke="#333"
        d="m4,42l4.94118,-12m23.05882,12l-4.9412,-12m0,0l-2.0588,-5l-7,-17l-7,17l-2.05882,5m18.11762,0l-18.11762,0"
      />
      <path
        stroke="#333"
        transform="translate(32.048091888427734,22.16860580444336) scale(0.4000000059604645) "
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="4"
        d="m10.626485,-9.987835l3.750538,-9.788809m17.502495,9.788809l-3.750553,-9.788809m0,0l-1.562705,-4.07867l-5.313258,-13.86748l-5.313258,13.86748l-1.56272,4.07867m13.751942,0l-13.751942,0"
        xmlns="http://www.w3.org/2000/svg"
      />
    </g>
  </svg>
));

const Icons = {
  redo: <RedoIcon size="18" />,
  undo: <UndoIcon size="18" />,
  sub: <SubIcon size="18" />,
  sup: <SupIcon size="18" />,
  background: <BackgroundIcon size="18" />,
  block_quote: <BlockQuoteIcon size="18" />,
  bold: <BoldIcon size="18" />,
  bullet_list: <BulletListIcon size="18" />,
  emoji: <EmojiIcon size="18" />,
  hr: <HrIcon size="18" />,
  code_block: <CodeBlockIcon size="18" />,
  image: <ImageIcon size="18" />,
  color: <ColorIcon size="18" />,
  italic: <ItalicIcon size="18" />,
  ordered_list: <OrderedListIcon size="18" />,
  strike: <StrikeIcon size="18" />,
  underline: <UnderlineIcon size="18" />,
  align_left: <AlignLeftIcon size="18" />,
  align_center: <AlignCenterIcon size="18" />,
  align_right: <AlignRightIcon size="18" />,
  align_justify: <AlignJustifyIcon size="18" />,
  header: [
    <HeaderIcon size="18" />,
    <HeaderOneIcon size="18" />,
    <HeaderTwoIcon size="18" />,
    <HeaderThreeIcon size="18" />,
  ],
  format_clear: <FormatClearIcon size="18" />,
  more: <MoreIcon size="18" />,
  header1: <HeaderOneIcon size="18" />,
  header2: <HeaderTwoIcon size="18" />,
  header3: <HeaderThreeIcon size="18" />,
  letter_space: <LetterSpaceIcon size="18" />,
  line_height: <LineHeightIcon size="18" />,
  line_indent: <LineIndentIcon size="18" />,
  space_before: <SpaceBeforeIcon size="18" />,
  space_after: <SpaceAfterIcon size="18" />,
  space_both: <SpaceBothIcon size="18" />,
  format_painter: <FormatPainterIcon size="18" />,
  table: <TableIcon size="18" />,
  link: <LinkIcon size="18" />,
  video: <VideoIcon size="18" />,
  audio: <AudioIcon size="18" />,
};

export {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AudioIcon,
  BackgroundIcon,
  BlockQuoteIcon,
  BoldIcon,
  BulletListIcon,
  CodeBlockIcon,
  ColorIcon,
  EmojiIcon,
  FormatClearIcon,
  FormatPainterIcon,
  HeaderIcon,
  HeaderOneIcon,
  HeaderThreeIcon,
  HeaderTwoIcon,
  HrIcon,
  Icons,
  ImageIcon,
  ItalicIcon,
  LetterSpaceIcon,
  LineHeightIcon,
  LineIndentIcon,
  LinkIcon,
  MoreIcon,
  OrderedListIcon,
  RedoIcon,
  SpaceAfterIcon,
  SpaceBeforeIcon,
  SpaceBothIcon,
  StrikeIcon,
  SubIcon,
  SupIcon,
  TableIcon,
  UnderlineIcon,
  UndoIcon,
  VideoIcon,
};
