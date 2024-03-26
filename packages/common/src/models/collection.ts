import { OneOrMore } from "../types";
import { isDefined } from "../utils";

export type CollectionAddOptions = { index?: number };

type ReduceCallback<T, InternalType> = (
  accumulator: T,
  currentValue: InternalType,
  currentIndex: number,
  array: InternalType[]
) => T;

/**
 * Collection abstract model
 *
 * @example
 * Define a new collection class with internal type `number` and external type `string`
 * ```
 * class TestCollection extends Collection<number, string> {
 *   protected map(item: string | number): number {
 *     return Number(item);
 *   }
 *   // Some other methods
 * }
 * ```
 */
export abstract class Collection<InternalType, ExternalType> implements Iterable<InternalType> {
  protected readonly items: InternalType[];

  constructor() {
    this.items = [];
  }

  [Symbol.iterator](): Iterator<InternalType> {
    let counter = 0;

    return {
      next: () => ({ done: counter >= this.length, value: this.items[counter++] })
    };
  }

  /**
   * Number of items in the collection
   */
  get length(): number {
    return this.items.length;
  }

  /**
   * True if the collection is empty
   */
  get isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Get item at index
   * @param index
   * @throws RangeError if index is out of bounds
   */
  at(index: number): InternalType {
    if (this.isOutOfBounds(index)) {
      throw new RangeError(`Index '${index}' is out of range.`);
    }

    return this.items[index];
  }

  /**
   * Add item to the collection
   * @param items
   * @param options
   * @returns The new length of the collection
   */
  add(items: OneOrMore<ExternalType>, options?: CollectionAddOptions): number {
    return this.addOneOrMore(items, options);
  }

  /**
   * Checks if the given index is out of bounds.
   * @param index - The index to check.
   * @returns True if the index is out of bounds, false otherwise.
   */
  protected isOutOfBounds(index: number) {
    return index < 0 || index >= this.items.length;
  }

  abstract remove(item: unknown): number;

  /**
   * Map external type to internal type
   * @param item
   * @protected
   */
  protected abstract map(item: ExternalType | InternalType): InternalType;

  protected addOne(item: InternalType | ExternalType, options?: CollectionAddOptions): number {
    if (isDefined(options) && isDefined(options.index)) {
      if (options.index === this.length) {
        this.items.push(this.map(item));

        return this.length;
      }

      if (this.isOutOfBounds(options.index)) {
        throw new RangeError(`Index '${options.index}' is out of range.`);
      }

      this.items.splice(options.index, 0, this.map(item));

      return this.length;
    }

    this.items.push(this.map(item));

    return this.items.length;
  }

  protected addOneOrMore(items: OneOrMore<ExternalType>, options?: CollectionAddOptions): number {
    if (Array.isArray(items)) {
      if (isDefined(options) && isDefined(options.index)) {
        items = items.reverse();
      }

      items.forEach((item) => this.addOne(item, options));
    } else {
      this.addOne(items, options);
    }

    return this.length;
  }

  /**
   * Get the collection as an array
   */
  toArray(): InternalType[] {
    return [...this.items];
  }

  reduce<T>(callbackFn: ReduceCallback<T, InternalType>, initialValue: T): T {
    return this.items.reduce(callbackFn, initialValue);
  }
}
