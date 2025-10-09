import { browser } from "$app/environment";
import { writable, type Writable } from "svelte/store";

const keyPrefix = "challengeJavascript";

export function getChallengeJavascriptStore(challengeId: string): Writable<string> {
  const key = `${keyPrefix}-${challengeId}`;

  const challengeJavascript = writable(browser ? (localStorage.getItem(key) ?? "") : "");

  challengeJavascript.subscribe((value) => {
    if (browser) {
      localStorage.setItem(key, value);
    }
  });

  return challengeJavascript;
}
