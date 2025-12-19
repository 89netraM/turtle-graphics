import { resolve } from "$app/paths";
import { env } from "$env/dynamic/private";
import { redirect } from "@sveltejs/kit";

export function load({ cookies, route }) {
  const password = cookies.get("password");
  const isSignedIn = password === env.PASSWORD;

  if (route.id !== "/admin" && !isSignedIn) {
    console.log("Redirect!");
    redirect(307, resolve("/admin"));
  }

  return {
    isSignedIn,
  };
}
