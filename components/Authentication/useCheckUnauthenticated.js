import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useCallback } from "react";

export const useCheckUnauthenticated = () => {
 const router = useRouter();
 
 const redirectLoginPage = useCallback(() => {
   Cookies.remove("japAccessToken");
   router.push("/authentication/sign-in");
 }, [router]);

 return {
   redirectLoginPage,
 };
}