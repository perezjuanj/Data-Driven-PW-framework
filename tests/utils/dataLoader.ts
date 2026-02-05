import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { TestScenario } from './testExecutor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DataLoader {
  /**
   * Load environment variables from .env file
   */
  static loadEnvVariables(): Record<string, string> {
    const envPath = path.resolve(__dirname, '../../.env');
    
    if (!fs.existsSync(envPath)) {
      throw new Error(`.env file not found at ${envPath}. Please create it using .env.example as a template.`);
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};

    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        if (key) {
          envVars[key.trim()] = value;
        }
      }
    });

    return envVars;
  }

  /**
   * Get a specific environment variable
   */
  /**
   * Loads test scenarios from JSON file
   */
  static loadScenarios(filePath: string): TestScenario[] {
    const resolvedPath = path.resolve(__dirname, '..', filePath);
    const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.testScenarios as TestScenario[];
  }

  /**
   * Filters scenarios by ID
   */
  static getScenarioById(scenarios: TestScenario[], id: string): TestScenario | undefined {
    return scenarios.find((s) => s.id === id);
  }

  /**
   * Filters scenarios by name (supports partial matching)
   */
  static getScenariosByName(scenarios: TestScenario[], namePattern: string): TestScenario[] {
    const regex = new RegExp(namePattern, 'i');
    return scenarios.filter((s) => regex.test(s.name));
  }

  /**
   * Gets all scenarios
   */
  static getAllScenarios(scenarios: TestScenario[]): TestScenario[] {
    return scenarios;
  }

  /**
   * Gets scenarios by tags (if implemented in JSON)
   */
  static getScenariosByTag(scenarios: TestScenario[], tag: string): TestScenario[] {
    return scenarios.filter((s) => (s as any).tags?.includes(tag));
  }
}
