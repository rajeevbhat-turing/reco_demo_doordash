module.exports = async (browser, { url }) => {
  const page = await browser.newPage();
  // Go to any page on your origin first (needed before touching localStorage)
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Set whatever you normally store after login
  await page.evaluate(() => {
    localStorage.setItem(
      'user-store',
      JSON.stringify({
        state: {
          users: [],
          currentUser: {
            id: '1',
            name: 'Kai Hayes',
            email: 'kai.hayes1@example.com',
            phoneNumber: '9337119195',
            password: 'cb99JpX9M02b',
            country: {
              dialCode: '+1',
              code: 'CA',
              name: 'Canada',
            },
            userCountry: 'Canada',
            avatar: '/placeholder.svg',
            is_restricted: false,
            addresses: [
              {
                id: '1',
                street: '700 N Brookhurst St',
                city: 'Anaheim',
                state: 'CA',
                zipCode: '92801',
                lat: 33.8402032,
                lng: -117.9587196,
                addressType: 'house',
                default: true,
                deliveryPreference: 'Leave at my door',
                personalLabel: 'House',
              },
              {
                id: '2',
                street: "Shakey's Pizza Parlor, 2023 East Cesar E Chavez Avenue",
                city: 'Los Angeles',
                state: 'CA',
                zipCode: '90033',
                lat: 34.0491759,
                lng: -118.2124186,
                addressType: 'other',
                default: false,
                buildingName: 'Underwood Community Center',
                deliveryPreference: 'Leave at my door',
                personalLabel: 'Other',
              },
            ],
            paymentMethods: [
              {
                id: '1',
                type: 'amex',
                cardNumber: '4263285214264655',
                lastFour: '4655',
                cvc: '941',
                expiry: '02/26',
                zipCode: '76647',
                default: true,
              },
            ],
          },
          changePasswordPhoneVerified: false,
          deletedUserIds: [],
          tempAddress: null,
          isInitialized: true,
        },
        version: 0,
      })
    );
  });

  // Now go to the page Lighthouse will audit
  await page.goto(url, { waitUntil: 'networkidle0' });
};
