import { test } from '@playwright/test';
import { DataLoader } from './utils/dataLoader';
import { TestExecutor } from './utils/testExecutor';
import { TestScenario } from './utils/testExecutor';

// Load all test scenarios from JSON
let testScenarios: TestScenario[] = DataLoader.loadScenarios('data/testScenarios.json');
const envVars = DataLoader.loadEnvVariables();

// Optional filters via env vars
const testId = (process.env.TEST_ID || '').trim();
const testTag = (process.env.TEST_TAG || '').trim();
const testName = (process.env.TEST_NAME || '').trim();

if (testId) {
  const match = DataLoader.getScenarioById(testScenarios, testId);
  testScenarios = match ? [match] : [];
}

if (testTag) {
  testScenarios = DataLoader.getScenariosByTag(testScenarios, testTag);
}

if (testName) {
  testScenarios = DataLoader.getScenariosByName(testScenarios, testName);
}

// Create a parameterized test for each scenario
testScenarios.forEach((scenario) => {
  test(`[${scenario.id}] ${scenario.name}`, async ({ page }, testInfo) => {
    // Execute the scenario using the generic executor
    await TestExecutor.executeScenario(page, scenario, envVars, testInfo);
  });
});
