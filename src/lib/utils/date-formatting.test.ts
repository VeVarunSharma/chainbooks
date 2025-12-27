import {
  formatDateString,
  formatDateForCoinGecko,
  formatDisplayDate,
  formatDisplayDateTime,
  startOfDay,
  isSameDay,
} from "./date-formatting";

describe("date-formatting", () => {
  describe("formatDateString", () => {
    it("should format date to YYYY-MM-DD", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      expect(formatDateString(date)).toBe("2024-01-15");
    });

    it("should handle single digit months and days", () => {
      const date = new Date("2024-03-05T10:30:00Z");
      expect(formatDateString(date)).toBe("2024-03-05");
    });
  });

  describe("formatDateForCoinGecko", () => {
    it("should format date to DD-MM-YYYY for CoinGecko", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      expect(formatDateForCoinGecko(date)).toBe("15-01-2024");
    });
  });

  describe("formatDisplayDate", () => {
    it("should format date for display", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const result = formatDisplayDate(date);
      expect(result).toContain("Jan");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });

    it("should handle string input", () => {
      const result = formatDisplayDate("2024-01-15T10:30:00Z");
      expect(result).toContain("Jan");
    });
  });

  describe("formatDisplayDateTime", () => {
    it("should format date with time for display", () => {
      const date = new Date("2024-01-15T15:45:00Z");
      const result = formatDisplayDateTime(date);
      expect(result).toContain("Jan");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });
  });

  describe("startOfDay", () => {
    it("should return start of day", () => {
      const date = new Date("2024-01-15T15:45:30.123Z");
      const result = startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe("isSameDay", () => {
    it("should return true for same day", () => {
      const date1 = new Date("2024-01-15T10:00:00Z");
      const date2 = new Date("2024-01-15T20:00:00Z");
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it("should return false for different days", () => {
      const date1 = new Date("2024-01-15T10:00:00Z");
      const date2 = new Date("2024-01-16T10:00:00Z");
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });
});
