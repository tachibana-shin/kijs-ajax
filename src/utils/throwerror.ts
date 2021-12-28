export default function throwerror(err: any) {
  setTimeout(() => {
    throw err;
  });
}
