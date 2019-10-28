// @flow
// @format

import {Document} from 'slate';
import {createLine, getLineTextNode} from './Line';

type Version = {
  major: number,
  minor: number,
  patch: number,
};

type SerializedLine = {
  data: Map<string, boolean | string | number>,
  text: string,
};

type Serialization = {
  version: Version,
  lines: Array<SerializedLine>,
};

const CURRENT_VERSION: Version = {
  major: 0,
  minor: 0,
  patch: 0,
};

export function serializeDocument(doc: Object): Serialization {
  return {
    version: CURRENT_VERSION,
    lines: doc.nodes.map(node => ({
      data: node.data.toJSON(),
      text: getLineTextNode(node).text,
    })),
  };
}

export function deserializeToDocument(obj: Object): Document {
  const serialization = ((obj: any): Serialization);
  const json = {
    object: 'document',
    data: {},
    nodes: serialization.lines.map(line => createLine(line.text, line.data)),
  };

  return Document.fromJSON(json);
}
