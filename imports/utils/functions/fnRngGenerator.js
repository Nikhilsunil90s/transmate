function* range(start, end) {
  for (let i = start; i <= end; i += 1) {
    yield i;
  }
}
export { range };

export const arrRange = end => [...Array(end).keys()];
