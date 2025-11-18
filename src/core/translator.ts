const translations: Record<string, Record<string, string>> = {
  'en-US': {
    'Successes.Genre.LIST_SUCCESS': 'Genres retrieved successfully.',
    'Successes.Genre.GET_SUCCESS': 'Genre retrieved successfully.',
    'Successes.Genre.CREATED': 'Genre created successfully.',
    'Successes.Genre.UPDATED': 'Genre updated successfully.',
    'Successes.Genre.DELETED': 'Genre deleted successfully.',
    'Errors.Genre.NOT_FOUND': 'Requested genre could not be found.',
    'Errors.Genre.ALREADY_EXISTS': 'A genre with the same id already exists.',
    'Successes.Artist.LIST_SUCCESS': 'Artists retrieved successfully.',
    'Successes.Artist.GET_SUCCESS': 'Artist retrieved successfully.',
    'Successes.Artist.CREATED': 'Artist created successfully.',
    'Successes.Artist.UPDATED': 'Artist updated successfully.',
    'Successes.Artist.DELETED': 'Artist deleted successfully.',
    'Errors.Artist.NOT_FOUND': 'Requested artist could not be found.',
    'Errors.Artist.ALREADY_EXISTS': 'An artist with the same id already exists.',
    'Errors.Common.INVALID_CURSOR': 'Cursor token is invalid.',
    'Errors.Common.INVALID_JSON': 'Request body must be valid JSON.',
    'Errors.Common.TENANT_REQUIRED': 'Tenant identifier header is required.',
    'Errors.Common.INVALID_INPUT': 'One or more fields failed validation.',
  },
  'tr-TR': {
    'Successes.Genre.LIST_SUCCESS': 'Türler başarıyla getirildi.',
    'Successes.Genre.GET_SUCCESS': 'Tür başarıyla getirildi.',
    'Successes.Genre.CREATED': 'Tür başarıyla oluşturuldu.',
    'Successes.Genre.UPDATED': 'Tür başarıyla güncellendi.',
    'Successes.Genre.DELETED': 'Tür başarıyla silindi.',
    'Errors.Genre.NOT_FOUND': 'İstenen tür bulunamadı.',
    'Errors.Genre.ALREADY_EXISTS': 'Aynı kimliğe sahip bir tür zaten mevcut.',
    'Successes.Artist.LIST_SUCCESS': 'Sanatçılar başarıyla getirildi.',
    'Successes.Artist.GET_SUCCESS': 'Sanatçı başarıyla getirildi.',
    'Successes.Artist.CREATED': 'Sanatçı başarıyla oluşturuldu.',
    'Successes.Artist.UPDATED': 'Sanatçı başarıyla güncellendi.',
    'Successes.Artist.DELETED': 'Sanatçı başarıyla silindi.',
    'Errors.Artist.NOT_FOUND': 'İstenen sanatçı bulunamadı.',
    'Errors.Artist.ALREADY_EXISTS': 'Aynı kimliğe sahip bir sanatçı zaten mevcut.',
    'Errors.Common.INVALID_CURSOR': 'Cursor değeri geçersiz.',
    'Errors.Common.INVALID_JSON': 'İstek gövdesi geçerli JSON olmalıdır.',
    'Errors.Common.TENANT_REQUIRED': 'Tenant kimliği başlığı gereklidir.',
    'Errors.Common.INVALID_INPUT': 'Bir veya daha fazla alan doğrulamadan geçemedi.',
  },
};

export const translator = {
  translate(key: string, locale: string): string {
    const normalizedLocale = translations[locale] ? locale : 'en-US';
    return translations[normalizedLocale][key] || key;
  },
};
