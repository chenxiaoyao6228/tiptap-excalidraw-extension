export function getTotalVersion(elems: readonly { version: number }[]): number {
  return elems.reduce((acc, curr) => {
    return curr.version + acc;
  }, 0);
}
