import { Page, expect, TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface TestStep {
    action: 'fill' | 'click' | 'type' | 'select' | 'check' | 'uncheck' | 'hover' | 'wait';
    selector?: string;
    value?: string;
    delay?: number;
    skipIfHasClass?: string;
}

export interface Expectation {
    type: 'url' | 'text' | 'notText' | 'visible' | 'hidden' | 'attribute' | 'count';
    selector?: string;
    value?: string;
    attribute?: string;
}

export interface TestScenario {
    id: string;
    name: string;
    url: string;
    steps: TestStep[];
    expectations: Expectation[];
}
export class TestExecutor {
    /**
     * Interpolates environment variables in a string
     */
    private static interpolateVariables(text: string, envVars: Record<string, string>): string {
        let result = text;
        const pattern = /\$\{([^}]+)\}/g;
        result = result.replace(pattern, (match, key) => {
            const value = envVars[key];
            if (!value) {
                throw new Error(`Environment variable "${key}" not found`);
            }
            return value;
        });
        return result;
    }

    /**
     * Interpolates environment variables in all step values and selectors
     */
    private static interpolateSteps(steps: TestStep[], envVars: Record<string, string>): TestStep[] {
        return steps.map((step) => ({
            ...step,
            selector: step.selector ? this.interpolateVariables(step.selector, envVars) : step.selector,
            value: step.value ? this.interpolateVariables(step.value, envVars) : step.value,
            skipIfHasClass: step.skipIfHasClass
                ? this.interpolateVariables(step.skipIfHasClass, envVars)
                : step.skipIfHasClass,
        }));
    }

    /**
     * Interpolates environment variables in scenario URL and expectations
     */
    private static interpolateScenario(scenario: TestScenario, envVars: Record<string, string>): TestScenario {
        return {
            ...scenario,
            url: this.interpolateVariables(scenario.url, envVars),
            steps: this.interpolateSteps(scenario.steps, envVars),
            expectations: scenario.expectations.map((exp) => ({
                ...exp,
                selector: exp.selector ? this.interpolateVariables(exp.selector, envVars) : exp.selector,
                value: exp.value ? this.interpolateVariables(exp.value, envVars) : exp.value,
            })),
        };
    }

    /**
     * Executes a single step on the page
     */
    static async executeStep(page: Page, step: TestStep): Promise<void> {
        const { action, selector, value, delay } = step;

        switch (action) {
            case 'fill':
                if (!selector) throw new Error('Missing selector for fill action');
                await page.fill(selector, value || '');
                break;
            case 'click':
                if (!selector) throw new Error('Missing selector for click action');
                if (step.skipIfHasClass) {
                    const classAttr = await page.locator(selector).first().getAttribute('class');
                    const classes = classAttr ? classAttr.split(/\s+/) : [];
                    if (classes.includes(step.skipIfHasClass)) {
                        break;
                    }
                }
                await page.click(selector);
                break;
            case 'type':
                if (!selector) throw new Error('Missing selector for type action');
                await page.locator(selector).type(value || '', { delay: delay || 0 });
                break;
            case 'select':
                if (!selector) throw new Error('Missing selector for select action');
                await page.selectOption(selector, value || '');
                break;
            case 'check':
                if (!selector) throw new Error('Missing selector for check action');
                await page.check(selector);
                break;
            case 'uncheck':
                if (!selector) throw new Error('Missing selector for uncheck action');
                await page.uncheck(selector);
                break;
            case 'hover':
                if (!selector) throw new Error('Missing selector for hover action');
                await page.hover(selector);
                break;
            case 'wait':
                await page.waitForTimeout(parseInt(value || '1000'));
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    /**
     * Executes multiple steps sequentially
     */
    static async executeSteps(page: Page, steps: TestStep[]): Promise<void> {
        for (const step of steps) {
            await this.executeStep(page, step);
        }
    }

    /**
     * Validates a single expectation
     */
    static async validateExpectation(page: Page, expectation: Expectation): Promise<void> {
        const { type, selector, value, attribute } = expectation;

        switch (type) {
            case 'url':
                await expect(page).toHaveURL(value || '');
                break;
            case 'text':
                if (!selector) throw new Error('Missing selector for text expectation');
                if (!value) throw new Error('Missing value for text expectation');
                {
                    const locator = page.locator(selector);
                    const filtered = locator.filter({ hasText: value }).first();
                    await expect(
                        filtered,
                        `"${value}" not found in element "${selector}"`
                    ).toContainText(value);
                }
                break;
            case 'notText':
                if (!selector) throw new Error('Missing selector for notText expectation');
                if (!value) throw new Error('Missing value for notText expectation');
                await expect(page.locator(selector)).not.toContainText(value);
                break;
            case 'visible':
                if (selector) {
                    await expect(page.locator(selector)).toBeVisible();
                }
                break;
            case 'hidden':
                if (selector) {
                    await expect(page.locator(selector)).toBeHidden();
                }
                break;
            case 'attribute':
                if (selector && attribute) {
                    await expect(page.locator(selector)).toHaveAttribute(attribute, value || '');
                }
                break;
            case 'count':
                if (selector) {
                    const count = parseInt(value || '0');
                    await expect(page.locator(selector)).toHaveCount(count);
                }
                break;
            default:
                throw new Error(`Unknown expectation type: ${type}`);
        }
    }

    /**
     * Validates multiple expectations
     */
    static async validateExpectations(page: Page, expectations: Expectation[]): Promise<void> {
        for (const expectation of expectations) {
            await this.validateExpectation(page, expectation);
        }
    }

    /**
     * Executes a complete test scenario
     */
    static async executeScenario(
        page: Page,
        scenario: TestScenario,
        envVars?: Record<string, string>,
        testInfo?: TestInfo
    ): Promise<void> {
        // Use provided envVars or empty object (for backward compatibility)
        const vars = envVars || {};

        // Interpolate environment variables if envVars provided
        const processedScenario = vars && Object.keys(vars).length > 0 ? this.interpolateScenario(scenario, vars) : scenario;

        try {
            // Navigate to the URL
            await page.goto(processedScenario.url);

            // Execute all steps
            await this.executeSteps(page, processedScenario.steps);

            // Validate all expectations
            await this.validateExpectations(page, processedScenario.expectations);
        } catch (error) {
            const safeId = processedScenario.id.replace(/[^a-zA-Z0-9_-]/g, '_');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotsDir = path.resolve(process.cwd(), 'test-results', 'screenshots');
            fs.mkdirSync(screenshotsDir, { recursive: true });
            if (!page.isClosed()) {
                const screenshotBuffer = await page.screenshot({
                    path: path.join(screenshotsDir, `${safeId}-${timestamp}.png`),
                    fullPage: true,
                });
                if (testInfo) {
                    await testInfo.attach(`failure-${safeId}`, {
                        body: screenshotBuffer,
                        contentType: 'image/png',
                    });
                }
            }
            throw error;
        }
    }
}
