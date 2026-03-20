# Third-Party Notices

This project incorporates material from the third-party projects listed below.
Each component is used in accordance with its respective licence.

---

## draw.io / diagrams.net

**Component:** Built-in stencil libraries (AWS4, Azure2, GCP2, Cisco19, ArchiMate3, UML, BPMN)
**Source:** https://github.com/jgraph/drawio
**Licence:** Apache License 2.0
**Usage:** The AWS, Azure, GCP, Cisco, ArchiMate, UML, and BPMN notations reference
draw.io's built-in stencil names (e.g. `shape=mxgraph.aws4.*`,
`image=img/lib/azure2/*.svg`). No icon data is embedded — shapes are resolved at
runtime by the draw.io renderer.

---

## jgraph/drawio-libs — Fortinet Shape Library

**Component:** Fortinet Security Fabric SVG icons
**Source:** https://github.com/jgraph/drawio-libs/tree/master/libs/fortinet
**Licence:** Apache License 2.0
**Usage:** The Fortinet notation (`src/notation/fortinet.ts`) embeds base64-encoded SVG
icons from this library. The following library files were used:

- `fortinet-products.xml` — FortiGate, FortiGate VM, FortiManager, FortiAnalyzer,
  FortiWeb, FortiADC, FortiProxy (Base Light variants)
- `fortinet-buildings.xml` — Branch Office, Data Center
- `fortinet-platform-core-elements.xml` — FortiGuard
- `fortinet-solutions-and-deployment-scenarios.xml` — Cloud Firewall
- `fortinet-cloud.xml` — Generic Cloud

**Modifications:** SVG icons were extracted from the draw.io XML library format,
base64-encoded, and embedded as `data:image/svg+xml` data URIs within TypeScript
shape style constants. No modifications were made to the SVG artwork itself.

### Apache License 2.0

```
Copyright (c) JGraph Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

## Fortinet Icon Artwork

**Note:** The Fortinet product icons (FortiGate, FortiManager, FortiAnalyzer, etc.)
are trademarks of Fortinet, Inc. The SVG artwork in the jgraph/drawio-libs repository
is provided for use in technical diagrams. Fortinet trademarks remain the property of
Fortinet, Inc. Use of these icons does not imply endorsement by Fortinet.
