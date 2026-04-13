import { authApi } from '@/api/auth';
import type { User } from '@/types/models';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { clearAuthToken, saveAuthToken } from '@/utils/storage';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useLogout() {
  const logoutStore = useAuthStore((s) => s.logout);
  const setGuest = useAppStore((s) => s.setAllowGuestBrowse);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch {
        /* still clear local */
      }
      await clearAuthToken();
      setGuest(false);
      logoutStore();
      qc.clear();
    },
  });
}

export async function persistSession(token: string, user: User) {
  await saveAuthToken(token);
  useAppStore.getState().setAllowGuestBrowse(false);
  useAuthStore.getState().login(user);
}
