import { MessageDefinition } from '../../core/messages';

export const GenreMessages = {
  LIST_SUCCESS: {
    kind: 'SUCCESS',
    classId: 'Genre',
    shortName: 'LIST_SUCCESS',
    code: 1001,
    httpStatus: 200,
  },
  GET_SUCCESS: {
    kind: 'SUCCESS',
    classId: 'Genre',
    shortName: 'GET_SUCCESS',
    code: 1002,
    httpStatus: 200,
  },
  CREATED: {
    kind: 'SUCCESS',
    classId: 'Genre',
    shortName: 'CREATED',
    code: 1003,
    httpStatus: 201,
  },
  UPDATED: {
    kind: 'SUCCESS',
    classId: 'Genre',
    shortName: 'UPDATED',
    code: 1004,
    httpStatus: 200,
  },
  DELETED: {
    kind: 'SUCCESS',
    classId: 'Genre',
    shortName: 'DELETED',
    code: 1005,
    httpStatus: 200,
  },
  NOT_FOUND: {
    kind: 'ERROR',
    classId: 'Genre',
    shortName: 'NOT_FOUND',
    code: 3404,
    httpStatus: 404,
  },
  ALREADY_EXISTS: {
    kind: 'ERROR',
    classId: 'Genre',
    shortName: 'ALREADY_EXISTS',
    code: 3409,
    httpStatus: 409,
  },
} as const satisfies Record<string, MessageDefinition>;

export type GenreMessageKey = keyof typeof GenreMessages;
