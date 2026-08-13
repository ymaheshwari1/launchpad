import { createRouter, createWebHistory } from "@ionic/vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import { cookieHelper, useAuth } from "@common";
import { useUserStore } from "@/store/user";

const authGuard = async (to: any, from: any, next: any) => {
  if(cookieHelper().get("oms") && cookieHelper().get("token") && cookieHelper().get("userId") && cookieHelper().get("expirationTime")) {
    useUserStore().oms = cookieHelper().get("oms") as string
    await useAuth().login(undefined, undefined, cookieHelper().get("token") as string, cookieHelper().get("expirationTime") as string)
  }
  next();
};

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
    beforeEnter: authGuard
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
