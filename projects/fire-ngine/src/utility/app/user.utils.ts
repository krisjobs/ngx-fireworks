import { User as AuthUser } from '@angular/fire/auth';

import { EntityTimestamp, User as UserEntity } from '../../common/models';
import { now } from '../../common/utility';


export const userBuilder = (
  authUser: AuthUser,
  userEntity?: Partial<UserEntity>,
  data?: any,
): Partial<UserEntity> => {
  // logger.warn(JSON.stringify(data))
  const timestampNow: EntityTimestamp = now();

  const {
    version = 1 // process.env.VERSION
  } = data ?? {};

  const attributes = userEntity?.attributes ?? {
    isActive: false,
    category: null,
    isArchived: false,
    isDefault: false,
    isSelected: false,
    isSuggested: false,
    rating: 0,
    type: 'user',
  };

  return {
    attributes,
    stats: {
      version,
      ...userEntity?.stats,
      createdBy: userEntity?.stats?.createdBy ?? null!,
      createdAt: timestampNow,
      updatedBy: userEntity?.stats?.updatedBy ?? null!,
      updatedAt: timestampNow,
      emailVerified: authUser.emailVerified,
    },
    settings: userEntity?.settings ?? {},
    information: {
      ...userEntity?.information,
      email: authUser.email ?? userEntity?.information?.email ?? null!,
      name: authUser.displayName ?? userEntity?.information?.name ?? null!,
      notes: userEntity?.information?.notes ?? null!,
    },
    data: {
      ...userEntity?.data,
      subscribers: [],
    },
    media: {
      ...userEntity?.media,
      defaultUrl: authUser.photoURL ?? userEntity?.media?.defaultUrl ?? null!
    },
  }
}
