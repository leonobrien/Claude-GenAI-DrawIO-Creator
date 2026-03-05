# Using the `/drawio` Skill

The `/drawio` skill generates draw.io diagrams from natural language prompts. It supports multiple notation libraries (AWS, BPMN, Cisco, UML, and more) and produces `.drawio` files you can open directly in draw.io or diagrams.net.

**How to invoke:** Type `/drawio` followed by a description of the diagram you want.

```
/drawio <your diagram description>
```

The skill will:
1. Interpret your prompt and select the appropriate notation
2. Generate a structured diagram model with nodes, edges, and containers
3. Validate the XML output
4. Export a `.drawio` file you can open and edit

---

## Example 1: AWS Three-Tier Architecture

**What to ask:**
```
/drawio Draw an AWS three-tier architecture with a VPC containing an ALB
in a public subnet, three EC2 instances in a private app subnet, and an
RDS primary with read replica in a private data subnet
```

**What gets generated:**

A layered AWS infrastructure diagram showing a VPC with three subnets (public, private app, private data). Traffic flows from users through the Application Load Balancer, which distributes requests across three EC2 instances. The instances connect to an RDS primary database that replicates to a read replica.

![AWS Three-Tier Architecture](./resources/aws-three-tier.drawio.png)

**Key details:**
- **Notation:** `aws` — uses `mxgraph.aws4` stencils (ELB, EC2, RDS icons)
- **Diagram type:** `infrastructure`
- **Features shown:** VPC/subnet containers, load-balanced fan-out edges, dashed replication link

---

## Example 2: CI/CD Pipeline Flowchart

**What to ask:**
```
/drawio Create a CI/CD pipeline flowchart: Code Commit leads to Build,
then a Tests Pass decision — if yes, deploy to staging, then an approval
gate — if approved, deploy to production and monitor. Failed tests and
rejected deployments loop back to fix and retry.
```

**What gets generated:**

A colour-coded flowchart with the happy path flowing left-to-right. Decision diamonds branch to a "Fix & Retry" node that loops back to the build step. Green nodes mark entry/exit points, blue for processing steps, yellow for decisions, and red for the failure path.

![CI/CD Pipeline Flowchart](./resources/cicd-pipeline.drawio.png)

**Key details:**
- **Notation:** `generic` — standard draw.io shapes (rounded rectangles, diamonds)
- **Diagram type:** `flowchart`
- **Features shown:** Decision branching, feedback loops, colour coding by purpose

---

## Example 3: BPMN Order Processing Workflow

**What to ask:**
```
/drawio Create a BPMN order processing workflow in a pool: start event,
receive order (user task), validate with exclusive gateway — valid orders
go to process payment (service task) then ship order then end event,
invalid orders go to reject order (send task) then a separate end event
```

**What gets generated:**

A BPMN 2.0 process diagram inside a swimlane pool. The flow uses proper BPMN shapes: circle start/end events, rounded-rectangle tasks with role markers (user, service, send), and a diamond exclusive gateway for the validation decision.

![BPMN Order Processing Workflow](./resources/bpmn-order-processing.drawio.png)

**Key details:**
- **Notation:** `bpmn` — uses `mxgraph.bpmn` stencils (events, tasks, gateways)
- **Diagram type:** `flowchart`
- **Features shown:** Swimlane pool, typed task markers, exclusive gateway with labelled branches

---

## Example 4: Cisco Network Topology

**What to ask:**
```
/drawio Draw a Cisco network diagram: Internet connects to a firewall,
then a core router inside a data centre container. The router connects to
two multilayer switches, each connecting to servers and desktops. Label
links with speeds.
```

**What gets generated:**

A top-down network topology using official Cisco icons. The Internet cloud sits outside the data centre container. Traffic flows through the firewall to a core router, which fans out to two distribution switches. Each switch connects to endpoint devices with link speed labels.

![Cisco Network Topology](./resources/cisco-network.drawio.png)

**Key details:**
- **Notation:** `cisco` — uses `mxgraph.cisco19` stencils (router, switch, firewall, server, desktop)
- **Diagram type:** `infrastructure`
- **Features shown:** Dashed container for network zone, Cisco teal colour scheme, link speed labels

---

## Example 5: UML Class Diagram

**What to ask:**
```
/drawio Create a UML class diagram with an IRepository interface that has
findById and save methods. UserRepository and OrderRepository implement it.
User and Order are entity classes with fields and methods. User composes
Orders.
```

**What gets generated:**

A UML 2.x class diagram with five classes arranged in an inheritance hierarchy. The interface sits at the top with dashed realisation arrows from the two repository classes. Entity classes sit below with association and composition relationships.

![UML Class Diagram](./resources/uml-class-diagram.drawio.png)

**Key details:**
- **Notation:** `uml` — native draw.io UML shapes (swimlane classes, text compartments)
- **Diagram type:** `generic`
- **Features shown:** Interface realisation (dashed block arrows), composition (filled diamond), class compartments with fields/methods

---

## Supported Notations

| Notation | Stencil Library | Best For |
|----------|----------------|----------|
| `generic` | Built-in draw.io | Flowcharts, org charts, general diagrams |
| `aws` | `mxgraph.aws4` | AWS architecture diagrams |
| `azure` | `azure2` SVGs | Azure architecture diagrams |
| `gcp` | `mxgraph.gcp2` | Google Cloud architecture diagrams |
| `cisco` | `mxgraph.cisco19` | Network topology diagrams |
| `archimate` | `mxgraph.archimate3` | Enterprise architecture (ArchiMate 3.x) |
| `uml` | Native UML shapes | Class, sequence, component, activity diagrams |
| `bpmn` | `mxgraph.bpmn` | Business process workflows |

You don't need to specify the notation explicitly — the skill infers it from your prompt. Mentioning "AWS", "Cisco", "BPMN", or "UML" in your description is enough.
