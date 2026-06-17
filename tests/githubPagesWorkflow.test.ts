import { describe, expect, it } from 'vitest';
import workflowSource from '../.github/workflows/deploy.yml?raw';

describe('GitHub Pages workflow', () => {
  it('enables Pages before uploading and deploying the artifact', () => {
    expect(workflowSource).toContain('uses: actions/configure-pages@v6');
    expect(workflowSource.indexOf('uses: actions/configure-pages@v6')).toBeLessThan(
      workflowSource.indexOf('uses: actions/upload-pages-artifact@v5'),
    );
    expect(workflowSource.indexOf('uses: actions/upload-pages-artifact@v5')).toBeLessThan(
      workflowSource.indexOf('uses: actions/deploy-pages@v5'),
    );
  });
});
