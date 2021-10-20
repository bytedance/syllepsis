const baseExternals = [
  'prosemirror-view',
  'prosemirror-state',
  'prosemirror-commands',
  'prosemirror-history',
  'prosemirror-keymap',
  'prosemirror-model',
  'prosemirror-transform',
];

const checkIsExternal = externals => source =>
  // 匹配 ^external
  !externals.concat(baseExternals).every(external => !new RegExp(`^${external}(?![-|a-z|A-Z|_])`, 'g').test(source));

export { checkIsExternal };
