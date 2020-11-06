
# 可变元组类型（Variadic Tuple Types）

TypeScript 4.0 带来了两个重要的改变，与改进了的类型推导一起使得该特性变得可能。
TypeScript 4.0 brings two fundamental changes, along with inference improvements, to make typing these possible.


> 第一个改变是元组类型的展开语法现在可以是泛型类型。这意味着我们可以对元组和数组表达高阶的操作，即使我们在操作时不知道其类型。当泛型展开被实例化（或者，被一个真实的类型替代）在这些元组类型时，它们可以生成其它的数组或元组类型的集合。The first change is that spreads in tuple type syntax can now be generic. This means that we can represent higher-order operations on tuples and arrays even when we don't know the actual types we're operating over. When generic spreads are instantiated (or, replaced with a real type) in these tuple types, they can produce other sets of array or tuple types.

例如，那意味着我们可以写像 `tail` 这样的函数而没有 `死于过多重载` 的问题。
For example, that means we can type function like `tail`, without `"death by a thousand overloads"` issue.

```ts
function tail<T extends any[]>(arr: readonly [any, ...T]) {
  const [_ignored, ...rest] = arr;
  return rest;
}

const myTuple = [1, 2, 3, 4] as const;
const myArray = ["hello", "world"];

const r1 = tail(myTuple);
//    ^ = const r1: [2, 3, 4]

const r2 = tail([...myTuple, ...myArray] as const);
//    ^ = const r2: [2, 3, 4, ...string[]]
```

> 第二个改变是剩余元素可以出现在元组中的任何位置——而不是仅在末尾。The second change is that rest elements can occur anywhere in a tuple - not just at the end!

```ts
type Strings = [string, string];
type Numbers = [number, number];

type StringsNumbersBoolean = [...Strings, ...Numbers, boolean];
```
在早前版本中，TypeScript 会报告一个如下的错误：`元组类型的剩余元素必须在最后`
Previously, TypeScript would issue an error like the following:
`A rest element must be last in a tuple type`

但在 TypeScript 4.0，这个限制放宽了。
But in TypeScript 4.0, this restriction is relaxed.

注意，当在未知长度的类型（以下示例中的 `Numbers`）上展开时，结果类型（即以下的 `Unbounded`）也将变成无界的，且其后所有的元素（即以下的 `boolean` 和 `null`，它们跟随在 `Numbers` 之后）都将纳入所得的剩余元素类型中（`Unbounded` 实际为 `[string, string, ...(number | boolean | null)[]]`，`boolean` 和 `null` 被纳入了 `...(number | boolean | null)[]` 这个（匿名的）剩余元素中）。
Note that in cases when we spread in a type without a known length, the resulting type becomes unbounded as well, and all the following elements factor into the resulting rest element type.

```ts
type Strings = [string, string];
type Numbers = number[];

type Unbounded = [...Strings, ...Numbers, boolean, null];
//                            |------------------------> ...(number | boolean | null)[] 

// Unbounded = [string, string, ...(number | boolean | null)[]], the following 'boolean' and 'null' are factored into the (anonymous) resulting rest element type;
```

通过将这些行为结合起来，我们能够为 `concat` 编写一个单一的被良好类型化的方法签名：
By combining both of these behaviors together, we can write a single well-typed signature for `concat`:

```ts
type Arr = readonly any[]; // unbounded type.

function concat<T extends Arr, U extends Arr>(arr1:T, arr2:U): [...T, ...U] {
  // Rest spread on arr1 and arr2 is the generic rest spread.
  return [...arr1, ...arr2];
}
```

尽管那个签名仍有些冗长，但它只是一个签名，无须重复，它可以在所有数组和元组类型上提供可预测的行为。
While that one signature is still a bit lengthy, it’s just one signature that doesn’t have to be repeated, and it gives predictable behavior on all arrays and tuples.

这个功能本身很棒，但它在更复杂的场景中也很有用。例如，有一个函数它[应用部分实参](https://en.wikipedia.org/wiki/Partial_application)，称作 `部分调用`。`部分调用`接收一个函数——姑且称为 `f` 以及该 `f` 函数所需的一些初始参数。然后这个函数返回一个新的函数——它接收 `f` 函数所需的其它参数，并在接收到这些参数时调用 `f` 函数。
This functionality on its own is great, but it shines in more sophisticated scenarios too. For example, consider a function to [`partially apply arguments`](https://en.wikipedia.org/wiki/Partial_application) called partialCall. partialCall takes a function - let’s call it f - along with the initial few arguments that f expects. It then returns a new function that takes any other arguments that f still needs, and calls f when it receives them.

```ts
function partialCall(f, ...headArgs) {
  return (...tailArgs) => f(...headArgs, ...tailArgs);
}
```

TypeScript 4.0 改进了剩余参数和剩余元组元素类型推导的过程，使得我们能够这样编写代码并让其正常工作。
TypeScript 4.0 improves the inference process for rest parameters and rest tuple elements so that we can type this and have it "just work".

```ts
type Arr = readonly unknown[];

function partialCall<T extends Arr, U extends Arr, R>(f:(...args: [...T, ...U])=> R, ...headArgs: T) {
  return (...tailArgs)=> f(...headArgs, ...tailArgs);
}
```

在此场景中，`partialCall` 知道它最初可以使用和不能使用的参数，并返回可以正确接受和拒绝剩余内容的函数。
In this case, partialCall understands which parameters it can and can’t initially take, and returns functions that appropriately accept and reject anything left over.

```ts
const foo = (x:string, y:number, z:boolean) => {};

const f1 = partialCall(foo, 100);
// Argument of type 'number' is not assignable to parameter of type 'string'.

const f2 = partialCall(foo, "hello", 100, true, "oops");
// Expected 4 arguments, but got 5.

// This works!
const f3 = partialCall(foo, "hello");
//    ^ = const f3: (y:number, z:boolean) => void

// What can we do with f3 now?

// Works!
f3(100, true);

f3();
// Expected 2 arguments, but got 0.

f3(123, "hello");
// Argument of type 'string' is not assignable to argument of type 'boolean'.
```

# Labeled Tuple Elements

# Class Property Inference from constructors

# Short-Circuiting Assignment

# unknown on catch Clause Bindings

# Custom JSX Factories

# Speed improvements in `build`  mode with `--noEmitOnError`

# `--incremental` with `--noEmit`

# Editor improvements

# Convert to Optional Chaining

# `/** @deprecated */` Support

# Partial Semantic Mode at Startup

# Smarter Auto-Imports

# Our New Website!

# Breaking Changes

# `lib.d.ts` Changes

# Properties Overriding Accessors (and vice versa) is an Error

# Operands for deleting must be optional

# Usage of TypeScript's Node Factory is Deprecated