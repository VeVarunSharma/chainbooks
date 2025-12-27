import {
  isValidEthAddress,
  isValidTxHash,
  normalizeAddress,
  truncateAddress,
  truncateTxHash,
  getEtherscanTxUrl,
  getEtherscanAddressUrl,
} from "./address-validation";

describe("address-validation", () => {
  describe("isValidEthAddress", () => {
    it("should return true for valid addresses", () => {
      expect(
        isValidEthAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f6A321")
      ).toBe(true);
      expect(
        isValidEthAddress("0x0000000000000000000000000000000000000000")
      ).toBe(true);
      expect(
        isValidEthAddress("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
      ).toBe(true);
    });

    it("should return false for invalid addresses", () => {
      expect(isValidEthAddress("")).toBe(false);
      expect(isValidEthAddress("0x")).toBe(false);
      expect(isValidEthAddress("0x123")).toBe(false);
      expect(
        isValidEthAddress("742d35Cc6634C0532925a3b844Bc9e7595f6A321")
      ).toBe(false);
      expect(
        isValidEthAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f6A321Z")
      ).toBe(false);
      expect(isValidEthAddress(null as unknown as string)).toBe(false);
      expect(isValidEthAddress(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isValidTxHash", () => {
    it("should return true for valid transaction hashes", () => {
      expect(
        isValidTxHash(
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        )
      ).toBe(true);
    });

    it("should return false for invalid transaction hashes", () => {
      expect(isValidTxHash("")).toBe(false);
      expect(isValidTxHash("0x123")).toBe(false);
      expect(isValidTxHash("0x742d35Cc6634C0532925a3b844Bc9e7595f6A321")).toBe(
        false
      );
    });
  });

  describe("normalizeAddress", () => {
    it("should normalize valid addresses to lowercase", () => {
      expect(
        normalizeAddress("0x742D35CC6634C0532925A3B844BC9E7595F6A321")
      ).toBe("0x742d35cc6634c0532925a3b844bc9e7595f6a321");
    });

    it("should return empty string for invalid addresses", () => {
      expect(normalizeAddress("invalid")).toBe("");
      expect(normalizeAddress("")).toBe("");
    });
  });

  describe("truncateAddress", () => {
    it("should truncate valid addresses", () => {
      expect(
        truncateAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f6A321")
      ).toBe("0x742d...A321");
    });

    it("should return original for invalid addresses", () => {
      expect(truncateAddress("invalid")).toBe("invalid");
    });
  });

  describe("truncateTxHash", () => {
    it("should truncate valid transaction hashes", () => {
      const hash =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      expect(truncateTxHash(hash)).toBe("0x12345678...abcdef");
    });

    it("should return original for invalid hashes", () => {
      expect(truncateTxHash("invalid")).toBe("invalid");
    });
  });

  describe("getEtherscanTxUrl", () => {
    it("should return mainnet URL by default", () => {
      const hash =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      expect(getEtherscanTxUrl(hash)).toBe(`https://etherscan.io/tx/${hash}`);
    });

    it("should return testnet URL when specified", () => {
      const hash =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      expect(getEtherscanTxUrl(hash, "goerli")).toBe(
        `https://goerli.etherscan.io/tx/${hash}`
      );
    });
  });

  describe("getEtherscanAddressUrl", () => {
    it("should return correct address URL", () => {
      const address = "0x742d35Cc6634C0532925a3b844Bc9e7595f6A321";
      expect(getEtherscanAddressUrl(address)).toBe(
        `https://etherscan.io/address/${address}`
      );
    });
  });
});
