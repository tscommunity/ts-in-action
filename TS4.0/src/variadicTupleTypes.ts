/**
 *
 *
 * @template T
 * @param {readonly [...T]} arr
 * @param {*} T
 */
function tail<T extends any[]>(arr: readonly [...T]) {
  const [, ...rest] = arr;
  return rest;
}

const myTuple = [1, 2, 3, 4];
const myArray = ["hello", "world"];

const t1 = tail(myTuple);
//    ^ = const t1: [2, 3, 4]

const t2 = tail([...myTuple, ...myArray]);
//    ^ = const t2: [2, 3, 4, "hell", "world"]
console.log(t1, t2);

//#region

type ReadonlyArr = readonly any[];

function concat<T extends ReadonlyArr, U extends ReadonlyArr>(
  arr1: T,
  arr2: U
) {
  return [...arr1, ...arr2];
}

const c1 = concat(myTuple, myArray);
console.log(c1);

//============================================================
/* -=* Spread in unknown length type *=- */
const spreadInUnknownLengthType = () => {
  type Strings = [string, string];
  type Numbers = number[]; // length is unknown,
  type Unbounded = [...Strings, ...Numbers, boolean, null];

  let unbounded: Unbounded = ["str1", "str2", 1, true];

  unbounded = [
    "str1",
    "str2",
    ...[1, 2, 3, true, false, 4, true, 5, false, 6, true],
  ];

  console.log(unbounded);
};

spreadInUnknownLengthType();
//============================================================
/* -=* Partial call *=- */
(() => {
  type Arr = readonly unknown[];

  function partialCall<T extends Arr, U extends Arr, R>(
    f: (...args: [...T, ...U]) => R,
    ...headArgs: T
  ) {
    return (...tailArgs: U) => f(...headArgs, ...tailArgs);
  }

  const f = (x: string, y: number, z: boolean) => {};

  const f1 = partialCall(f, "hello"); // OK
  //    ^ => (y:number, z:boolean) => void

  f1(100, true);

  const f2 = partialCall(f, "hello", 100);
  //    ^ => (z:boolean) => void
  f2(true);

  const f3 = partialCall(f, "hello", 100, true);
  //    ^ => () => void
  f3();
})();
