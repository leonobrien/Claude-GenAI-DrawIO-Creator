# Attribution

This project is inspired by and builds upon the following work:

## Research Paper

**GenAI-DrawIO-Creator: A Framework for Automated Diagram Generation**
Jinze Yu, Dayuan Jiang
AWS Generative AI Innovation Center, Japan
arXiv:2601.05162v1 [cs.GR], 8 January 2026

The paper introduces a framework for transforming natural language descriptions into fully editable draw.io diagrams using Large Language Models. Key contributions adopted in this project include the specialised system prompt design, XML validation and correction pipeline, and the iterative revision loop with version history.

The paper is published at [GenAI-DrawIO-Creator A Framework for Automated Diagram Generation](https://arxiv.org/html/2601.05162v1) or available as PDF here [resources/2601.05162v1.pdf](resources/2601.05162v1.pdf).

## Reference Implementation

**next-ai-draw-io** by Dayuan Jiang
https://github.com/DayuanJiang/next-ai-draw-io

A Next.js web application that integrates Claude 3.7 (via Amazon Bedrock) with an embedded draw.io editor. This project adapts the core XML generation, validation, and revision logic from this reference implementation into a standalone Claude Code skill, removing the dependency on a web application and MCP server infrastructure.

## Shape Libraries

### draw.io Built-in Stencils

The AWS, Azure, GCP, Cisco, ArchiMate, UML, and BPMN notation modules reference
draw.io's built-in stencil libraries by name. No icon data is embedded — the draw.io
renderer resolves shapes at runtime. draw.io is licensed under Apache-2.0 by JGraph Ltd.

### Fortinet Icons — jgraph/drawio-libs

**Source:** https://github.com/jgraph/drawio-libs/tree/master/libs/fortinet
**Licence:** Apache License 2.0

The Fortinet notation embeds SVG icons from the jgraph/drawio-libs extra libraries
repository. These are Inkscape-sourced vector icons covering FortiGate, FortiManager,
FortiAnalyzer, FortiWeb, FortiADC, FortiProxy, and environment shapes (Branch Office,
Data Center, FortiGuard, Cloud Firewall, Generic Cloud).

See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for full licence text and details.

## Licence Compliance

The reference implementation is publicly available on GitHub. This project is an independent reimplementation of the techniques described in the paper and does not copy source code directly. Where architectural patterns have been adopted, they have been re-engineered for the Claude Code skill context.
