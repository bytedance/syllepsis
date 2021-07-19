enum FORMAT_TYPE {
  CARD = 0b1000,
  ATOM = 0b0100,
  INLINE = 0b0010,
  BLOCK = 0b0001,
  INLINE_ATOM = 0b0110,
  BLOCK_ATOM = 0b0101,
  INLINE_CARD = 0b1010,
  BLOCK_CARD = 0b1001,
}

// for remove useless tags to user
const SYL_TAG = '__syl_tag';
const SELECT_CLS = 'syl-selected-card';

const FLAG = Symbol.for('__schema_format_type__');
const META = Symbol.for('__schema_metadata__');

export { FLAG, FORMAT_TYPE, META, SELECT_CLS, SYL_TAG };
