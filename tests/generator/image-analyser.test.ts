import { describe, it, expect } from 'vitest';
import { buildImageAnalysisPrompt, buildNotationDetectionGuide } from '../../src/generator/image-analyser.js';

describe('ImageAnalyser', () => {
  describe('buildImageAnalysisPrompt', () => {
    it('returns a prompt with analysis instructions when called with no options', () => {
      const prompt = buildImageAnalysisPrompt();
      expect(prompt).toContain('analyses reference images');
      expect(prompt).toContain('Analysis Steps');
      expect(prompt).toContain('Output Format');
      expect(prompt).toContain('Layout Rules');
      expect(prompt).toContain('Edge Rules');
    });

    it('includes notation detection guide when no notation specified', () => {
      const prompt = buildImageAnalysisPrompt();
      expect(prompt).toContain('Notation Detection Guide');
      expect(prompt).toContain('Available Notations');
    });

    it('includes notation detection guide with empty options', () => {
      const prompt = buildImageAnalysisPrompt({});
      expect(prompt).toContain('Notation Detection Guide');
      expect(prompt).toContain('Available Notations');
    });

    it('includes specific notation shape catalogue when notation is provided', () => {
      const prompt = buildImageAnalysisPrompt({ notation: 'azure' });
      expect(prompt).toContain('Notation: Azure');
      expect(prompt).not.toContain('Notation Detection Guide');
      expect(prompt).not.toContain('Available Notations');
    });

    it('includes AWS notation shapes when aws is specified', () => {
      const prompt = buildImageAnalysisPrompt({ notation: 'aws' });
      expect(prompt).toContain('Notation: AWS');
      expect(prompt).toContain('Available Shapes');
      expect(prompt).toContain('Style Templates');
      expect(prompt).toContain('Colour Palette');
      expect(prompt).toContain('Notation Rules');
    });

    it('includes generic notation shapes when generic is explicitly specified', () => {
      const prompt = buildImageAnalysisPrompt({ notation: 'generic' });
      expect(prompt).toContain('Notation: Generic');
      expect(prompt).not.toContain('Notation Detection Guide');
    });

    it('includes diagram type hint when provided', () => {
      const prompt = buildImageAnalysisPrompt({ diagramType: 'infrastructure' });
      expect(prompt).toContain('Diagram Type Hint');
      expect(prompt).toContain('"infrastructure"');
    });

    it('includes additional context when provided', () => {
      const prompt = buildImageAnalysisPrompt({
        additionalContext: 'This is an Azure API Management secure baseline',
      });
      expect(prompt).toContain('Additional Context');
      expect(prompt).toContain('Azure API Management secure baseline');
    });

    it('includes all options together', () => {
      const prompt = buildImageAnalysisPrompt({
        notation: 'azure',
        diagramType: 'infrastructure',
        additionalContext: 'Focus on the subnet boundaries',
      });
      expect(prompt).toContain('Notation: Azure');
      expect(prompt).toContain('Diagram Type Hint');
      expect(prompt).toContain('Focus on the subnet boundaries');
    });

    it('includes DiagramModel JSON schema in output format', () => {
      const prompt = buildImageAnalysisPrompt();
      expect(prompt).toContain('DiagramModel');
      expect(prompt).toContain('DiagramNode');
      expect(prompt).toContain('DiagramEdge');
      expect(prompt).toContain('DiagramContainer');
      expect(prompt).toContain('DiagramMetadata');
    });

    it('instructs to output only valid JSON', () => {
      const prompt = buildImageAnalysisPrompt();
      expect(prompt).toContain('Output ONLY valid JSON');
    });

    it('includes all eight notations in the detection summary when no notation specified', () => {
      const prompt = buildImageAnalysisPrompt();
      expect(prompt).toContain('**generic**');
      expect(prompt).toContain('**aws**');
      expect(prompt).toContain('**azure**');
      expect(prompt).toContain('**gcp**');
      expect(prompt).toContain('**cisco**');
      expect(prompt).toContain('**archimate**');
      expect(prompt).toContain('**uml**');
      expect(prompt).toContain('**bpmn**');
    });

    it('works with all supported notations', () => {
      const notations = ['aws', 'azure', 'gcp', 'cisco', 'archimate', 'uml', 'bpmn', 'generic'] as const;
      for (const notation of notations) {
        const prompt = buildImageAnalysisPrompt({ notation });
        expect(prompt).toBeTruthy();
        expect(prompt.length).toBeGreaterThan(500);
      }
    });
  });

  describe('buildNotationDetectionGuide', () => {
    it('returns a guide covering all notations', () => {
      const guide = buildNotationDetectionGuide();
      expect(guide).toContain('Notation Detection Guide');
      expect(guide).toContain('### AWS');
      expect(guide).toContain('### Azure');
      expect(guide).toContain('### GCP');
      expect(guide).toContain('### Cisco');
      expect(guide).toContain('### BPMN');
      expect(guide).toContain('### UML');
      expect(guide).toContain('### ArchiMate');
      expect(guide).toContain('### Generic');
    });

    it('includes visual identification cues', () => {
      const guide = buildNotationDetectionGuide();
      expect(guide).toContain('Orange');  // AWS visual cue
      expect(guide).toContain('Blue flat');  // Azure visual cue
      expect(guide).toContain('Hexagonal');  // GCP visual cue
      expect(guide).toContain('Teal');  // Cisco visual cue
    });

    it('recommends generic as fallback', () => {
      const guide = buildNotationDetectionGuide();
      expect(guide).toContain('fallback');
    });
  });
});
