import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { deflateRawSync } from 'node:zlib';
import {
  parseStyle,
  vertexIdentity,
  edgeIdentity,
  readDrawio,
  extractStandard,
  extractStandardFromFiles,
  validateStandardDefinition,
  normaliseStandard,
  StandardStore,
  getClientsDir,
  resolveStandardShape,
  resolveStandardConnector,
  checkStandardCoverage,
  validateStandardConformance,
  buildStandardPrompt,
  wrapWithMxFile,
  buildDiagramXml,
  ProjectContext,
  resolveShape,
} from '../../src/index.js';
import type { ModellingStandard } from '../../src/index.js';

const RES = join(__dirname, '..', 'fixtures', 'standards');
const ARCHIMATE = join(RES, 'template-archimate-layered.drawio');
const UML = join(RES, 'template-uml-class-diagram.drawio');
const BPMN = join(RES, 'bpmn-order-processing.drawio');

function compress(xml: string): string {
  return deflateRawSync(Buffer.from(encodeURIComponent(xml), 'utf-8')).toString('base64');
}

const PALETTE_XML = `<mxfile><diagram name="Palette"><mxGraphModel><root>
<mxCell id="0"/><mxCell id="1" parent="0"/>
<mxCell id="a" value="Application Component" style="html=1;outlineConnect=0;whiteSpace=wrap;fillColor=#99ffff;shape=mxgraph.archimate3.application;appType=comp;archiType=square;" vertex="1" parent="1"><mxGeometry width="150" height="75" as="geometry"/></mxCell>
<object id="b" label="Ignored label" standardName="Business Actor" category="Business"><mxCell style="html=1;outlineConnect=0;whiteSpace=wrap;fillColor=#ffff99;shape=mxgraph.archimate3.application;appType=actor;archiType=square;" vertex="1" parent="1"><mxGeometry width="150" height="75" as="geometry"/></mxCell></object>
<mxCell id="g" value="Domain" style="rounded=0;whiteSpace=wrap;html=1;fillColor=none;dashed=1;" vertex="1" parent="1"><mxGeometry width="400" height="200" as="geometry"/></mxCell>
<mxCell id="g1" value="Inside" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="g"><mxGeometry width="100" height="40" as="geometry"/></mxCell>
<mxCell id="e" value="Serving" style="endArrow=open;endFill=0;html=1;exitX=1;exitY=0.5;" edge="1" parent="1" source="a" target="b"><mxGeometry relative="1" as="geometry"/></mxCell>
<mxCell id="el" value="label" style="edgeLabel;html=1;" vertex="1" connectable="0" parent="e"><mxGeometry as="geometry"/></mxCell>
<mxCell id="e2" style="endArrow=block;dashed=1;html=1;" edge="1" parent="1" source="a" target="b"><mxGeometry relative="1" as="geometry"/></mxCell>
</root></mxGraphModel></diagram></mxfile>`;

describe('style parsing & identity', () => {
  it('parses bare tokens and key/value pairs', () => {
    const p = parseStyle('ellipse;whiteSpace=wrap;html=1;fillColor=#fff;');
    expect(p.get('ellipse')).toBe('');
    expect(p.get('fillColor')).toBe('#fff');
  });

  it('ignores presentational keys in vertex identity', () => {
    expect(vertexIdentity('rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;'))
      .toBe(vertexIdentity('rounded=1;html=1;fillColor=#ff0000;align=left;'));
  });

  it('distinguishes ArchiMate appType/archiType', () => {
    const a = vertexIdentity('shape=mxgraph.archimate3.application;appType=comp;archiType=square;');
    const b = vertexIdentity('shape=mxgraph.archimate3.application;appType=serv;archiType=rounded;');
    expect(a).not.toBe(b);
  });

  it('treats dashed borders as part of the identity', () => {
    expect(vertexIdentity('rounded=0;dashed=1;')).not.toBe(vertexIdentity('rounded=0;'));
  });

  it('applies draw.io defaults to edge identity and ignores routing', () => {
    expect(edgeIdentity('html=1;')).toBe(edgeIdentity('endArrow=classic;endFill=1;edgeStyle=orthogonalEdgeStyle;'));
    expect(edgeIdentity('endArrow=open;endFill=0;')).not.toBe(edgeIdentity('endArrow=open;endFill=1;'));
  });
});

describe('readDrawio', () => {
  it('reads plain files and unwraps <object> cells', () => {
    const doc = readDrawio(PALETTE_XML);
    expect(doc.pages).toHaveLength(1);
    const b = doc.pages[0].cells.find(c => c.id === 'b')!;
    expect(b.vertex).toBe(true);
    expect(b.attributes.standardName).toBe('Business Actor');
    expect(b.label).toBe('Ignored label');
  });

  it('reads compressed, multi-page files', () => {
    const inner = PALETTE_XML.replace(/^<mxfile><diagram name="Palette">/, '').replace(/<\/diagram><\/mxfile>$/, '');
    const xml = `<mxfile><diagram name="One">${compress(inner)}</diagram><diagram name="Two">${compress(inner)}</diagram></mxfile>`;
    const doc = readDrawio(xml);
    expect(doc.pages.map(p => p.name)).toEqual(['One', 'Two']);
    expect(doc.pages[1].cells.some(c => c.id === 'a')).toBe(true);
  });

  it('reads bare mxCell fragments', () => {
    const doc = readDrawio('<mxCell id="x" value="&lt;b&gt;Hi&lt;/b&gt;" style="ellipse;" vertex="1" parent="1"/>');
    expect(doc.pages[0].cells[0].label).toBe('Hi');
  });
});

describe('extractStandard', () => {
  const opts = { clientId: 'acme', standardId: 'ba', domain: 'business-architecture' };

  it('captures vertices, containers and connectors, skipping edge labels', () => {
    const { standard } = extractStandard([{ path: 'sources/palette.drawio', content: PALETTE_XML }], opts);
    expect(standard.elements.map(e => e.name)).toEqual(expect.arrayContaining(['Application Component', 'Business Actor', 'Inside']));
    expect(standard.containers.map(e => e.name)).toEqual(['Domain']);
    expect(standard.connectors).toHaveLength(2);
    expect(standard.elements.find(e => e.name === 'Business Actor')!.category).toBe('Business');
    expect(standard.baseNotation).toBe('archimate');
    expect(standard.source.files![0].sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it('names connectors from labels or flags them as needing a name', () => {
    const r = extractStandard([{ path: 'p', content: PALETTE_XML }], opts);
    expect(r.standard.connectors.map(c => c.name)).toContain('Serving');
    expect(r.needsName.some(e => e.kind === 'edge')).toBe(true);
  });

  it('strips per-instance connection points from canonical styles', () => {
    const { standard } = extractStandard([{ path: 'p', content: PALETTE_XML }], opts);
    expect(standard.connectors.find(c => c.name === 'Serving')!.style).not.toContain('exitX');
  });

  it('infers notation from real template files', () => {
    expect(extractStandardFromFiles([ARCHIMATE], opts).standard.baseNotation).toBe('archimate');
    expect(extractStandardFromFiles([BPMN], opts).standard.baseNotation).toBe('bpmn');
  });

  it('honours an explicit notation override', () => {
    expect(extractStandardFromFiles([UML], { ...opts, baseNotation: 'uml' }).standard.baseNotation).toBe('uml');
  });

  it('a source file conforms to the standard extracted from it', () => {
    for (const f of [ARCHIMATE, UML, BPMN]) {
      const s = normaliseStandard(extractStandardFromFiles([f], opts).standard);
      const result = validateStandardConformance(readFileSync(f, 'utf-8'), s);
      expect(result.issues).toEqual([]);
      expect(result.checkedCount).toBeGreaterThan(0);
    }
  });
});

describe('definition validation', () => {
  it('accepts a minimal manual standard using refs', () => {
    const def = {
      id: 'sw', clientId: 'acme', name: 'Software', domain: 'software', baseNotation: 'archimate',
      elements: [{ name: 'App', ref: 'archimate:Application Component' }],
    };
    expect(validateStandardDefinition(def).valid).toBe(true);
    const s = normaliseStandard(def);
    expect(s.elements[0].style).toBe(resolveShape('archimate', 'Application Component')!.style);
    expect(s.elements[0].identity).toBeTruthy();
    expect(s.enforcement).toBe('strict');
    expect(s.source.kind).toBe('manual');
  });

  it('rejects invalid definitions', () => {
    const r = validateStandardDefinition({ id: 'bad id', clientId: 'a', name: 'x', domain: 'd', baseNotation: 'nope', enforcement: 'loose', elements: [{ name: 'X' }] });
    expect(r.valid).toBe(false);
    expect(r.errors.join(' ')).toMatch(/id/);
    expect(r.errors.join(' ')).toMatch(/baseNotation/);
    expect(r.errors.join(' ')).toMatch(/enforcement/);
    expect(r.errors.join(' ')).toMatch(/style.*ref/);
  });

  it('rejects unresolvable refs and empty standards', () => {
    expect(validateStandardDefinition({ id: 'a', clientId: 'b', name: 'c', domain: 'd', baseNotation: 'uml', elements: [{ name: 'x', ref: 'uml:Nonexistent Thing ZZZ' }] }).valid).toBe(false);
    expect(validateStandardDefinition({ id: 'a', clientId: 'b', name: 'c', domain: 'd', baseNotation: 'uml' }).valid).toBe(false);
  });
});

describe('resolver', () => {
  const s = normaliseStandard(extractStandard([{ path: 'p', content: PALETTE_XML }], { clientId: 'acme', standardId: 'ba', domain: 'x' }).standard);

  it('resolves only allowed elements', () => {
    expect(resolveStandardShape(s, 'application component')!.defaultWidth).toBe(150);
    expect(resolveStandardShape(s, 'Business Actor', 'vertex')!.style).toContain('appType=actor');
    expect(resolveStandardShape(s, 'Domain', 'container')).not.toBeNull();
    expect(resolveStandardShape(s, 'Technology Node')).toBeNull();
  });

  it('resolves connectors and aliases', () => {
    expect(resolveStandardConnector(s, 'serving')).not.toBeNull();
    expect(resolveStandardShape(s, 'Ignored label')!.name).toBe('Business Actor');
  });

  it('reports coverage gaps', () => {
    const cov = checkStandardCoverage(s, { elements: ['Application Component', 'Data Lake'], connectors: ['Serving', 'Triggering'] });
    expect(cov.matched.map(m => m.requested)).toEqual(['Application Component', 'Serving']);
    expect(cov.gaps.map(g => g.requested)).toEqual(['Data Lake', 'Triggering']);
  });
});

describe('validateStandardConformance', () => {
  let s: ModellingStandard;
  beforeEach(() => {
    s = normaliseStandard(extractStandard([{ path: 'p', content: PALETTE_XML }], { clientId: 'acme', standardId: 'ba', domain: 'x' }).standard);
  });

  function diagram(nodeStyle: string, edgeStyle = 'endArrow=open;endFill=0;html=1;'): string {
    return wrapWithMxFile(buildDiagramXml({
      nodes: [
        { id: 'n1', label: 'Orders', style: s.elements[0].style, x: 0, y: 0, width: 150, height: 75 },
        { id: 'n2', label: 'Thing', style: nodeStyle, x: 300, y: 0, width: 150, height: 75 },
      ],
      edges: [{ id: 'x1', source: 'n1', target: 'n2', style: edgeStyle }],
      containers: [],
      metadata: {},
    }));
  }

  it('passes a conformant diagram generated with buildDiagramXml', () => {
    const r = validateStandardConformance(diagram(s.elements[1].style), s);
    expect(r.valid).toBe(true);
    expect(r.issues).toHaveLength(0);
    expect(r.matches.n1).toBe(s.elements[0].name);
  });

  it('flags disallowed elements and connectors as errors under strict', () => {
    const r = validateStandardConformance(diagram('shape=mxgraph.archimate3.tech;techType=device;', 'endArrow=diamond;endFill=1;'), s);
    expect(r.valid).toBe(false);
    expect(r.issues.map(i => i.type).sort()).toEqual(['disallowed-connector', 'disallowed-element']);
    expect(r.issues.every(i => i.severity === 'error')).toBe(true);
  });

  it('downgrades to warnings under warn enforcement', () => {
    const r = validateStandardConformance(diagram('ellipse;'), { ...s, enforcement: 'warn' });
    expect(r.valid).toBe(true);
    expect(r.issues[0].severity).toBe('warning');
  });

  it('suggests a close element by label', () => {
    const xml = wrapWithMxFile('<mxCell id="z" value="Application Component" style="ellipse;" vertex="1" parent="1"><mxGeometry width="10" height="10" as="geometry"/></mxCell>');
    expect(validateStandardConformance(xml, s).issues[0].suggestion).toBe('Application Component');
  });

  it('enforces lockElementStyle and lockPalette', () => {
    const recoloured = s.elements[1].style.replace(/fillColor=[^;]+/, 'fillColor=#123456');
    expect(validateStandardConformance(diagram(recoloured), s).issues).toHaveLength(0);
    const locked = { ...s, rules: { lockElementStyle: true, lockPalette: true } };
    const types = validateStandardConformance(diagram(recoloured), locked).issues.map(i => i.type);
    expect(types).toContain('style-mismatch');
    expect(types).toContain('palette-violation');
  });

  it('allows free text only when permitted', () => {
    const xml = diagram('text;html=1;');
    expect(validateStandardConformance(xml, s).valid).toBe(false);
    expect(validateStandardConformance(xml, { ...s, rules: { allowFreeText: true } }).valid).toBe(true);
  });
});

describe('StandardStore', () => {
  let root: string;
  beforeEach(async () => { root = await mkdtemp(join(tmpdir(), 'drawio-clients-')); });
  afterEach(async () => { await rm(root, { recursive: true }); });

  it('resolves the clients dir from env vars', () => {
    const prevC = process.env.MODELLING_CLIENTS_DIR;
    const prevH = process.env.MODELLING_AGENT_HOME;
    try {
      delete process.env.MODELLING_CLIENTS_DIR;
      process.env.MODELLING_AGENT_HOME = '/opt/agent';
      expect(getClientsDir()).toBe('/opt/agent/clients');
      process.env.MODELLING_CLIENTS_DIR = '/srv/clients';
      expect(getClientsDir()).toBe('/srv/clients');
      expect(getClientsDir('/explicit')).toBe('/explicit');
    } finally {
      if (prevC === undefined) delete process.env.MODELLING_CLIENTS_DIR; else process.env.MODELLING_CLIENTS_DIR = prevC;
      if (prevH === undefined) delete process.env.MODELLING_AGENT_HOME; else process.env.MODELLING_AGENT_HOME = prevH;
    }
  });

  it('creates clients, saves, lists and versions standards', () => {
    const store = new StandardStore(root);
    expect(store.listClients()).toEqual([]);
    store.createClient({ id: 'acme', name: 'Acme Corp' });
    expect(() => store.createClient({ id: 'acme', name: 'Again' })).toThrow();
    expect(store.findClient('ACME CORP')!.id).toBe('acme');

    const { standard } = extractStandardFromFiles([ARCHIMATE], { clientId: 'acme', standardId: 'business-architecture', domain: 'business-architecture' });
    expect(store.saveStandard(standard).version).toBe(1);
    expect(store.saveStandard(standard).version).toBe(2);
    expect(existsSync(join(root, 'acme', 'standards', '.history', 'business-architecture.v1.json'))).toBe(true);

    const list = store.listStandards('acme');
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: 'business-architecture', baseNotation: 'archimate', version: 2, sourceKind: 'generated' });
    expect(store.loadStandard('acme', 'business-architecture').elements.length).toBeGreaterThan(0);
  });

  it('loads hand-written standards without id/clientId and copies sources', () => {
    const store = new StandardStore(root);
    store.createClient({ id: 'globex', name: 'Globex' });
    writeFileSync(join(root, 'globex', 'standards', 'software.json'), JSON.stringify({
      name: 'Software', domain: 'software', baseNotation: 'uml',
      connectors: [{ name: 'Association', style: 'endArrow=open;endFill=0;html=1;' }],
    }));
    const s = store.loadStandard('globex', 'software');
    expect(s).toMatchObject({ id: 'software', clientId: 'globex', version: 1 });
    expect(store.copySources('globex', [UML])).toEqual(['sources/template-uml-class-diagram.drawio']);
    expect(readdirSync(join(root, 'globex', 'sources'))).toContain('template-uml-class-diagram.drawio');
  });

  it('rejects unsafe ids', () => {
    const store = new StandardStore(root);
    expect(() => store.loadStandard('../etc', 'x')).toThrow(/Invalid client id/);
    expect(() => store.loadStandard('acme', '../../x')).toThrow(/Invalid standard id/);
  });

  it('ignores directories without client.json', () => {
    mkdirSync(join(root, 'stray'));
    expect(new StandardStore(root).listClients()).toEqual([]);
  });
});

describe('buildStandardPrompt', () => {
  it('lists allowed items and rules', () => {
    const s = normaliseStandard(extractStandard([{ path: 'p', content: PALETTE_XML }], { clientId: 'acme', standardId: 'ba', domain: 'x' }).standard);
    const p = buildStandardPrompt(s, { includeStyles: true });
    expect(p).toContain('acme/ba v1');
    expect(p).toContain('Application Component');
    expect(p).toContain('style: ');
    expect(p).toMatch(/do not invent a shape/);
  });
});

describe('ProjectContext standard binding', () => {
  let storageRoot: string;
  beforeEach(async () => { storageRoot = await mkdtemp(join(tmpdir(), 'drawio-ctx-std-')); });
  afterEach(async () => { await rm(storageRoot, { recursive: true }); });

  it('records client on the project and standard on the model', async () => {
    const ctx = await ProjectContext.open({ storageRoot, projectId: 'p1', client: 'acme' });
    expect((await ctx.projects.get('p1'))!.client).toBe('acme');
    const ref = { clientId: 'acme', standardId: 'ba', version: 3 };
    await ctx.saveModel({ name: 'View', xml: wrapWithMxFile(''), standard: ref });
    expect(await ctx.getModelStandard('view')).toEqual(ref);
    await ctx.saveModel({ name: 'View', xml: wrapWithMxFile(''), standard: { ...ref, version: 4 } });
    expect((await ctx.getModelStandard('View'))!.version).toBe(4);
    expect(await ctx.getModelStandard('missing')).toBeNull();
  });
});
