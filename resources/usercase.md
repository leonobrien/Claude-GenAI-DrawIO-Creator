 

# Cloud Management and Policy Enforcement 

 

+----------------+-------------------------------------------------------+
| **Scenario     | **Management-group policy guardrails **               |
| {#}**          |                                                       |
+================+=======================================================+
| Short          | The Management-group hierarchy, defines consistent    |
| Description    | policy and controls that are inherited across         |
|                | provisioned subscriptions                             |
|                | (platforms/applications/environments) and associated  |
|                | landing zones to increase standardisation of          |
|                | identity, networking, and management controls across  |
|                | the cloud environment.                                |
|                |                                                       |
|                |                                                       |
+----------------+-------------------------------------------------------+
| Goal/s         | - Clear segmentation and ownership delineation across |
|                |   platform and application zones                      |
|                |                                                       |
|                | - Enforcement of deployment                           |
|                |   region/s, sku\'s authorised by policy within the    |
|                |   management group                                    |
|                |                                                       |
|                | - Reduced dependence on engineering and operations    |
|                |   through automation                                  |
|                |                                                       |
|                | - Security controls automatically and consistently    |
|                |   applied                                             |
|                |                                                       |
|                | - Restrict \"shadow IT\" to only approved Azure       |
|                |   resources                                           |
|                |                                                       |
|                | -                                                     |
+----------------+-------------------------------------------------------+
| Actors         | - Enterprise/Solution Architect                       |
|                |                                                       |
|                | - Cloud Engineer                                      |
|                |                                                       |
|                | - Security Engineer                                   |
|                |                                                       |
|                | - Infrastructure Operations Engineer                  |
|                |                                                       |
|                | - IT Service Manager                                  |
+----------------+-------------------------------------------------------+
| Illustration   |                                                       |
+----------------+-------------------------------------------------------+
| Information    |                                                       |
| Required       |                                                       |
+----------------+-------------------------------------------------------+
| Related User   | - Network and Service/Platform provisioning           |
| Needs          |   guardrails are enforced                             |
|                |                                                       |
|                | - IT Operations has reduced manual intervention and   |
|                |   increased agility in response to new service        |
|                |   requests from the business                          |
|                |                                                       |
|                | - Provisioning of services by engineers and/or        |
|                |   developers is restricted by Azure Policy to only    |
|                |   approved services/platforms/applications            |
|                |   (Azure sku\'s)                                      |
|                |                                                       |
|                | - Changes to approved Azure sku\'s are applied to     |
|                |   Management account upon IT governance approval      |
|                |   (external process)                                  |
|                |                                                       |
|                | - Logging, monitoring, security and audit controls    |
|                |   are automatically deployed within subscriptions     |
|                |                                                       |
|                | - Policy and control updates to the Management Group  |
|                |   are automatically applicate across contained        |
|                |   subscriptions                                       |
|                |                                                       |
|                | - Sentinel on-boarding of new services is automated   |
|                |                                                       |
|                | - IT Service management and FinOps specialist can     |
|                |   rely on consistent tagging to enable cost analysis, |
|                |   breakdown and show/charge-back accounting across    |
|                |   cloud environments                                  |
+----------------+-------------------------------------------------------+

+----------------+-----------------------------------------------------+
| **Scenario     | **Automated subscription provisioning**             |
| {#}**          |                                                     |
+================+=====================================================+
| Short          | The Environment lifecycle is automated and change   |
| Description    | is managed                                          |
+----------------+-----------------------------------------------------+
| Goal/s         | - Automated subscription creation supported in      |
|                |   management group                                  |
|                |                                                     |
|                | - Subscription creation have consistent policy      |
|                |   sets, RBAC, budget alerts                         |
|                |                                                     |
|                | - Integration with ServiceNow ensures change gates  |
|                |   drive pipeline promotion (dev\--\>test\--\>prod)  |
+----------------+-----------------------------------------------------+
| Actors         | - Cloud Engineer                                    |
|                |                                                     |
|                | - Infrastructure Operations                         |
|                |                                                     |
|                | - Change and Release Manager                        |
|                |                                                     |
|                | - Business/Service Owner                            |
+----------------+-----------------------------------------------------+
| Illustration   |                                                     |
+----------------+-----------------------------------------------------+
| Information    |                                                     |
| Required       |                                                     |
+----------------+-----------------------------------------------------+
| Related User   | - Subscription provisioning is automated,           |
| Needs          |   consistent and has baseline security policy and   |
|                |   controls applied                                  |
|                |                                                     |
|                | - Teams can select from subscription creation item  |
|                |   in ServiceNow service catalogue                   |
|                |                                                     |
|                | - Service Catalogue has predefined, approved        |
|                |   subscription configurations and an option for     |
|                |   custom.                                           |
|                |                                                     |
|                | - Internal approval workflow for subscription       |
|                |   creation is facilitated in ServiceNow and         |
|                |   required Business Owner approval, Service Owner   |
|                |   approval and Change/Release Manager approval.     |
|                |                                                     |
|                | - Pre-approved subscription configurations are      |
|                |   authorised for automated creation post successful |
|                |   approvals workflow.                               |
|                |                                                     |
|                | - ServiceNow connector for Azure is used to         |
|                |   initiate creation of subscription post workflow   |
|                |   approvals.                                        |
|                |                                                     |
|                | - Infrastructure Operations monitor subscription    |
|                |   creation events and respond to automation         |
|                |   failures.                                         |
|                |                                                     |
|                | - Custom subscription configurations require        |
|                |   design, assurance and separate change approval    |
|                |   (external process).                               |
|                |                                                     |
|                | <!-- -->                                            |
|                |                                                     |
|                | -                                                   |
+----------------+-----------------------------------------------------+

  

+----------------+-----------------------------------------------------+
| **Scenario     | **Automated policy compliance**                     |
| {#}**          |                                                     |
+================+=====================================================+
| Short          | Resources are automatically evaluated against       |
| Description    | policy and required or missing resources or         |
|                | configurations are deployed to maintain             |
|                | compliance.                                         |
+----------------+-----------------------------------------------------+
| Goal/s         | - Prevents compliance drift over time               |
|                |                                                     |
|                | - Remediates risks with authorised users knowingly  |
|                |   or unknowingly removing essential services.       |
|                |                                                     |
|                | - Ensures required logging, monitoring, encryption, |
|                |   agents and settings meet baseline                 |
|                |                                                     |
|                | - Automate vulnerability assessment and             |
|                |   remediation                                       |
+----------------+-----------------------------------------------------+
| Actors         | - Security Engineer                                 |
|                |                                                     |
|                | - IT Operations Engineer                            |
|                |                                                     |
|                | - Cloud Engineer                                    |
+----------------+-----------------------------------------------------+
| Illustration   |                                                     |
+----------------+-----------------------------------------------------+
| Information    |                                                     |
| Required       |                                                     |
+----------------+-----------------------------------------------------+
| Related User   | - Security engineer and Cloud Engineers define      |
| Needs          |   baseline policy conditions and templates          |
|                |                                                     |
|                | - Cloud Engineer ensures policy is deployed and     |
|                |   used across subscriptions                         |
|                |                                                     |
|                | - Operations Engineer and Security Engineer monitor |
|                |   compliance alerts.                                |
+----------------+-----------------------------------------------------+

 

# Provisioning and Automation 

+----------------+------------------------------------------------------+
| **Scenario     | - **Infrastructure as Code provisioning**            |
| {#}**          |                                                      |
+================+======================================================+
| Short          | In this scenario, cloud infrastructure provisioning  |
| Description    | is defined in code (Bicep IaC) where security,       |
|                | compliance and policy is automatically enforced      |
|                | prior to infrastructure creation in the cloud        |
|                | environment.                                         |
|                |                                                      |
|                |                                                      |
+----------------+------------------------------------------------------+
| Goal/s         | - All platform, network and workload resources       |
|                |   deployed via IaC to reduce manual deployment:      |
|                |   achieve consistent, reliable infrastructure        |
|                |   releases                                           |
|                |                                                      |
|                | - Diagnostics/Monitoring, resource naming and        |
|                |   tagging, security baselines enforced               |
|                |                                                      |
|                | - Release pipelines enforce segregation of duties    |
|                |   with pipeline approvals/gates                      |
|                |                                                      |
|                | - Reduce Click-Ops management of cloud resources     |
|                |   across environments                                |
|                |                                                      |
|                |                                                      |
+----------------+------------------------------------------------------+
| Actors         | - Cloud Engineer                                     |
|                |                                                      |
|                | - Security Engineer                                  |
|                |                                                      |
|                | - Release/Change Manager                             |
|                |                                                      |
|                | - IT Governance                                      |
+----------------+------------------------------------------------------+
| Illustration   |                                                      |
+----------------+------------------------------------------------------+
| Information    |                                                      |
| Required       |                                                      |
+----------------+------------------------------------------------------+
| Related User   | - Cloud Engineers define and maintain Bicep          |
| Needs          |   templates, modules used for standardisation of     |
|                |   code, reducing coding effort and deployment        |
|                |   consistency - including minimum tagging            |
|                |   requirement, naming standard, security controls    |
|                |                                                      |
|                |   - Bicep modules are shared and accessible to       |
|                |     authorised engineers for reuse.                  |
|                |                                                      |
|                | - Cloud Engineers use Azure DevOps Project and       |
|                |   Repository for storage of Bicep code resources,    |
|                |   version control, releases, and code reviews        |
|                |   (through Pull Requests).                           |
|                |                                                      |
|                | - Cloud Engineers use Azure DevOps pipelines for     |
|                |   testing Bicep code and evaluating compliance with  |
|                |   standard, and use of approved Cloud resources      |
|                |                                                      |
|                | - Release/Change Manager and Cloud Engineers ensure  |
|                |   Azure DevOps pipelines are configured with         |
|                |   approvals gates to reduce risks to release failure |
|                |   or outages                                         |
+----------------+------------------------------------------------------+

   

+----------------+-----------------------------------------------------+
| **Scenario     | **Controlled deployment across environments**       |
| {#}**          |                                                     |
+================+=====================================================+
| Short          | Deployments into Azure cloud are evaluated and      |
| Description    | tested across environments before progression to    |
|                | production and integrate with change management     |
|                | practices                                           |
+----------------+-----------------------------------------------------+
| Goal/s         | - Reduce risk to production outages due to errors   |
|                |   in IaC resources                                  |
|                |                                                     |
|                | - Change management control is inherent in          |
|                |   automation process                                |
|                |                                                     |
|                | - Increase visibility to environment and code       |
|                |   change history                                    |
+----------------+-----------------------------------------------------+
| Actors         | - Cloud  Engineer                                   |
|                |                                                     |
|                | - Change and Release Manager                        |
+----------------+-----------------------------------------------------+
| Illustration   |                                                     |
+----------------+-----------------------------------------------------+
| Information    |                                                     |
| Required       |                                                     |
+----------------+-----------------------------------------------------+
| Related User   | - Cloud engineer uses IaC to define deployment      |
| Needs          |   scripts and reusable templates                    |
|                |                                                     |
|                | - Cloud Engineer manages deployment scripts in a    |
|                |   formal code repository                            |
|                |                                                     |
|                | - Cloud Engineer configures core repositories for   |
|                |   deployment scripts to require code review and     |
|                |   approval (Pull Requests)                          |
|                |                                                     |
|                | - Cloud Engineer ensure release pipeline test       |
|                |   scripts before execution, pipelines fail upon     |
|                |   error condition                                   |
|                |                                                     |
|                | - Cloud engineer configures release pipelines       |
|                |   across environments (test/pre-prod) to prevent    |
|                |   direct release to production                      |
|                |                                                     |
|                | - Change/Release Manager ensures pipelines stage    |
|                |   gates required approvals                          |
|                |                                                     |
|                | - Change/Release Manager can confirm releases were  |
|                |   complete and have been automatically verified     |
|                |   against change ticket in Service Now              |
+----------------+-----------------------------------------------------+

 

# Unified monitoring and governance

+----------------+-----------------------------------------------------+
| **Scenario     | **\"Single Pane of Glass\" Operational Monitoring** |
| {#}**          |                                                     |
+================+=====================================================+
| Short          | Deployment of a unified visualisation layer that    |
| Description    | aggregates real-time performance, health, and event |
|                | data from Azure native services, on-premises        |
|                | assets, and third-party infrastructure (Cisco,      |
|                | Fortinet etc).                                      |
+----------------+-----------------------------------------------------+
| Goal/s         | - Establish a real-time, high-density \"NOC-style\" |
|                |   dashboard for the entire hybrid cloud landscape.  |
|                |                                                     |
|                | - Reduce incident detection delays by correlating   |
|                |   cross-platform telemetry (e.g., App performance   |
|                |   vs. Network latency).                             |
|                |                                                     |
|                | - Provide non-Azure Portal users                    |
|                |   (Leadership/Service Desk) with secure, read-only  |
|                |   visibility into system health.                    |
|                |                                                     |
|                | - Ensure data consistency across cloud and          |
|                |   on-premises silos through a single visualisation  |
|                |   engine.                                           |
+----------------+-----------------------------------------------------+
| Actors         | - Enterprise/Solution Architect,                    |
|                |                                                     |
|                | - Cloud Engineer,                                   |
|                |                                                     |
|                | - Infrastructure Operations Engineer,               |
|                |                                                     |
|                | - IT Service Manager                                |
+----------------+-----------------------------------------------------+
| Illustration   |                                                     |
+----------------+-----------------------------------------------------+
| Information    |                                                     |
| Required       |                                                     |
+----------------+-----------------------------------------------------+
| Related User   | - Visual correlation of on-premises hardware health |
| Needs          |   alongside Azure application performance.          |
|                |                                                     |
|                | - Automatic dashboard updates when new Azure Arc    |
|                |   resources are on-boarded.                         |
|                |                                                     |
|                | - Standardised metric visualisation for hybrid      |
|                |   workloads (Hyper-V and SQL).                      |
|                |                                                     |
|                | - Separation of operational dashboards from         |
|                |   sensitive security logs or administrative portal  |
|                |   access.                                           |
+----------------+-----------------------------------------------------+

+----------------+-----------------------------------------------------+
| **Scenario     | **Integrated Incident Management (SIEM/ITSM)**      |
| {#}**          |                                                     |
+================+=====================================================+
| Short          | Automated lifecycle management of security and      |
| Description    | operational events where detected anomalies trigger |
|                | incident creation in ServiceNow.                    |
+----------------+-----------------------------------------------------+
| Goal/s         | - Eliminate manual ticket creation for critical     |
|                |   infrastructure failures.                          |
|                |                                                     |
|                | - Implement \"Signal-to-Noise\" filtering using     |
|                |   Data Collection Rules (DCRs) to prevent           |
|                |   ServiceNow bloat.                                 |
|                |                                                     |
|                | - Enable bi-directional synchronisation between     |
|                |   Azure alerts and ServiceNow tickets for           |
|                |   consistent audit trails.                          |
|                |                                                     |
|                | - Automate diagnostic data attachment to ServiceNow |
|                |   incidents.                                        |
+----------------+-----------------------------------------------------+
| Actors         | - Security Engineer,                                |
|                |                                                     |
|                | - SecOps Analyst,                                   |
|                |                                                     |
|                | - IT Service Manager,                               |
|                |                                                     |
|                | - Cloud Engineer.                                   |
+----------------+-----------------------------------------------------+
| Illustration   |                                                     |
+----------------+-----------------------------------------------------+
| Information    |                                                     |
| Required       |                                                     |
+----------------+-----------------------------------------------------+
| Related User   | - Immediate Notification: Service Desk and On-call  |
| Needs          |   engineers require instant ticket generation when  |
|                |   critical thresholds are breached.                 |
|                |                                                     |
|                | - Actionable Context: Analysts need the \"why\"     |
|                |   (diagnostic logs/KQL results) attached directly   |
|                |   to the ticket to avoid pivoting between multiple  |
|                |   portals.                                          |
|                |                                                     |
|                | - Status Synchronisation: IT Service Managers       |
|                |   require that closing a ticket in ServiceNow       |
|                |   automatically resolves the alert in Azure to      |
|                |   maintain a single source of truth.                |
|                |                                                     |
|                | - Impact Visibility: Incident Managers need the     |
|                |   ticket to automatically map the affected resource |
|                |   to a ServiceNow Configuration Item (CI) for       |
|                |   accurate impact analysis                          |
+----------------+-----------------------------------------------------+

+----------------+-----------------------------------------------------+
| **Scenario     | **Hybrid Control Plane & Policy Enforcement**       |
| {#}**          |                                                     |
+================+=====================================================+
| Short          | Extend Azure Governance and monitoring agents (AMA) |
| Description    | to on-premises Hyper-V clusters, SQL servers, and   |
|                | Citrix environments to ensure compliance with       |
|                | enterprise guardrails.                              |
+----------------+-----------------------------------------------------+
| Goal/s         | - Enforce \"Management-group policy guardrails\"    |
|                |   consistently across on-premises and cloud assets. |
|                |                                                     |
|                | - Automate the deployment of the Azure Monitor      |
|                |   Agent (AMA) to all local servers via Azure        |
|                |   Policy.                                           |
|                |                                                     |
|                | - Restrict \"shadow IT\" by ensuring only approved  |
|                |   monitoring and security configurations are        |
|                |   active.                                           |
|                |                                                     |
|                | - Centralise patch management and compliance        |
|                |   reporting for the hybrid fleet.                   |
+----------------+-----------------------------------------------------+
| Actors         | - Enterprise/Solution Architect,                    |
|                |                                                     |
|                | - Infrastructure Operations Engineer,               |
|                |                                                     |
|                | - Cloud Engineer,                                   |
|                |                                                     |
|                | - Security Engineer.                                |
+----------------+-----------------------------------------------------+
| Illustration   |                                                     |
+----------------+-----------------------------------------------------+
| Information    |                                                     |
| Required       |                                                     |
+----------------+-----------------------------------------------------+
| Related User   | - Network and Service provisioning guardrails are   |
| Needs          |   enforced regardless of physical location.         |
|                |                                                     |
|                | - IT Operations has reduced manual intervention     |
|                |   through automated agent deployment and health     |
|                |   checks.                                           |
|                |                                                     |
|                | - Logging and audit controls are automatically      |
|                |   deployed within new subscriptions and Arc-enabled |
|                |   servers.                                          |
|                |                                                     |
|                | - Changes to approved Azure SKUs/services are       |
|                |   reflected in on-premises management profiles upon |
|                |   governance approval.                              |
+----------------+-----------------------------------------------------+
