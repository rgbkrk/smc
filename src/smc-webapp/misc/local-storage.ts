/*
 * Typed wrapper around LocalStorage
 */

const { APP_BASE_URL } = require("../misc_page");

// tests at startup if localStorage exists and works. if not or disabled, uses memory as a fallback.

const LS: { [k: string]: string | undefined } = (function() {
  let it_works = false;
  try {
    const test_key = "cocalc_test";
    window.localStorage[test_key] = "foo";
    it_works = localStorage[test_key] == "foo";
    delete localStorage[test_key];
  } catch (e) {
    console.warn(`Local Storage init issue ${e} -- using memory fallback`);
  }
  if (it_works) {
    return window.localStorage;
  } else {
    return (window["cocalc_LS_memory"] = {});
  }
})();

function make_key(keys: string[] | string): string {
  const key = typeof keys == "string" ? keys : keys.join(".");
  return [APP_BASE_URL, key].join("::");
}

// returns the deleted value or undefined in case of a problem
export function del<T>(keys: string[] | string): T | undefined {
  const key = make_key(keys);
  try {
    const val = get<T>(keys);
    delete LS[key];
    return val;
  } catch (e) {
    console.warn(`localStorage delete("${key}"): ${e}`);
  }
}

// set an entry, and return true if it was successful
export function set<T>(keys: string[] | string, value: T): boolean {
  const key = make_key(keys);
  try {
    LS[key] = JSON.stringify(value);
    return true;
  } catch (e) {
    console.warn(`localStorage set("${key}"): ${e}`);
    return false;
  }
}

export function get<T>(keys: string[] | string): T | undefined {
  const key = make_key(keys);
  try {
    const val = LS[key];
    if (val != null) {
      return JSON.parse(val);
    } else {
      return undefined;
    }
  } catch (e) {
    console.warn(`localStorage get("${key}"): ${e}`);
    del<T>(key);
  }
}

export function exists(keys: string[] | string): boolean {
  const key = make_key(keys);
  // distinction between browser's localStorage and the fallback object
  if (LS === window.localStorage) {
    // test against null, see spec: https://www.w3.org/TR/webstorage/#dom-storage-getitem
    return window.localStorage.getItem(key) !== null;
  } else {
    return LS[key] !== undefined;
  }
}
