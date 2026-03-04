# Attribution

This project is inspired by and builds upon the following work:

## Research Paper

**GenAI-DrawIO-Creator: A Framework for Automated Diagram Generation**
Jinze Yu, Dayuan Jiang
AWS Generative AI Innovation Center, Japan
arXiv:2601.05162v1 [cs.GR], 8 January 2026

The paper introduces a framework for transforming natural language descriptions into fully editable draw.io diagrams using Large Language Models. Key contributions adopted in this project include the specialised system prompt design, XML validation and correction pipeline, and the iterative revision loop with version history.

A copy of the paper is stored at `resources/2601.05162v1.pdf`.

## Reference Implementation

**next-ai-draw-io** by Dayuan Jiang
https://github.com/DayuanJiang/next-ai-draw-io

A Next.js web application that integrates Claude 3.7 (via Amazon Bedrock) with an embedded draw.io editor. This project adapts the core XML generation, validation, and revision logic from this reference implementation into a standalone Claude Code skill, removing the dependency on a web application and MCP server infrastructure.

## Licence Compliance

The reference implementation is publicly available on GitHub. This project is an independent reimplementation of the techniques described in the paper and does not copy source code directly. Where architectural patterns have been adopted, they have been re-engineered for the Claude Code skill context.
