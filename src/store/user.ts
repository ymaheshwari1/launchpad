import { api, commonUtil, translate, useAuth } from "@common";
import { Settings } from "luxon";
import { defineStore } from "pinia"
import 'pinia-plugin-persistedstate';
import User from "@/types/User";
import { showToast } from "@/util";

interface UserState {
  current: User;
  redirectUrl: string;
  permissions: any[];
  oms: string;
}

const checkPermission = (permissions: any[], permissionId: string): boolean => {
  if(!permissionId) {
    return true;
  }

  // Handle OR/AND logic in permission string
  if(permissionId.includes(" OR ")) {
    const parts = permissionId.split(" OR ");

    return parts.some((part: string) => checkPermission(permissions, part.trim()));
  }

  if(permissionId.includes(" AND ")) {
    const parts = permissionId.split(" AND ");

    return parts.every((part: string) => checkPermission(permissions, part.trim()));
  }

  return permissions.includes(permissionId);
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    current: {} as User,
    redirectUrl: "",
    permissions: [],
    oms: ""
  }),
  getters: {
    getRedirectUrl: (state) => state.redirectUrl,
    getPermissions: (state) => state.permissions,
    hasPermission: (state) => (permissionId: string): boolean => {
      return checkPermission(state.permissions, permissionId);
    }
  },
  actions: {
    // Set the url in store to which the user needs to be redirect after login success
    // TODO: remove redirectUrl support once all the apps are migrated to the new framework
    setRedirectUrl(redirectUrl: string): void {
      this.redirectUrl = redirectUrl
    },
    async fetchPermissions(): Promise<void> {
      const serverPermissions = [] as any;
      const viewSize = 200;
      let viewIndex = 0;

      try {
        let resp;
        do {
          resp = await api({
            url: "getPermissions",
            method: "POST",
            baseURL: commonUtil.getOmsURL(),
            data: { viewIndex, viewSize }
          }) as any

          if(resp?.data?.docs?.length && !commonUtil.hasError(resp)) {
            serverPermissions.push(...resp.data.docs.map((permission: any) => permission.permissionId));
            viewIndex++;
          } else {
            resp = null;
          }
        } while(resp && resp.data.docs?.length === viewSize);

        // Update the state with the fetched permissions
        this.permissions = serverPermissions;
      } catch (error: any) {
        return Promise.reject(error);
      }
    },
    async fetchUserProfile(): Promise<void> {
      try {
        const userProfileResp = await api({
          url: "admin/user/profile",
          method: "get",
          baseURL: commonUtil.getMaargURL()
        }) as any;

        this.current = userProfileResp.data
        useAuth().updateUserId(this.current.userId)

        if(this.current.timeZone) {
          Settings.defaultZone = this.current.timeZone;
        }
      } catch (error: any) {
        showToast(translate("Failed to fetch user profile information"));
        console.error("error", error);
        useAuth().clearAuth();

        return Promise.reject(new Error(error));
      }
    },
    setCurrent(current: any): void {
      this.current = current
    },
    async postLogin(): Promise<void> {
      await this.fetchUserProfile()
      await this.fetchPermissions()
    },
    async postLogout(): Promise<void> {
      this.$reset();
    }
  },
  // @ts-ignore - pinia-plugin-persistedstate types sometimes break DefineStoreOptions inference
  persist: true
})
