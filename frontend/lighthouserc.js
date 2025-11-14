module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/products',
        'http://localhost:3000/cart',
        'http://localhost:3000/checkout',
      ],
      startServerCommand: 'npm run build && npm run start',
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless',
      },
    },
    assert: {
      // ISO 25010 Performance Efficiency thresholds
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }], // WCAG 2.2 AA
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals (ISO 25010 aligned)
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],

        // Security & Best Practices
        'is-on-https': 'error',
        'uses-http2': 'warn',
        'no-vulnerable-libraries': 'error',

        // Accessibility (ISO 9241 compliance)
        'color-contrast': 'error',
        'image-alt': 'error',
        label: 'error',
        'link-name': 'error',
        'button-name': 'error',

        // Performance
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'efficient-animated-content': 'warn',

        // PWA (if applicable)
        'service-worker': 'off', // Enable if implementing PWA
        'installable-manifest': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
      // For production: configure with your CI/CD pipeline
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lhci.db',
      },
    },
  },
};
