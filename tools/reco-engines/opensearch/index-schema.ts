export const INDEX_NAME = 'restaurants';

export const INDEX_MAPPING = {
  mappings: {
    properties: {
      id: { type: 'integer' },
      name: { type: 'keyword' },
      cuisine: { type: 'keyword' },
      city: { type: 'keyword' },
      state: { type: 'keyword' },
      zip_code: { type: 'keyword' },
      price_range: { type: 'integer' },
      featured: { type: 'boolean' },
      avg_rating: { type: 'float' },
      location: { type: 'geo_point' },
    },
  },
} as const;
