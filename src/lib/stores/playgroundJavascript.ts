import { browser } from "$app/environment";
import { writable } from "svelte/store";

const key = "playgroundJavascript";

const defaultValue = `rotate(Math.PI / 4);
penDown("#09cdda");
forward(50);
penUp();
`;

export const playgroundJavascript = writable(browser ? (localStorage.getItem(key) ?? defaultValue) : defaultValue);

playgroundJavascript.subscribe((value) => {
  if (browser) {
    localStorage.setItem(key, value);
  }
});
