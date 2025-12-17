import { env } from "$env/dynamic/private";
import { fail } from "@sveltejs/kit";

export const actions = {
  async default({ cookies, request }) {
    console.log("Admin page post (?) request");
    const data = await request.formData();
    const password = data.get("password");
    if (password === env.PASSWORD) {
      cookies.set("password", password, { path: "/" });
    } else {
      return fail(401, {
        error: "Wrong password",
      });
    }
  },
};
