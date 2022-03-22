/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let counter = 0;
  let result = "";

  for (const char of string) {
    counter += char === result[result.length - 1] ? 1 : -counter;
    if (counter > size - 1) {
      continue;
    }

    result += char;
  }

  return result;
}
