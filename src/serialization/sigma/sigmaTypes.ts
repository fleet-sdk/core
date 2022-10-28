import { SigmaTypeCode } from "./sigmaTypeCode";

export interface ISigmaType {
  readonly type: SigmaTypeCode;
}

export interface IPrimitiveSigmaType<T> extends ISigmaType {
  value: T;
}

export interface ISigmaCollection<T> extends ISigmaType {
  value: ArrayLike<T>;
  elementsType: SigmaTypeCode;
}

export function SByte(value: number): IPrimitiveSigmaType<number>;
export function SByte(): SigmaTypeCode;
export function SByte(value?: number): IPrimitiveSigmaType<number> | SigmaTypeCode {
  return _createPrimitiveType(SigmaTypeCode.Byte, value);
}

export function SBool(value: boolean): IPrimitiveSigmaType<boolean>;
export function SBool(): SigmaTypeCode;
export function SBool(value?: boolean): IPrimitiveSigmaType<boolean> | SigmaTypeCode {
  return _createPrimitiveType(SigmaTypeCode.Boolean, value);
}

export function SShort(value: number): IPrimitiveSigmaType<number>;
export function SShort(): SigmaTypeCode;
export function SShort(value?: number): IPrimitiveSigmaType<number> | SigmaTypeCode {
  return _createPrimitiveType(SigmaTypeCode.Short, value);
}

export function SInt(value: number): IPrimitiveSigmaType<number>;
export function SInt(): SigmaTypeCode;
export function SInt(value?: number): IPrimitiveSigmaType<number> | SigmaTypeCode {
  return _createPrimitiveType(SigmaTypeCode.Int, value);
}

export function SLong(value: number): IPrimitiveSigmaType<number>;
export function SLong(): SigmaTypeCode;
export function SLong(value?: number): IPrimitiveSigmaType<number> | SigmaTypeCode {
  return _createPrimitiveType(SigmaTypeCode.Long, value);
}

export function SUnit(): IPrimitiveSigmaType<null>;
export function SUnit(): SigmaTypeCode;
export function SUnit(): IPrimitiveSigmaType<null> | SigmaTypeCode {
  return _createPrimitiveType(SigmaTypeCode.Unit, null);
}

function _createPrimitiveType<T>(
  type: SigmaTypeCode,
  value?: T
): IPrimitiveSigmaType<T> | SigmaTypeCode {
  if (value !== undefined) {
    return { type, value };
  } else {
    return type;
  }
}

export function SColl<T>(type: () => SigmaTypeCode, elements: ArrayLike<T>): ISigmaCollection<T> {
  return {
    type: SigmaTypeCode.Coll,
    elementsType: type(),
    value: elements
  };
}