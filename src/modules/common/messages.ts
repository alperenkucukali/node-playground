import { MessageDefinition } from '../../core/messages';

export const CommonMessages = {
  INVALID_CURSOR: {
    kind: 'ERROR',
    classId: 'Common',
    shortName: 'INVALID_CURSOR',
    code: 3000,
    httpStatus: 400,
  },
  INVALID_JSON: {
    kind: 'ERROR',
    classId: 'Common',
    shortName: 'INVALID_JSON',
    code: 3002,
    httpStatus: 400,
  },
  TENANT_REQUIRED: {
    kind: 'ERROR',
    classId: 'Common',
    shortName: 'TENANT_REQUIRED',
    code: 3003,
    httpStatus: 400,
  },
  INVALID_INPUT: {
    kind: 'ERROR',
    classId: 'Common',
    shortName: 'INVALID_INPUT',
    code: 3004,
    httpStatus: 400,
  },
} satisfies Record<string, MessageDefinition>;

export type CommonMessageKey = keyof typeof CommonMessages;
