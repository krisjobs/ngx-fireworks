export const userBuilder = (
  authUser: AuthUser,
  dbUser?: Partial<DbUser>,
  data?: any,
): Partial<DbUser> => {
  // logger.warn(JSON.stringify(data))
  const now = Timestamp.now() as any;

  const {
    version = process.env.VERSION
  } = data ?? {};

  const attributes = dbUser?.attributes ?? {
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
      ...dbUser?.stats,
      createdBy: dbUser?.stats?.createdBy ?? null!,
      createdAt: now,
      updatedBy: dbUser?.stats?.updatedBy ?? null!,
      updatedAt: now,
      emailVerified: authUser.emailVerified,
    },
    settings: dbUser?.settings ?? {},
    information: {
      ...dbUser?.information,
      email: authUser.email ?? dbUser?.information?.email ?? null!,
      name: authUser.displayName ?? dbUser?.information?.name ?? null!,
      notes: dbUser?.information?.notes ?? null!,
    },
    data: {
      ...dbUser?.data,
      subscribers: [],
    },
    media: {
      ...dbUser?.media,
      defaultUrl: authUser.photoURL ?? dbUser?.media?.defaultUrl ?? null!
    },
  }
}
