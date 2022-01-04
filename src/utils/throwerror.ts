// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function throwerror(err: any) {
  setTimeout(() => {
    // eslint-disable-next-line functional/no-throw-statement
    throw err;
  });
}
