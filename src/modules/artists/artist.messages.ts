import { MessageDefinition } from '../../core/messages';

export const ArtistMessages = {
  LIST_SUCCESS: {
    kind: 'SUCCESS',
    classId: 'Artist',
    shortName: 'LIST_SUCCESS',
    code: 1101,
    httpStatus: 200,
  },
  GET_SUCCESS: {
    kind: 'SUCCESS',
    classId: 'Artist',
    shortName: 'GET_SUCCESS',
    code: 1102,
    httpStatus: 200,
  },
  CREATED: {
    kind: 'SUCCESS',
    classId: 'Artist',
    shortName: 'CREATED',
    code: 1103,
    httpStatus: 201,
  },
  UPDATED: {
    kind: 'SUCCESS',
    classId: 'Artist',
    shortName: 'UPDATED',
    code: 1104,
    httpStatus: 200,
  },
  DELETED: {
    kind: 'SUCCESS',
    classId: 'Artist',
    shortName: 'DELETED',
    code: 1105,
    httpStatus: 200,
  },
  NOT_FOUND: {
    kind: 'ERROR',
    classId: 'Artist',
    shortName: 'NOT_FOUND',
    code: 3504,
    httpStatus: 404,
  },
  ALREADY_EXISTS: {
    kind: 'ERROR',
    classId: 'Artist',
    shortName: 'ALREADY_EXISTS',
    code: 3509,
    httpStatus: 409,
  },
} as const satisfies Record<string, MessageDefinition>;

export type ArtistMessageKey = keyof typeof ArtistMessages;
