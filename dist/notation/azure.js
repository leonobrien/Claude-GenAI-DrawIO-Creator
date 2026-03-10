/**
 * Azure notation — Microsoft Azure Architecture icon shapes.
 *
 * Uses the official draw.io azure2 image library at img/lib/azure2/.
 * Each shape references an SVG icon via the image= style property.
 */
/** Base style applied to all Azure icon shapes. */
const AZURE_ICON_BASE = 'aspect=fixed;html=1;points=[];align=center;image;fontSize=12;';
/** Helper to build a full Azure icon style string. */
function azureIcon(svgPath) {
    return `${AZURE_ICON_BASE}image=${svgPath};`;
}
export const azureNotation = {
    name: 'azure',
    displayName: 'Azure Architecture',
    stencilPrefix: 'img/lib/azure2',
    description: 'Azure Architecture diagrams using official Azure service icons from the draw.io azure2 image library (img/lib/azure2/).',
    shapes: [
        // Compute
        {
            name: 'Virtual Machine',
            style: azureIcon('img/lib/azure2/compute/Virtual_Machine.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'compute',
        },
        {
            name: 'App Service',
            style: azureIcon('img/lib/azure2/compute/App_Services.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'compute',
        },
        {
            name: 'Azure Functions',
            style: azureIcon('img/lib/azure2/compute/Function_Apps.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'compute',
        },
        {
            name: 'AKS',
            style: azureIcon('img/lib/azure2/containers/Kubernetes_Services.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'containers',
        },
        // Storage
        {
            name: 'Storage Account',
            style: azureIcon('img/lib/azure2/storage/Storage_Accounts.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'storage',
        },
        // Databases
        {
            name: 'SQL Database',
            style: azureIcon('img/lib/azure2/databases/SQL_Database.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'databases',
        },
        {
            name: 'Cosmos DB',
            style: azureIcon('img/lib/azure2/databases/Azure_Cosmos_DB.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'databases',
        },
        {
            name: 'Data Factory',
            style: azureIcon('img/lib/azure2/databases/Data_Factory.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'databases',
        },
        // Networking
        {
            name: 'Virtual Network',
            style: azureIcon('img/lib/azure2/networking/Virtual_Networks.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'networking',
        },
        {
            name: 'Load Balancer',
            style: azureIcon('img/lib/azure2/networking/Load_Balancers.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'networking',
        },
        {
            name: 'Application Gateway',
            style: azureIcon('img/lib/azure2/networking/Application_Gateways.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'networking',
        },
        {
            name: 'CDN',
            style: azureIcon('img/lib/azure2/networking/CDN_Profiles.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'networking',
        },
        {
            name: 'Front Door',
            style: azureIcon('img/lib/azure2/networking/Front_Doors.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'networking',
        },
        // Integration
        {
            name: 'API Management',
            style: azureIcon('img/lib/azure2/integration/API_Management_Services.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'integration',
        },
        {
            name: 'Logic Apps',
            style: azureIcon('img/lib/azure2/integration/Logic_Apps.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'integration',
        },
        {
            name: 'Service Bus',
            style: azureIcon('img/lib/azure2/integration/Service_Bus.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'integration',
        },
        {
            name: 'Event Grid Topics',
            style: azureIcon('img/lib/azure2/integration/Event_Grid_Topics.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'integration',
        },
        // Analytics (Event Hubs lives here in azure2)
        {
            name: 'Event Hubs',
            style: azureIcon('img/lib/azure2/analytics/Event_Hubs.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'analytics',
        },
        // Security
        {
            name: 'Key Vault',
            style: azureIcon('img/lib/azure2/security/Key_Vaults.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'security',
        },
        // Monitor
        {
            name: 'Azure Monitor',
            style: azureIcon('img/lib/azure2/monitor/SAP_Azure_Monitor.svg'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'monitor',
        },
    ],
    styleTemplates: {
        vertex: `${AZURE_ICON_BASE}image=img/lib/azure2/general/Module.svg;`,
        edge: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;',
        container: 'rounded=1;whiteSpace=wrap;html=1;dashed=1;dashPattern=5 5;fillColor=none;strokeColor=#0078D4;verticalAlign=top;fontStyle=1;fontSize=12;',
        labelEdge: 'edgeStyle=orthogonalEdgeStyle;rounded=1;endArrow=classic;html=1;strokeColor=#0078D4;fontSize=10;',
    },
    colours: {
        compute: { fillColor: '#0078D4', strokeColor: '#0078D4' },
        storage: { fillColor: '#0078D4', strokeColor: '#0078D4' },
        databases: { fillColor: '#0078D4', strokeColor: '#0078D4' },
        networking: { fillColor: '#0078D4', strokeColor: '#0078D4' },
        integration: { fillColor: '#0078D4', strokeColor: '#0078D4' },
        security: { fillColor: '#E3008C', strokeColor: '#E3008C' },
        monitor: { fillColor: '#50E6FF', strokeColor: '#50E6FF' },
        analytics: { fillColor: '#A4262C', strokeColor: '#A4262C' },
    },
    layout: {
        preferredFlow: 'left-right',
        usesContainers: true,
        suggestedGap: 60,
        hints: [
            'Group resources by resource group or virtual network using containers',
            'Place internet-facing services on the left, backend services on the right',
            'Use Azure blue (#0078D4) as the primary edge colour',
            'Label edges with protocols (HTTPS, TCP, etc.)',
            'Align tiers vertically within a left-to-right flow',
        ],
    },
    fewShotExample: [
        '<mxCell id="2" value="Resource Group" style="rounded=1;whiteSpace=wrap;html=1;dashed=1;dashPattern=5 5;fillColor=none;strokeColor=#0078D4;verticalAlign=top;fontStyle=1;fontSize=12;" vertex="1" connectable="0" parent="1">',
        '  <mxGeometry x="40" y="40" width="700" height="400" as="geometry"/>',
        '</mxCell>',
        `<mxCell id="3" value="App Gateway" style="${azureIcon('img/lib/azure2/networking/Application_Gateways.svg')}" vertex="1" parent="2">`,
        '  <mxGeometry x="50" y="170" width="50" height="50" as="geometry"/>',
        '</mxCell>',
        `<mxCell id="4" value="App Service" style="${azureIcon('img/lib/azure2/compute/App_Services.svg')}" vertex="1" parent="2">`,
        '  <mxGeometry x="280" y="170" width="50" height="50" as="geometry"/>',
        '</mxCell>',
        `<mxCell id="5" value="SQL DB" style="${azureIcon('img/lib/azure2/databases/SQL_Database.svg')}" vertex="1" parent="2">`,
        '  <mxGeometry x="510" y="170" width="50" height="50" as="geometry"/>',
        '</mxCell>',
        '<mxCell id="6" style="endArrow=classic;html=1;strokeColor=#0078D4;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="3" target="4">',
        '  <mxGeometry relative="1" as="geometry"/>',
        '</mxCell>',
        '<mxCell id="7" style="endArrow=classic;html=1;strokeColor=#0078D4;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="4" target="5">',
        '  <mxGeometry relative="1" as="geometry"/>',
        '</mxCell>',
    ].join('\n'),
    promptRules: [
        'Use image=img/lib/azure2/<category>/<Service>.svg for all Azure service icons',
        'Apply base style: aspect=fixed;html=1;points=[];align=center;image;fontSize=12;',
        'Group resources inside resource group or virtual network containers',
        'Use Azure blue (#0078D4) for edges and container borders',
        'Place internet-facing services at the top or left of the diagram',
        'Show data flow direction with arrows — typically left-to-right or top-to-bottom',
    ],
};
//# sourceMappingURL=azure.js.map