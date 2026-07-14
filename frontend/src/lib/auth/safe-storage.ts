type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function createStorage(getStorage: () => Storage | undefined): StorageLike {
  return {
    getItem: (name) => {
      try {
        return getStorage()?.getItem(name) ?? null;
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        getStorage()?.setItem(name, value);
      } catch {
        // iOS private browsing can block storage; cookie auth still works.
      }
    },
    removeItem: (name) => {
      try {
        getStorage()?.removeItem(name);
      } catch {
        // Ignore storage cleanup failures.
      }
    },
  };
}

const local = createStorage(() =>
  typeof window !== 'undefined' ? window.localStorage : undefined,
);

const session = createStorage(() =>
  typeof window !== 'undefined' ? window.sessionStorage : undefined,
);

/** Prefer localStorage; fall back to sessionStorage on iOS/private mode. */
export const safeBrowserStorage: StorageLike = {
  getItem: (name) => local.getItem(name) ?? session.getItem(name),
  setItem: (name, value) => {
    local.setItem(name, value);
    if (!local.getItem(name)) {
      session.setItem(name, value);
    }
  },
  removeItem: (name) => {
    local.removeItem(name);
    session.removeItem(name);
  },
};
