import { describe, it, expect } from 'vitest';
import { buildScopedPrompt, buildSystemPrompt } from '../../src/generator/prompt-builder.js';
import type { ConcernScope } from '../../src/types/index.js';

describe('buildScopedPrompt', () => {
  it('appends a Concern Scope section to the base prompt', () => {
    const scope: ConcernScope = {
      coreConcern: 'FortiGate security connectivity',
    };

    const result = buildScopedPrompt(scope);
    const base = buildSystemPrompt();

    expect(result).toContain(base);
    expect(result).toContain('## Concern Scope');
    expect(result).toContain('Core concern: FortiGate security connectivity');
  });

  it('lists Primary and Context elements correctly', () => {
    const scope: ConcernScope = {
      coreConcern: 'API Gateway routing',
      classifications: {
        'API Gateway': 'primary',
        'Lambda Functions': 'primary',
        'VPC': 'context',
        'CloudWatch': 'context',
        'CI/CD Pipeline': 'adjacent',
      },
    };

    const result = buildScopedPrompt(scope, 'aws');

    expect(result).toContain('**Primary elements** (full notation detail): API Gateway, Lambda Functions');
    expect(result).toContain('**Context elements** (single labelled container or rounded rectangle, no internal detail): VPC, CloudWatch');
    expect(result).toContain('Do NOT include any Adjacent/omitted elements');
    expect(result).not.toContain('CI/CD Pipeline');
  });

  it('includes adjacent concerns as potential separate views', () => {
    const scope: ConcernScope = {
      coreConcern: 'database connectivity',
      adjacentConcerns: ['monitoring and alerting', 'CI/CD deployment pipeline'],
    };

    const result = buildScopedPrompt(scope);

    expect(result).toContain('Adjacent concerns (omitted, potential separate views): monitoring and alerting; CI/CD deployment pipeline');
  });

  it('produces minimal scope section with empty classifications', () => {
    const scope: ConcernScope = {
      coreConcern: 'simple flowchart',
      classifications: {},
    };

    const result = buildScopedPrompt(scope);

    expect(result).toContain('## Concern Scope');
    expect(result).toContain('Core concern: simple flowchart');
    expect(result).not.toContain('**Primary elements**');
    expect(result).not.toContain('**Context elements**');
    expect(result).toContain('Do NOT include any Adjacent/omitted elements');
  });

  it('includes notation-specific content in the base prompt', () => {
    const scope: ConcernScope = {
      coreConcern: 'network segmentation',
    };

    const result = buildScopedPrompt(scope, 'cisco');

    expect(result).toContain('Notation: Cisco');
    expect(result).toContain('## Concern Scope');
  });

  it('works with undefined classifications and adjacentConcerns', () => {
    const scope: ConcernScope = {
      coreConcern: 'bare minimum scope',
    };

    const result = buildScopedPrompt(scope);

    expect(result).toContain('Core concern: bare minimum scope');
    expect(result).toContain('Do NOT include any Adjacent/omitted elements');
    expect(result).not.toContain('Adjacent concerns');
  });
});
