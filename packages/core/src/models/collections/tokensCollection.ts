import {
  Amount,
  Collection,
  CollectionAddOptions,
  ensureBigInt,
  FleetError,
  isDefined,
  isUndefined,
  NewToken,
  OneOrMore,
  TokenAmount,
  TokenId
} from "@fleet-sdk/common";
import {
  InsufficientTokenAmount,
  MaxTokensOverflow,
  NotFoundError,
  UndefinedMintingContext
} from "../../errors";

export const MAX_TOKENS_PER_BOX = 120;

export type TokenAddOptions = CollectionAddOptions & { sum?: boolean };
export type OutputToken<T extends Amount = Amount> = { tokenId?: TokenId; amount: T };

type MintingData = { index: number; metadata: NewToken<Amount> };

export class TokensCollection extends Collection<OutputToken<bigint>, OutputToken> {
  #minting: MintingData | undefined;

  constructor();
  constructor(token: TokenAmount<Amount>);
  constructor(tokens: TokenAmount<Amount>[]);
  constructor(tokens: TokenAmount<Amount>[], options: TokenAddOptions);
  constructor(tokens?: OneOrMore<TokenAmount<Amount>>, options?: TokenAddOptions) {
    super();

    if (isDefined(tokens)) {
      this.add(tokens, options);
    }
  }

  get minting(): NewToken<bigint> | undefined {
    if (!this.#minting) return;
    return { ...this.#minting.metadata, amount: this.at(this.#minting.index).amount };
  }

  protected override map(token: OutputToken): OutputToken<bigint> {
    return { tokenId: token.tokenId, amount: ensureBigInt(token.amount) };
  }

  protected override addOne(token: OutputToken, options?: TokenAddOptions): number {
    if (isUndefined(options) || (options.sum && isUndefined(options.index))) {
      if (this._sum(this.map(token))) return this.length;
    }

    if (this.length >= MAX_TOKENS_PER_BOX) throw new MaxTokensOverflow();
    super.addOne(token, options);

    return this.length;
  }

  override add(items: OneOrMore<TokenAmount<Amount>>, options?: TokenAddOptions): number {
    if (Array.isArray(items)) {
      if (items.some((x) => !x.tokenId)) throw new FleetError("TokenID is required.");
    } else if (!items.tokenId) {
      throw new FleetError("TokenID is required.");
    }

    return super.add(items, options);
  }

  mint(token: NewToken<Amount>): number {
    if (isDefined(this.#minting)) {
      throw new FleetError("Only one minting token is allowed per transaction.");
    } else {
      const len = super.add({ tokenId: token.tokenId, amount: token.amount });
      this.#minting = { index: len - 1, metadata: token };
    }

    return this.length;
  }

  private _sum(token: OutputToken<bigint>): boolean {
    for (const t of this.items) {
      if (t.tokenId === token.tokenId) {
        t.amount += token.amount;
        return true;
      }
    }

    return false;
  }

  remove(tokenId: TokenId, amount?: Amount): number;
  remove(index: number, amount?: Amount): number;
  remove(tokenIdOrIndex: TokenId | number, amount?: Amount): number {
    let index = -1;
    if (typeof tokenIdOrIndex === "number") {
      if (this.isOutOfBounds(tokenIdOrIndex)) {
        throw new RangeError(`Index '${tokenIdOrIndex}' is out of range.`);
      }

      index = tokenIdOrIndex;
    } else {
      index = this.items.findIndex((token) => token.tokenId === tokenIdOrIndex);

      if (this.isOutOfBounds(index)) {
        throw new NotFoundError(`TokenId '${tokenIdOrIndex}' not found in assets collection.`);
      }
    }

    if (amount && index > -1) {
      const value = ensureBigInt(amount);
      const token = this.items[index];

      if (value > token.amount) {
        throw new InsufficientTokenAmount(
          `Insufficient token amount to perform a subtraction operation.`
        );
      } else if (value < token.amount) {
        token.amount -= value;
        return this.length;
      }
    }

    this.items.splice(index, 1);

    return this.length;
  }

  contains(tokenId: string): boolean {
    return this.items.some((x) => x.tokenId === tokenId);
  }

  toArray(): TokenAmount<bigint>[];
  toArray(mintingTokenId: string): TokenAmount<bigint>[];
  toArray(mintingTokenId?: string): TokenAmount<bigint>[];
  toArray(mintingTokenId?: string): OutputToken[] {
    if (this.minting) {
      if (!mintingTokenId) throw new UndefinedMintingContext();

      return this.items.map((x) => ({
        tokenId: x.tokenId ? x.tokenId : mintingTokenId,
        amount: x.amount
      }));
    } else {
      return super.toArray();
    }
  }
}
