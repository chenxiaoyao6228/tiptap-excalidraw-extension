export function getTotalVersion(elems: readonly { version: number }[]): number {
  return elems.reduce((acc, curr) => {
    return curr.version + acc;
  }, 0);
}

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
