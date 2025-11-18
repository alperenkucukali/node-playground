export type MessageKind = 'SUCCESS' | 'ERROR';

export interface MessageDefinition {
  kind: MessageKind;
  classId: string;
  shortName: string;
  code: number;
  httpStatus: number;
}

export const getI18nKey = (def: MessageDefinition): string => {
  const root = def.kind === 'SUCCESS' ? 'Successes' : 'Errors';
  return `${root}.${def.classId}.${def.shortName}`;
};
