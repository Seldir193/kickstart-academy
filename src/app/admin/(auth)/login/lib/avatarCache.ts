type CacheData = {
  avatarUrl: string | null;
  fullName: string | null;
  userId: string | null;
};

function cacheFromUser(user: any): CacheData {
  return {
    avatarUrl: user?.avatarUrl ?? null,
    fullName: user?.fullName ?? null,
    userId: user?.id || user?._id || user?.providerId || null,
  };
}

function needsProfile(data: CacheData) {
  return !data.userId || !data.avatarUrl || !data.fullName;
}

async function fetchProfileCache(current: CacheData) {
  const response = await fetch("/api/admin/auth/profile", {
    credentials: "include",
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !(data?.ok ?? response.ok)) return current;
  const profile = cacheFromUser(data?.user);
  return mergeCache(current, profile);
}

function mergeCache(current: CacheData, next: CacheData) {
  return {
    avatarUrl: current.avatarUrl ?? next.avatarUrl,
    fullName: current.fullName ?? next.fullName,
    userId: current.userId ?? next.userId,
  };
}

function setOrRemove(key: string, value: string | null) {
  if (value) localStorage.setItem(key, value);
  else localStorage.removeItem(key);
}

function storeUserId(userId: string | null) {
  setOrRemove("ks_user_id", userId ? String(userId) : null);
  setOrRemove("providerId", userId ? String(userId) : null);
}

function storeCache(data: CacheData) {
  storeUserId(data.userId);
  setOrRemove("ks_avatar_url", data.avatarUrl);
  setOrRemove("ks_full_name", data.fullName);
}

export async function seedAvatarCacheFromLogin(loginData: any) {
  try {
    let cache = cacheFromUser(loginData?.user);
    if (needsProfile(cache)) cache = await fetchProfileCache(cache);
    storeCache(cache);
  } catch {}
}
