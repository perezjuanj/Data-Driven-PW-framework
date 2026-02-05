# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
npx playwright install
```

### 2. Run Your First Test
```bash
npm test
```

The test suite will automatically:
- Load all scenarios from `tests/data/testScenarios.json`
- Create a test for each scenario
- Execute all steps and validate expectations

## Adding Your First Test Scenario

### 1. Edit `tests/data/testScenarios.json`

Add a new scenario to the `testScenarios` array:

```json
{
  "id": "my_first_test",
  "name": "My First Test",
  "url": "https://example.com",
  "steps": [
    {
      "action": "click",
      "selector": "button.login"
    }
  ],
  "expectations": [
    {
      "type": "text",
      "selector": ".welcome",
      "value": "Welcome!"
    }
  ]
}
```

### 2. Run the Tests

```bash
npm test
```

That's it! The test framework automatically discovers your new scenario and runs it.

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests in headless mode |
| `npm run test:headed` | Run tests with visible browser |
| `npm run test:debug` | Run in debug mode with inspector |
| `npm run test:ui` | Run with Playwright test UI |
| `npm run build` | Compile TypeScript |
| `npm run dev` | Watch TypeScript files and recompile |

## Next Steps

- Read [README.md](../README.md) for comprehensive documentation
- Explore [tests/examples.ts](./examples.ts) for advanced usage patterns
- Check [tests/utils/testExecutor.ts](./utils/testExecutor.ts) to understand available actions
- Customize [playwright.config.ts](../playwright.config.ts) for your needs

## Key Files

| File | Purpose |
|------|---------|
| `tests/data/testScenarios.json` | Your test scenarios (JSON) |
| `tests/utils/testExecutor.ts` | Test execution logic |
| `tests/utils/dataLoader.ts` | JSON data loading |
| `tests/datadriven.spec.ts` | Main test file |
| `playwright.config.ts` | Playwright configuration |

## Troubleshooting

**Tests not running?**
- Verify browser paths: `npx playwright install`
- Check JSON syntax: `npm run build`

**Selectors not working?**
- Inspect elements in browser DevTools
- Update CSS selectors in JSON

**Need more help?**
- See [README.md](../README.md) Troubleshooting section
- Check test results in `playwright-report/`
