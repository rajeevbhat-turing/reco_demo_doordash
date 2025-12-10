module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/home',
        'http://localhost:3000/store/15',
        'http://localhost:3000/orders',
        'http://localhost:3000/consumer/edit_profile',
        'http://localhost:3000/consumer/privacy/manage_account',
        'http://localhost:3000/password-reset',
        'http://localhost:3000/search?q=burger',
        'http://localhost:3000/payment',
      ],
      numberOfRuns: 1,
      startServerCommand: 'npm run start',
      puppeteerScript: './puppeteer-login.js',
      settings: {
        preset: 'desktop',
        disableStorageReset: true,
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './lhci-reports',
    },
  },
};
