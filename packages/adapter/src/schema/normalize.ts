import clone from 'lodash.clonedeep';
import OrderedMap from 'orderedmap';
import { Schema, SchemaSpec } from 'prosemirror-model';

import { Types } from '../libs';
import { SchemaMeta } from './schema';

const getSpecFromMap = (origin: SchemaSpec) => {
  if (origin.nodes instanceof OrderedMap && origin.marks instanceof OrderedMap) {
    const obj: any = { nodes: {}, marks: {} };
    origin.nodes.forEach((name, spec) => (obj.nodes[name] = spec));
    origin.marks.forEach((name, spec) => (obj.marks[name] = spec));
    return obj;
  }

  return origin;
};

const updateSchema = (origin: SchemaSpec, patches: SchemaMeta[]) => {
  const newSchema = clone(getSpecFromMap(origin));

  patches
    .filter(p => p && p.name)
    .reduce((res, cur) => {
      const name = cur.name;
      const type = cur.getDisplay();
      const spec = res[type] as Types.StringMap<any>;

      spec[name] && console.warn('repeat registration', name);
      spec[name] = cur.config;

      return res;
    }, newSchema);

  return newSchema;
};

const createSchema = (schema: SchemaSpec) => new Schema(schema);

export { createSchema, updateSchema };
