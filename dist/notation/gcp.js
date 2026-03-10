/**
 * GCP notation — Google Cloud Platform architecture icon shapes.
 *
 * Uses the mxgraph.gcp2 stencil library for official GCP service icons.
 * Each shape uses shape=mxgraph.gcp2.<shapeName> with standard sizing.
 */
/** Base style applied to all GCP icon shapes. */
const GCP_ICON_BASE = 'sketch=0;html=1;aspect=fixed;strokeColor=none;shadow=0;align=center;verticalLabelPosition=bottom;verticalAlign=top;fontSize=12;';
/** Helper to build a full GCP icon style string. */
function gcpIcon(shapeName, fillColor) {
    return `${GCP_ICON_BASE}fillColor=${fillColor};shape=mxgraph.gcp2.${shapeName};`;
}
/** GCP category colours (from Google Cloud brand guidelines). */
const COLOUR = {
    compute: '#4285F4',
    storage: '#4285F4',
    database: '#4285F4',
    networking: '#4285F4',
    analytics: '#4285F4',
    ai: '#4285F4',
    security: '#4285F4',
    management: '#4285F4',
    integration: '#4285F4',
};
export const gcpNotation = {
    name: 'gcp',
    displayName: 'Google Cloud Platform',
    stencilPrefix: 'mxgraph.gcp2',
    description: 'Google Cloud Platform architecture diagrams using official GCP service icons from the mxgraph.gcp2 stencil library.',
    shapes: [
        // Compute
        {
            name: 'Compute Engine',
            style: gcpIcon('compute_engine', COLOUR.compute),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'compute',
        },
        {
            name: 'Cloud Functions',
            style: gcpIcon('cloud_functions', COLOUR.compute),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'compute',
        },
        {
            name: 'Cloud Run',
            style: gcpIcon('cloud_run', COLOUR.compute),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'compute',
        },
        {
            name: 'App Engine',
            style: gcpIcon('app_engine', COLOUR.compute),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'compute',
        },
        {
            name: 'GKE',
            style: gcpIcon('container_engine', COLOUR.compute),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'compute',
        },
        // Storage
        {
            name: 'Cloud Storage',
            style: gcpIcon('cloud_storage', COLOUR.storage),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'storage',
        },
        {
            name: 'Persistent Disk',
            style: gcpIcon('persistent_disk', COLOUR.storage),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'storage',
        },
        {
            name: 'Filestore',
            style: gcpIcon('cloud_filestore', COLOUR.storage),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'storage',
        },
        // Database
        {
            name: 'Cloud SQL',
            style: gcpIcon('cloud_sql', COLOUR.database),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'database',
        },
        {
            name: 'Cloud Spanner',
            style: gcpIcon('cloud_spanner', COLOUR.database),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'database',
        },
        {
            name: 'Cloud Bigtable',
            style: gcpIcon('cloud_bigtable', COLOUR.database),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'database',
        },
        {
            name: 'Firestore',
            style: gcpIcon('cloud_firestore', COLOUR.database),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'database',
        },
        {
            name: 'Memorystore',
            style: gcpIcon('cloud_memorystore', COLOUR.database),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'database',
        },
        // Networking
        {
            name: 'Cloud Load Balancing',
            style: gcpIcon('cloud_load_balancing', COLOUR.networking),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'networking',
        },
        {
            name: 'Cloud CDN',
            style: gcpIcon('cloud_cdn', COLOUR.networking),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'networking',
        },
        {
            name: 'Cloud DNS',
            style: gcpIcon('cloud_dns', COLOUR.networking),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'networking',
        },
        {
            name: 'Cloud VPN',
            style: gcpIcon('cloud_vpn', COLOUR.networking),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'networking',
        },
        {
            name: 'VPC',
            style: gcpIcon('virtual_private_cloud', COLOUR.networking),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'networking',
        },
        {
            name: 'Cloud Armor',
            style: gcpIcon('cloud_armor', COLOUR.networking),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'networking',
        },
        // Analytics
        {
            name: 'BigQuery',
            style: gcpIcon('bigquery', COLOUR.analytics),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'analytics',
        },
        {
            name: 'Dataflow',
            style: gcpIcon('cloud_dataflow', COLOUR.analytics),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'analytics',
        },
        {
            name: 'Dataproc',
            style: gcpIcon('cloud_dataproc', COLOUR.analytics),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'analytics',
        },
        // Integration
        {
            name: 'Pub/Sub',
            style: gcpIcon('cloud_pubsub', COLOUR.integration),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'integration',
        },
        {
            name: 'API Gateway',
            style: gcpIcon('gateway', COLOUR.integration),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'integration',
        },
        {
            name: 'Cloud Endpoints',
            style: gcpIcon('cloud_endpoints', COLOUR.integration),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'integration',
        },
        // AI/ML
        {
            name: 'Vertex AI',
            style: gcpIcon('cloud_machine_learning', COLOUR.ai),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'ai',
        },
        {
            name: 'Cloud AI Platform',
            style: gcpIcon('cloud_machine_learning', COLOUR.ai),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'ai',
        },
        // Security
        {
            name: 'Cloud IAM',
            style: gcpIcon('cloud_iam', COLOUR.security),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'security',
        },
        {
            name: 'Cloud KMS',
            style: gcpIcon('key_management_service', COLOUR.security),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'security',
        },
        {
            name: 'Secret Manager',
            style: gcpIcon('key', COLOUR.security),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'security',
        },
        // Management
        {
            name: 'Cloud Monitoring',
            style: gcpIcon('cloud_monitoring', COLOUR.management),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'management',
        },
        {
            name: 'Cloud Logging',
            style: gcpIcon('logging', COLOUR.management),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'management',
        },
    ],
    styleTemplates: {
        vertex: `${GCP_ICON_BASE}fillColor=#4285F4;shape=mxgraph.gcp2.compute_engine;`,
        edge: 'edgeStyle=orthogonalEdgeStyle;curved=1;endArrow=classic;html=1;strokeColor=#4285F4;',
        container: 'rounded=1;whiteSpace=wrap;html=1;dashed=1;dashPattern=5 5;fillColor=none;strokeColor=#4285F4;verticalAlign=top;fontStyle=1;fontSize=12;',
        labelEdge: 'edgeStyle=orthogonalEdgeStyle;curved=1;endArrow=classic;html=1;strokeColor=#4285F4;fontSize=10;',
    },
    colours: {
        compute: { fillColor: '#4285F4', strokeColor: '#4285F4' },
        storage: { fillColor: '#4285F4', strokeColor: '#4285F4' },
        database: { fillColor: '#4285F4', strokeColor: '#4285F4' },
        networking: { fillColor: '#4285F4', strokeColor: '#4285F4' },
        analytics: { fillColor: '#4285F4', strokeColor: '#4285F4' },
        ai: { fillColor: '#4285F4', strokeColor: '#4285F4' },
        security: { fillColor: '#4285F4', strokeColor: '#4285F4' },
        management: { fillColor: '#4285F4', strokeColor: '#4285F4' },
        integration: { fillColor: '#4285F4', strokeColor: '#4285F4' },
    },
    layout: {
        preferredFlow: 'left-right',
        usesContainers: true,
        suggestedGap: 60,
        hints: [
            'Group resources by project or VPC using containers',
            'Place internet-facing services on the left, backend services on the right',
            'Use Google Blue (#4285F4) as the primary edge and border colour',
            'Label edges with protocols or data flow descriptions',
            'Organise by tier: ingress → compute → data',
        ],
    },
    fewShotExample: [
        '<mxCell id="2" value="Project" style="rounded=1;whiteSpace=wrap;html=1;dashed=1;dashPattern=5 5;fillColor=none;strokeColor=#4285F4;verticalAlign=top;fontStyle=1;fontSize=12;" vertex="1" connectable="0" parent="1">',
        '  <mxGeometry x="40" y="40" width="700" height="400" as="geometry"/>',
        '</mxCell>',
        `<mxCell id="3" value="Load Balancer" style="${gcpIcon('cloud_load_balancing', COLOUR.networking)}" vertex="1" parent="2">`,
        '  <mxGeometry x="50" y="170" width="50" height="50" as="geometry"/>',
        '</mxCell>',
        `<mxCell id="4" value="GKE" style="${gcpIcon('container_engine', COLOUR.compute)}" vertex="1" parent="2">`,
        '  <mxGeometry x="280" y="170" width="50" height="50" as="geometry"/>',
        '</mxCell>',
        `<mxCell id="5" value="Cloud SQL" style="${gcpIcon('cloud_sql', COLOUR.database)}" vertex="1" parent="2">`,
        '  <mxGeometry x="510" y="170" width="50" height="50" as="geometry"/>',
        '</mxCell>',
        '<mxCell id="6" style="endArrow=classic;html=1;strokeColor=#4285F4;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="3" target="4">',
        '  <mxGeometry relative="1" as="geometry"/>',
        '</mxCell>',
        '<mxCell id="7" style="endArrow=classic;html=1;strokeColor=#4285F4;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="4" target="5">',
        '  <mxGeometry relative="1" as="geometry"/>',
        '</mxCell>',
    ].join('\n'),
    promptRules: [
        'Use shape=mxgraph.gcp2.<service_name> for all GCP service icons',
        'Apply base style: sketch=0;html=1;aspect=fixed;strokeColor=none;shadow=0;',
        'Use Google Blue (#4285F4) as the fill colour for all service icons',
        'Group resources by GCP project or VPC using dashed containers',
        'Place internet-facing services at the left of the diagram',
        'Show data flow direction with arrows — typically left-to-right',
        'Label edges with API names or protocols',
    ],
};
//# sourceMappingURL=gcp.js.map