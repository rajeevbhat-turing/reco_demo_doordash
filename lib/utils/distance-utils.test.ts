import { calculateDistance } from './distance-utils';

describe('distance-utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Test case: Distance between New York (40.7128, -74.0060) and Los Angeles (34.0522, -118.2437)
      // Expected distance is approximately 2445 miles
      const nyLat = 40.7128;
      const nyLng = -74.006;
      const laLat = 34.0522;
      const laLng = -118.2437;

      const distance = calculateDistance(nyLat, nyLng, laLat, laLng);

      // Round to nearest integer and allow ±1 mile for floating point precision
      const roundedDistance = Math.round(distance);
      expect(roundedDistance).toBeGreaterThanOrEqual(2444);
      expect(roundedDistance).toBeLessThanOrEqual(2446);
    });

    it('should return 0 for same coordinates', () => {
      const lat = 40.7128;
      const lng = -74.006;

      const distance = calculateDistance(lat, lng, lat, lng);

      expect(distance).toBe(0);
    });

    it('should calculate short distances correctly', () => {
      // Test case: Distance between two nearby points
      // 1 degree latitude ≈ 69 miles, so 0.0145 degrees ≈ 1 mile
      const lat1 = 40.7128;
      const lng1 = -74.006;
      const lat2 = 40.7273; // ~1 mile north (0.0145 degrees)
      const lng2 = -74.006;

      const distance = calculateDistance(lat1, lng1, lat2, lng2);

      // Should be approximately 1 mile (allowing for slight variation)
      expect(distance).toBeGreaterThan(0.9);
      expect(distance).toBeLessThan(1.1);
    });

    it('should handle negative coordinates', () => {
      // Test case: Southern hemisphere coordinates
      const lat1 = -33.8688; // Sydney
      const lng1 = 151.2093;
      const lat2 = -37.8136; // Melbourne
      const lng2 = 144.9631;

      const distance = calculateDistance(lat1, lng1, lat2, lng2);

      // Distance between Sydney and Melbourne is approximately 440 miles
      expect(distance).toBeGreaterThan(400);
      expect(distance).toBeLessThan(500);
    });

    it('should handle coordinates crossing the equator', () => {
      // Test case: One point in northern hemisphere, one in southern
      const lat1 = 40.7128; // New York
      const lng1 = -74.006;
      const lat2 = -22.9068; // Rio de Janeiro
      const lng2 = -43.1729;

      const distance = calculateDistance(lat1, lng1, lat2, lng2);

      // Distance should be significant
      expect(distance).toBeGreaterThan(4000);
      expect(distance).toBeLessThan(5000);
    });

    it('should handle coordinates crossing the prime meridian', () => {
      // Test case: One point with negative longitude, one with positive
      const lat1 = 51.5074; // London
      const lng1 = -0.1278;
      const lat2 = 48.8566; // Paris
      const lng2 = 2.3522;

      const distance = calculateDistance(lat1, lng1, lat2, lng2);

      // Distance between London and Paris is approximately 214 miles
      expect(distance).toBeGreaterThan(200);
      expect(distance).toBeLessThan(250);
    });

    it('should return positive distance regardless of point order', () => {
      const lat1 = 40.7128;
      const lng1 = -74.006;
      const lat2 = 34.0522;
      const lng2 = -118.2437;

      const distance1 = calculateDistance(lat1, lng1, lat2, lng2);
      const distance2 = calculateDistance(lat2, lng2, lat1, lng1);

      expect(distance1).toBe(distance2);
      expect(distance1).toBeGreaterThan(0);
    });
  });
});
