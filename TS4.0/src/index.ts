class Square {
  /**
   * Length of the square。
   */
  #sideLength: number;

  /**
   * Creates an instance of Square.
   * @param {number} sideLength
   * @memberof Square
   */
  constructor(sideLength: number) {
      this.#sideLength = sideLength;
  }

  equals(other: any) {
      return this.#sideLength === other.sideLength;
  }
}

const a = new Square(100);
const b = { sideLength: 100 };

console.log(a.equals(b));