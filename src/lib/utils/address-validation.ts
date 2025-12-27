/**
 * Valid Ethereum address regex pattern
 * Must be 0x followed by exactly 40 hexadecimal characters
 */
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Valid transaction hash regex pattern
 * Must be 0x followed by exactly 64 hexadecimal characters
 */
const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

/**
 * Validates if a string is a valid Ethereum address
 * @param address - The address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEthAddress(address: string): boolean {
  if (!address || typeof address !== "string") {
    return false;
  }
  return ETH_ADDRESS_REGEX.test(address);
}

/**
 * Validates if a string is a valid transaction hash
 * @param hash - The transaction hash to validate
 * @returns true if valid, false otherwise
 */
export function isValidTxHash(hash: string): boolean {
  if (!hash || typeof hash !== "string") {
    return false;
  }
  return TX_HASH_REGEX.test(hash);
}

/**
 * Normalizes an Ethereum address to lowercase
 * @param address - The address to normalize
 * @returns Lowercase address or empty string if invalid
 */
export function normalizeAddress(address: string): string {
  if (!isValidEthAddress(address)) {
    return "";
  }
  return address.toLowerCase();
}

/**
 * Truncates an Ethereum address for display
 * @param address - The full address
 * @param startChars - Number of characters to show at start (default 6)
 * @param endChars - Number of characters to show at end (default 4)
 * @returns Truncated address like "0x1234...abcd"
 */
export function truncateAddress(
  address: string,
  startChars = 6,
  endChars = 4
): string {
  if (!isValidEthAddress(address)) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Truncates a transaction hash for display
 * @param hash - The full transaction hash
 * @param startChars - Number of characters to show at start (default 10)
 * @param endChars - Number of characters to show at end (default 6)
 * @returns Truncated hash like "0x12345678...abcdef"
 */
export function truncateTxHash(
  hash: string,
  startChars = 10,
  endChars = 6
): string {
  if (!isValidTxHash(hash)) {
    return hash;
  }
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

/**
 * Returns the Etherscan URL for a transaction
 * @param hash - Transaction hash
 * @param network - Network name (default: mainnet)
 * @returns Full Etherscan URL
 */
export function getEtherscanTxUrl(hash: string, network = "mainnet"): string {
  const baseUrl =
    network === "mainnet"
      ? "https://etherscan.io"
      : `https://${network}.etherscan.io`;
  return `${baseUrl}/tx/${hash}`;
}

/**
 * Returns the Etherscan URL for an address
 * @param address - Ethereum address
 * @param network - Network name (default: mainnet)
 * @returns Full Etherscan URL
 */
export function getEtherscanAddressUrl(
  address: string,
  network = "mainnet"
): string {
  const baseUrl =
    network === "mainnet"
      ? "https://etherscan.io"
      : `https://${network}.etherscan.io`;
  return `${baseUrl}/address/${address}`;
}
