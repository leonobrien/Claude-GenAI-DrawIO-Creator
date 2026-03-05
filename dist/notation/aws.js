/**
 * AWS notation — AWS Architecture icon shapes.
 *
 * Uses the mxgraph.aws4 stencil library with full draw.io-compatible styles
 * including connection points, category fill colours, and proper sizing.
 */
/**
 * Standard 16-point connection array used by all AWS resource icons.
 */
const AWS_POINTS = 'points=[[0,0,0],[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0,0],[0,1,0],[0.25,1,0],[0.5,1,0],[0.75,1,0],[1,1,0],[0,0.25,0],[0,0.5,0],[0,0.75,0],[1,0.25,0],[1,0.5,0],[1,0.75,0]];';
/**
 * AWS category fill colours (from draw.io Sidebar.js).
 */
const COLOUR = {
    compute: '#ED7100',
    storage: '#7AA116',
    database: '#C925D1',
    networking: '#8C4FFF',
    security: '#DD344C',
    integration: '#E7157B',
    management: '#E7157B',
    analytics: '#8C4FFF',
    ai: '#01A88D',
    containers: '#ED7100',
};
/** Base style for AWS resource icons (78×78). */
function awsResourceIcon(resIcon, fillColor) {
    return `sketch=0;${AWS_POINTS}outlineConnect=0;fontColor=#232F3E;fillColor=${fillColor};strokeColor=#ffffff;dashed=0;verticalLabelPosition=bottom;verticalAlign=top;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.${resIcon};`;
}
/** Style for AWS product icons (smaller, flat). */
function awsProductIcon(icon, fillColor) {
    return `sketch=0;${AWS_POINTS}outlineConnect=0;fontColor=#232F3E;fillColor=${fillColor};strokeColor=#232F3E;dashed=0;verticalLabelPosition=bottom;verticalAlign=top;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.${icon};`;
}
/** Style for AWS sub-resource shapes (standalone shape, not resourceIcon wrapper). */
function awsShape(shapeName) {
    return `sketch=0;${AWS_POINTS}outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=#232F3E;fillColor=#ED7100;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.${shapeName};`;
}
export const awsNotation = {
    name: 'aws',
    displayName: 'AWS Architecture',
    stencilPrefix: 'mxgraph.aws4',
    description: 'AWS Architecture diagrams using official AWS service icons from the mxgraph.aws4 stencil library with full draw.io-compatible styles.',
    shapes: [
        // Compute
        {
            name: 'EC2 Instance',
            style: awsResourceIcon('ec2', COLOUR.compute),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'compute',
        },
        {
            name: 'Lambda',
            style: awsResourceIcon('lambda', COLOUR.compute),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'compute',
        },
        {
            name: 'ECS',
            style: awsResourceIcon('ecs', COLOUR.containers),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'containers',
        },
        {
            name: 'EKS',
            style: awsResourceIcon('eks', COLOUR.containers),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'containers',
        },
        {
            name: 'Fargate',
            style: awsResourceIcon('fargate', COLOUR.containers),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'containers',
        },
        {
            name: 'Elastic Beanstalk',
            style: awsResourceIcon('elastic_beanstalk', COLOUR.compute),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'compute',
        },
        {
            name: 'ECS Task',
            style: awsShape('ecs_task'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'containers',
        },
        {
            name: 'ECS Service',
            style: awsShape('ecs_service'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'containers',
        },
        {
            name: 'Container',
            style: awsShape('container_1'),
            defaultWidth: 50,
            defaultHeight: 50,
            category: 'containers',
        },
        {
            name: 'ECR',
            style: awsResourceIcon('ecr', COLOUR.containers),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'containers',
        },
        // Security (WAF)
        {
            name: 'WAF',
            style: awsResourceIcon('waf', COLOUR.security),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'security',
        },
        // Storage
        {
            name: 'S3',
            style: awsResourceIcon('s3', COLOUR.storage),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'storage',
        },
        {
            name: 'EBS',
            style: awsResourceIcon('elastic_block_store', COLOUR.storage),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'storage',
        },
        {
            name: 'EFS',
            style: awsResourceIcon('elastic_file_system', COLOUR.storage),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'storage',
        },
        // Database
        {
            name: 'RDS',
            style: awsResourceIcon('rds', COLOUR.database),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'database',
        },
        {
            name: 'DynamoDB',
            style: awsResourceIcon('dynamodb', COLOUR.database),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'database',
        },
        {
            name: 'ElastiCache',
            style: awsResourceIcon('elasticache', COLOUR.database),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'database',
        },
        {
            name: 'Aurora',
            style: awsResourceIcon('aurora', COLOUR.database),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'database',
        },
        {
            name: 'Redshift',
            style: awsResourceIcon('redshift', COLOUR.database),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'database',
        },
        // Networking
        {
            name: 'API Gateway',
            style: awsResourceIcon('api_gateway', COLOUR.networking),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'networking',
        },
        {
            name: 'CloudFront',
            style: awsResourceIcon('cloudfront', COLOUR.networking),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'networking',
        },
        {
            name: 'VPC',
            style: awsResourceIcon('vpc', COLOUR.networking),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'networking',
        },
        {
            name: 'Route 53',
            style: awsResourceIcon('route_53', COLOUR.networking),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'networking',
        },
        {
            name: 'ELB',
            style: awsResourceIcon('elastic_load_balancing', COLOUR.networking),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'networking',
        },
        // Integration / Messaging
        {
            name: 'SNS',
            style: awsResourceIcon('sns', COLOUR.integration),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'integration',
        },
        {
            name: 'SQS',
            style: awsResourceIcon('sqs', COLOUR.integration),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'integration',
        },
        {
            name: 'EventBridge',
            style: awsResourceIcon('eventbridge', COLOUR.integration),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'integration',
        },
        {
            name: 'Step Functions',
            style: awsResourceIcon('step_functions', COLOUR.integration),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'integration',
        },
        // Security
        {
            name: 'IAM',
            style: awsResourceIcon('identity_and_access_management', COLOUR.security),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'security',
        },
        {
            name: 'Cognito',
            style: awsResourceIcon('cognito', COLOUR.security),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'security',
        },
        {
            name: 'KMS',
            style: awsResourceIcon('key_management_service', COLOUR.security),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'security',
        },
        // Management
        {
            name: 'CloudWatch',
            style: awsResourceIcon('cloudwatch_2', COLOUR.management),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'management',
        },
        {
            name: 'CloudFormation',
            style: awsResourceIcon('cloudformation', COLOUR.management),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'management',
        },
        // Analytics
        {
            name: 'Kinesis',
            style: awsResourceIcon('kinesis', COLOUR.analytics),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'analytics',
        },
        {
            name: 'Athena',
            style: awsResourceIcon('athena', COLOUR.analytics),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'analytics',
        },
        // AI/ML
        {
            name: 'SageMaker',
            style: awsResourceIcon('sagemaker', COLOUR.ai),
            defaultWidth: 78,
            defaultHeight: 78,
            category: 'ai',
        },
    ],
    styleTemplates: {
        vertex: `sketch=0;${AWS_POINTS}outlineConnect=0;fontColor=#232F3E;fillColor=#ED7100;strokeColor=#ffffff;dashed=0;verticalLabelPosition=bottom;verticalAlign=top;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.generic;`,
        edge: 'endArrow=classic;html=1;strokeColor=#232F3E;',
        container: 'points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=1;shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_vpc;strokeColor=#248814;fillColor=none;verticalAlign=top;align=left;spacingLeft=30;dashed=0;',
        labelEdge: 'endArrow=classic;html=1;strokeColor=#232F3E;fontSize=10;',
    },
    colours: {
        compute: { fillColor: '#ED7100', strokeColor: '#ED7100' },
        containers: { fillColor: '#ED7100', strokeColor: '#ED7100' },
        storage: { fillColor: '#7AA116', strokeColor: '#7AA116' },
        database: { fillColor: '#C925D1', strokeColor: '#C925D1' },
        networking: { fillColor: '#8C4FFF', strokeColor: '#8C4FFF' },
        security: { fillColor: '#DD344C', strokeColor: '#DD344C' },
        management: { fillColor: '#E7157B', strokeColor: '#E7157B' },
        integration: { fillColor: '#E7157B', strokeColor: '#E7157B' },
        analytics: { fillColor: '#8C4FFF', strokeColor: '#8C4FFF' },
        ai: { fillColor: '#01A88D', strokeColor: '#01A88D' },
    },
    layout: {
        preferredFlow: 'left-right',
        usesContainers: true,
        suggestedGap: 60,
        hints: [
            'Group services by VPC, subnet, or availability zone using containers',
            'Place users/internet on the left, backend services on the right',
            'Use the official AWS colour palette for category consistency',
            'Label edges with protocol or data flow descriptions',
            'Place load balancers between tiers',
            'Use 78×78 sizing for resource icons',
        ],
    },
    fewShotExample: [
        '<mxCell id="2" value="VPC" style="points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75],[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=1;shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_vpc;strokeColor=#248814;fillColor=none;verticalAlign=top;align=left;spacingLeft=30;dashed=0;" vertex="1" connectable="0" parent="1">',
        '  <mxGeometry x="40" y="40" width="700" height="400" as="geometry"/>',
        '</mxCell>',
        `<mxCell id="3" value="ALB" style="${awsResourceIcon('elastic_load_balancing', COLOUR.networking)}" vertex="1" parent="2">`,
        '  <mxGeometry x="40" y="160" width="78" height="78" as="geometry"/>',
        '</mxCell>',
        `<mxCell id="4" value="EC2" style="${awsResourceIcon('ec2', COLOUR.compute)}" vertex="1" parent="2">`,
        '  <mxGeometry x="260" y="160" width="78" height="78" as="geometry"/>',
        '</mxCell>',
        `<mxCell id="5" value="RDS" style="${awsResourceIcon('rds', COLOUR.database)}" vertex="1" parent="2">`,
        '  <mxGeometry x="480" y="160" width="78" height="78" as="geometry"/>',
        '</mxCell>',
        '<mxCell id="6" style="endArrow=classic;html=1;strokeColor=#232F3E;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="3" target="4">',
        '  <mxGeometry relative="1" as="geometry"/>',
        '</mxCell>',
        '<mxCell id="7" style="endArrow=classic;html=1;strokeColor=#232F3E;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="4" target="5">',
        '  <mxGeometry relative="1" as="geometry"/>',
        '</mxCell>',
    ].join('\n'),
    promptRules: [
        'Use the full AWS4 resource icon style with connection points, fillColor, and aspect=fixed',
        'Apply category-specific fill colours: Compute=#ED7100, Database=#C925D1, Networking=#8C4FFF, Storage=#7AA116, Security=#DD344C, Integration=#E7157B',
        'Use 78×78 sizing for resource icons (default)',
        'Group resources inside VPC, subnet, or availability zone containers using mxgraph.aws4.group styles',
        'Use AWS dark colour (#232F3E) for edge strokes and font colour',
        'Place labels below icons (verticalLabelPosition=bottom)',
        'Show data flow direction with arrows — typically left-to-right or top-to-bottom',
    ],
};
//# sourceMappingURL=aws.js.map