import { describe, expect, it, test } from "vitest";
import { keyAddressesTestVectors } from "./_test-vectors/keyVectors";
import { generateMnemonic, validateMnemonic } from "./mnemonic";

describe("Mnemonic generation", () => {
  it("Should create a valid 12 word mnemonic", () => {
    const mnemonic = generateMnemonic(128);
    expect(mnemonic.split(" ")).to.have.length(12);
    expect(validateMnemonic(mnemonic)).to.be.true;
  });

  it("Should create a valid 15 word mnemonic by default", () => {
    const mnemonic = generateMnemonic();
    expect(mnemonic.split(" ")).to.have.length(15);
    expect(validateMnemonic(mnemonic)).to.be.true;
  });

  it("Should create a valid 24 word mnemonic", () => {
    const mnemonic = generateMnemonic(256);
    expect(mnemonic.split(" ")).to.have.length(24);
    expect(validateMnemonic(mnemonic)).to.be.true;
  });
});

describe("Mnemonic validation", () => {
  const invalidMnemonics = [
    "",
    "brown reason sponsor fix defense pair kit private front next drip fire clip student",
    "brown acid reason sponsor fix defense pair kit private front next drip clip fire student",
    // 'guilt' and 'plunge' words are shifted to invalidate the checksum
    "phone copper zebra enhance curious twelve orbit clay guilt plunge prevent file pizza gadget puzzle"
  ];

  test.each(keyAddressesTestVectors)("Should pass for valid mnemonics", ({ mnemonic }) => {
    expect(validateMnemonic(mnemonic)).to.be.true;
  });

  test.each(invalidMnemonics)("Should not pass for invalid mnemonics", (mnemonic) => {
    expect(validateMnemonic(mnemonic)).to.be.false;
  });
});
