// Configuration for UI elements

export interface UIConfig {
  appName: string;
  defaultLocation: string;
  defaultSearchPlaceholder: string;
  dashPassBadgeText: string;
  snapBadgeText: string;
  emptyCartMessage: {
    title: string;
    description: string;
  };
  noResultsMessage: {
    title: string;
    description: string;
    buttonText: string;
  };
  dashPassBannerText: string;
  shopListModalText: {
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
    exampleText: string;
  };
}

export const uiConfig: UIConfig = {
  appName: 'DoorDash',
  defaultLocation: '548 Market St',
  defaultSearchPlaceholder: 'Search',
  dashPassBadgeText: 'DashPass',
  snapBadgeText: 'SNAP',
  emptyCartMessage: {
    title: 'Your cart is empty',
    description: 'Add items to get started',
  },
  noResultsMessage: {
    title: 'No results found',
    description: "Try adjusting your search or filter to find what you're looking for.",
    buttonText: 'Clear filters',
  },
  dashPassBannerText:
    'Enjoy $0 delivery fees and lower service fees on eligible orders with DashPass.',
  shopListModalText: {
    title: 'Search all your items at once',
    description:
      'Enter or paste in your grocery list and get search results for each item---all in one place.',
    placeholder: '2% reduced fat milk\nbananas\nlarge brown eggs',
    buttonText: 'Search all items',
    exampleText: 'Add things like:',
  },
};
