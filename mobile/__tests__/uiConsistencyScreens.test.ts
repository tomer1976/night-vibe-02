import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type ScreenCheck = {
  fileName: string;
  forbiddenPatterns: RegExp[];
};

const screenChecks: ScreenCheck[] = [
  {
    fileName: 'UserProfileScreen.tsx',
    forbiddenPatterns: [/fontSize:\s*14/, /fontSize:\s*16/, /gap:\s*8/],
  },
  {
    fileName: 'LinkedAccountsScreen.tsx',
    forbiddenPatterns: [/fontSize:\s*14/],
  },
  {
    fileName: 'DeleteAccountScreen.tsx',
    forbiddenPatterns: [/fontSize:\s*14/, /lineHeight:\s*20/],
  },
  {
    fileName: 'AccountSettingsScreen.tsx',
    forbiddenPatterns: [/fontSize:\s*14/, /fontSize:\s*15/],
  },
];

describe('sprint-02 ui consistency', () => {
  it('uses theme tokens instead of legacy hardcoded typography and spacing values', () => {
    for (const screenCheck of screenChecks) {
      const filePath = join(__dirname, '..', 'src', 'screens', screenCheck.fileName);
      const source = readFileSync(filePath, 'utf8');

      for (const forbiddenPattern of screenCheck.forbiddenPatterns) {
        expect(source).not.toMatch(forbiddenPattern);
      }
    }
  });
});

describe('sprint-04 ui consistency', () => {
  it('avoids transparent literal backgrounds in discovery venue details controls', () => {
    const filePath = join(__dirname, '..', 'src', 'screens', 'VenueDetailsScreen.tsx');
    const source = readFileSync(filePath, 'utf8');

    expect(source).not.toMatch(/'transparent'/);
  });
});
