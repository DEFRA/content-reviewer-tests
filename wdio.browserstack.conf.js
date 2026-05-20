import fs from 'node:fs'

const debug = process.env.DEBUG

const oneMinute = 60 * 1000

export const config = {
  runner: 'local',
  baseUrl: `https://content-reviewer-frontend.dev.cdp-int.defra.cloud`,

  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_KEY,

  specs: ['./test/specs/**/*.js'],
  exclude: [],
  maxInstances: 1,

  commonCapabilities: {
    'bstack:options': {
      buildName: `content-reviewer-tests-${process.env.ENVIRONMENT}`
    }
  },

  capabilities: [
    {
      browserName: 'Chrome',
      'bstack:options': {
        browserVersion: 'latest',
        os: 'Windows',
        osVersion: '11',
        local: true,
        debug: true,
        networkLogs: true
      }
    }
  ],

  services: [
    [
      'browserstack',
      {
        forceLocal: false,
        browserstackLocal: true,
        testObservability: true, // Disable if you do not want to use the browserstack test observer functionality
        testObservabilityOptions: {
          user: process.env.BROWSERSTACK_USER,
          key: process.env.BROWSERSTACK_KEY,
          projectName: 'content-reviewer-tests', // should match project in browserstack
          buildName: `content-reviewer-tests-${process.env.ENVIRONMENT}`
        }
      }
    ]
  ],

  execArgv: ['--loader', 'esm-module-alias/loader'],

  logLevel: debug ? 'debug' : 'info',
  logLevels: {
    webdriver: 'error'
  },

  // Number of failures before the test suite bails.
  bail: 0,
  waitforTimeout: 10000,
  waitforInterval: 200,
  connectionRetryTimeout: 6000,
  connectionRetryCount: 3,

  framework: 'mocha',

  reporters: [
    [
      // Spec reporter provides rolling output to the logger so you can see it in-progress
      'spec',
      {
        addConsoleLogs: true,
        realtimeReporting: true,
        color: false
      }
    ],
    [
      // Allure is used to generate the final HTML report
      'allure',
      {
        outputDir: 'allure-results'
      }
    ]
  ],

  // Options to be passed to Mocha.
  // See the full list at http://mochajs.org/
  mochaOpts: {
    ui: 'bdd',
    timeout: oneMinute
  },

  // Hooks
  afterTest: async function (
    test,
    context,
    { error, result, duration, passed, retries }
  ) {
    if (error) {
      await browser.takeScreenshot()
    }
  },

  onComplete: function (exitCode, config, capabilities, results) {
    // !Do Not Remove! Required for test status to show correctly in portal.
    if (results?.failed && results.failed > 0) {
      fs.writeFileSync('FAILED', JSON.stringify(results))
    }
  }
}
