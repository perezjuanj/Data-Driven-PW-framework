# Playwright Data-Driven Test Suite

A scalable, maintainable test suite that leverages **data-driven techniques** to minimize code duplication and improve test scalability. Test scenarios are defined in JSON format, allowing dynamic test execution without repeating code.

## Features

✅ **Data-Driven Testing**: Define test scenarios in JSON, execute dynamically  
✅ **Zero Code Duplication**: Single executor handles all test cases  
✅ **Scalable Architecture**: Add new test cases by adding JSON entries  
✅ **Type-Safe**: Full TypeScript support  
✅ **Flexible Step Actions**: fill, click, type, select, check, uncheck, hover, wait  
✅ **Multiple Expectation Types**: url, text, notText, visible, hidden, attribute, count  
✅ **Environment Variable Interpolation**: `${VAR}` in URLs/selectors/values via `.env`  
✅ **Easy Maintenance**: Centralized test data in JSON files  

## Project Structure

```
.
├── tests/
│   ├── data/
│   │   └── testScenarios.json          # Test scenarios data
│   ├── utils/
│   │   ├── testExecutor.ts             # Core test executor
│   │   └── dataLoader.ts               # JSON data loader
│   └── datadriven.spec.ts              # Main test file
├── playwright.config.ts                 # Playwright configuration
├── tsconfig.json                        # TypeScript configuration
├── package.json                         # Project dependencies
└── README.md                            # This file
```

## Installation

### Prerequisites
- Node.js 16+ and npm

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Playwright Browsers**
   ```bash
   npx playwright install
   ```

3. **Create `.env`**
   This project loads environment variables from `.env` at runtime. Add any values you want to reference in your test JSON using `${VAR}` syntax.

## Usage

### Running Tests

Run all tests:
```bash
npm test
```

Run a single scenario by ID:
```bash
TEST_ID=web_app_sys_update npm test
```

Or use the helper script (PowerShell friendly):
```bash
npm run test:id -- web_app_sys_update
```

Run scenarios by tag (requires `tags` array in JSON):
```bash
TEST_TAG=smoke npm test
```

Or:
```bash
npm run test:tag -- smoke
```

Run scenarios by name (partial match / regex):
```bash
TEST_NAME=Login npm test
```

Or:
```bash
npm run test:name -- Login
```

Run tests in headed mode (see browser):
```bash
npm run test:headed
```

Run tests with debug mode:
```bash
npm run test:debug
```

Run tests with UI:
```bash
npm run test:ui
```

### GitHub Actions + Reports

This repo includes a workflow that runs Playwright on pushes/PRs to `main` and publishes the HTML report to GitHub Pages.

1. After a workflow run, the report will be available at:
   ```text
   https://<OWNER>.github.io/<REPO>/
   ```
   Example:
   ```text
   https://perezjuanj.github.io/Data-Driven-PW-framework/
   ```

### Test Data Structure

Test scenarios are defined in `tests/data/testScenarios.json`. Each scenario includes:

```json
{
  "testScenarios": [
    {
      "id": "unique_scenario_id",
      "name": "Readable scenario name",
      "url": "https://example.com/page",
      "tags": ["smoke", "regression"],
      "steps": [
        {
          "action": "fill|click|type|select|check|uncheck|hover|wait",
          "selector": "CSS selector",
          "value": "value (optional)",
          "delay": "delay in ms (optional)",
          "skipIfHasClass": "CSS class name (optional, click only)"
        }
      ],
      "expectations": [
        {
          "type": "url|text|notText|visible|hidden|attribute|count",
          "selector": "CSS selector (optional)",
          "value": "expected value",
          "attribute": "attribute name (for attribute type)"
        }
      ]
    }
  ]
}
```

### Optional Filters

You can filter scenarios at runtime using env vars:

```text
TEST_ID   = exact match on scenario id
TEST_TAG  = match tag in scenario.tags
TEST_NAME = partial/regex match on scenario name
```

Filters are applied in this order: `TEST_ID`, then `TEST_TAG`, then `TEST_NAME`.
If a filter yields no matches, no tests run.

### Adding New Test Cases

To add a new test case:

1. Open `tests/data/testScenarios.json`
2. Add a new scenario object to the `testScenarios` array:

```json
{
  "id": "new_test_case",
  "name": "My new test scenario",
  "url": "https://example.com/page",
  "steps": [
    {
      "action": "click",
      "selector": "button.submit"
    }
  ],
  "expectations": [
    {
      "type": "text",
      "selector": ".success-message",
      "value": "Success!"
    }
  ]
}
```

3. Save the file - the test will automatically be discovered and executed!

### Step Actions Reference

| Action | Description | Requires Value |
|--------|-------------|-----------------|
| `fill` | Fill input field with value | Yes |
| `click` | Click on element | No |
| `type` | Type text character by character | Yes |
| `select` | Select option from dropdown | Yes |
| `check` | Check checkbox | No |
| `uncheck` | Uncheck checkbox | No |
| `hover` | Hover over element | No |
| `wait` | Wait for milliseconds | Yes |

Optional per-step field:
`skipIfHasClass` (click only): If the target element already has this class, the click is skipped.

### Expectation Types Reference

| Type | Description | Requires Selector |
|------|-------------|-----------------|
| `url` | Verify current page URL | No |
| `text` | Verify element contains text | Yes |
| `notText` | Verify element does not contain text | Yes |
| `visible` | Verify element is visible | Yes |
| `hidden` | Verify element is hidden | Yes |
| `attribute` | Verify element attribute value | Yes |
| `count` | Verify number of elements | Yes |

### Assertion Mapping

Current expectation types map to Playwright auto-retrying assertions:

| Expectation Type | Playwright Assertion |
|------------------|----------------------|
| `url` | `await expect(page).toHaveURL(...)` |
| `text` | `await expect(locator).toContainText(...)` |
| `notText` | `await expect(locator).not.toContainText(...)` |
| `visible` | `await expect(locator).toBeVisible()` |
| `hidden` | `await expect(locator).toBeHidden()` |
| `attribute` | `await expect(locator).toHaveAttribute(...)` |
| `count` | `await expect(locator).toHaveCount(...)` |

Playwright assertion reference:
```text
https://playwright.dev/docs/test-assertions
```

Common auto-retrying assertions supported by Playwright include:

| Assertion | Description |
|----------|-------------|
| `await expect(locator).toBeAttached()` | Element is attached |
| `await expect(locator).toBeChecked()` | Checkbox is checked |
| `await expect(locator).toBeDisabled()` | Element is disabled |
| `await expect(locator).toBeEditable()` | Element is editable |
| `await expect(locator).toBeEmpty()` | Container is empty |
| `await expect(locator).toBeEnabled()` | Element is enabled |
| `await expect(locator).toBeFocused()` | Element is focused |
| `await expect(locator).toBeHidden()` | Element is not visible |
| `await expect(locator).toBeInViewport()` | Element intersects viewport |
| `await expect(locator).toBeVisible()` | Element is visible |
| `await expect(locator).toContainText()` | Element contains text |
| `await expect(locator).toContainClass()` | Element has specified CSS classes |
| `await expect(locator).toHaveAccessibleDescription()` | Element has a matching accessible description |
| `await expect(locator).toHaveAccessibleName()` | Element has a matching accessible name |
| `await expect(locator).toHaveAttribute()` | Element has a DOM attribute |
| `await expect(locator).toHaveClass()` | Element has specified CSS class property |
| `await expect(locator).toHaveCount()` | List has exact number of children |
| `await expect(locator).toHaveCSS()` | Element has CSS property |
| `await expect(locator).toHaveId()` | Element has an ID |
| `await expect(locator).toHaveJSProperty()` | Element has a JavaScript property |
| `await expect(locator).toHaveRole()` | Element has a specific ARIA role |
| `await expect(locator).toHaveScreenshot()` | Element has a screenshot |
| `await expect(locator).toHaveText()` | Element matches text |
| `await expect(locator).toHaveValue()` | Input has a value |
| `await expect(locator).toHaveValues()` | Select has options selected |
| `await expect(locator).toMatchAriaSnapshot()` | Element matches the Aria snapshot |
| `await expect(page).toHaveScreenshot()` | Page has a screenshot |
| `await expect(page).toHaveTitle()` | Page has a title |
| `await expect(page).toHaveURL()` | Page has a URL |
| `await expect(response).toBeOK()` | Response has an OK status |

## Advanced Usage

### Filtering Scenarios by Name

Use the `DataLoader` to filter scenarios programmatically:

```typescript
import { DataLoader } from './utils/dataLoader';

const scenarios = DataLoader.loadScenarios('data/testScenarios.json');
const loginTests = DataLoader.getScenariosByName(scenarios, 'Login');
```

### Custom Test Execution

For advanced use cases, you can execute steps and expectations individually:

```typescript
import { TestExecutor } from './utils/testExecutor';

const page = await browser.newPage();
await TestExecutor.executeStep(page, {
  action: 'click',
  selector: 'button'
});
await TestExecutor.validateExpectation(page, {
  type: 'text',
  selector: '.message',
  value: 'Success'
});
```

### Environment Variable Interpolation

You can reference `.env` values in URLs, selectors, step values, and expectations:

```json
{
  "url": "${BASE_URL}/login",
  "steps": [
    { "action": "fill", "selector": "#username", "value": "${USERNAME}" }
  ],
  "expectations": [
    { "type": "text", "selector": ".welcome", "value": "${WELCOME_TEXT}" }
  ]
}
```

## Architecture Benefits

### Scalability
- Add hundreds of test cases without writing code
- Reuse test executor across all scenarios
- Centralized data management

### Maintainability
- Single source of truth for test logic (TestExecutor)
- Clear separation between test data and test logic
- Easy to update test flow without modifying tests

### Readability
- JSON test scenarios are self-documenting
- Non-technical stakeholders can understand test flows
- Clear naming and structure

## Best Practices

1. **Unique IDs**: Use descriptive, kebab-case IDs for scenarios
2. **Clear Names**: Use readable test names that describe what's being tested
3. **Granular Steps**: Break down complex actions into smaller steps
4. **Explicit Waits**: Use specific expectations instead of arbitrary waits
5. **Reusable Selectors**: Use stable, semantic CSS selectors
6. **Data Organization**: Group related scenarios together in JSON

## Troubleshooting

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Add explicit wait steps before assertions

### Selectors not found
- Verify CSS selectors in browser DevTools
- Ensure page is fully loaded before interacting

### Test data not loading
- Check JSON syntax in `testScenarios.json`
- Verify file path in `DataLoader.loadScenarios()`

## Configuration

### `.env` Settings

These environment variables are read by `playwright.config.ts` (and `tests/utils/dataLoader.ts`) to control runtime behavior:

| Variable | Example | Purpose |
|----------|---------|---------|
| `SELECTOR_TIMEOUT` | `30000` | Timeout (ms) for actions/expectations/navigation |
| `SCRIPT_TIMEOUT` | `30000` | Overall test timeout (ms) |
| `HEADLESS` | `true` | Run browsers headless (`true`/`false`) |
| `DEVTOOLS` | `false` | Reserved for opening DevTools (currently not wired) |
| `BROWSER` | `chromium` | Browser project: `chromium` \| `firefox` \| `webkit` \| `all` |
| `PARALLEL` | `3` | Worker count (leave empty for Playwright default) |
| `RETRY` | `0` | Retries for failed tests |
| `SLOWMO` | `0` | Slow motion delay (ms) |


## Dependencies

- `@playwright/test`: Testing framework and automation library
- `typescript`: Language for type-safe code
- `@types/node`: TypeScript types for Node.js

## License

MIT
