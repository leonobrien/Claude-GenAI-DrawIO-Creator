/**
 * Stencil fidelity tests — validates that notation shape styles use icon/shape
 * identifiers that actually exist in draw.io's stencil libraries.
 *
 * This catches the class of bug where our catalogue defines a shape (e.g.
 * prIcon=internet) that doesn't exist in draw.io's cisco19 stencil, causing
 * shapes to render as plain rectangles.
 *
 * Authoritative icon lists are extracted from draw.io's Sidebar JS files at:
 * https://github.com/jgraph/drawio/tree/dev/src/main/webapp/js/diagramly/sidebar/
 *
 * Stencil XML files at:
 * https://github.com/jgraph/drawio/tree/dev/src/main/webapp/stencils/
 */

import { describe, it, expect } from 'vitest';
import { getNotation } from '../../src/notation/registry.js';

// ---------------------------------------------------------------------------
// Cisco19  (source: Sidebar-Cisco19.js — every prIcon=<value>)
// ---------------------------------------------------------------------------
const VALID_CISCO19_PRICONS = new Set([
  '6500_vss', '6500_vss2', 'access_control_and_trustsec', 'aci', 'aci2', 'acs',
  'ad_decoder', 'ad_encoder', 'analysis_correlation', 'anomaly_detection',
  'anti_malware', 'anti_malware2', 'appnav', 'asa_5500', 'asr_1000', 'asr_9000',
  'avc_application_visibility_control', 'avc_application_visibility_control2',
  'blade_server', 'cisco_15800', 'cisco_dna_center', 'cisco_meetingplace_express',
  'cisco_security_manager', 'cisco_unified_contact_center_enterprise_and_hosted',
  'cisco_unified_presence_service', 'clock', 'cognitive', 'collab1', 'collab2',
  'collab3', 'collab4', 'communications_manager', 'contact_center_express',
  'content_recording_streaming_server', 'content_router', 'csr_1000v',
  'da_decoder', 'da_encoder', 'database_relational', 'dual_mode_access_point',
  'email_security', 'fabric_interconnect', 'fibre_channel_director_mds_9000',
  'fibre_channel_fabric_switch', 'firewall', 'flow_analytics', 'flow_analytics2',
  'flow_collector', 'h323', 'host_based_security', 'hypervisor',
  'immersive_telepresence_endpoint', 'ip_ip_gateway', 'ips_ids',
  'ip_telephone_router', 'ironport', 'ise', 'l2_modular', 'l2_modular2',
  'l2_switch', 'l2_switch_with_dual_supervisor', 'l3_modular', 'l3_modular2',
  'l3_modular3', 'l3_switch', 'l3_switch_with_dual_supervisor',
  'layer3_nexus_5k_switch', 'load_balancer', 'media_server',
  'meeting_scheduling_and_management_server', 'mesh_access_point', 'monitor',
  'monitoring', 'multipoint_meeting_server', 'nac_appliance',
  'nam_virtual_service_blade', 'netflow_router', 'netflow_router2',
  'net_mgmt_appliance', 'next_generation_intrusion_prevention_system',
  'nexus_1010', 'nexus_1k', 'nexus_1kv_vsm', 'nexus_2000_10ge', 'nexus_2k',
  'nexus_3k', 'nexus_4k', 'nexus_5k', 'nexus_5k_with_integrated_vsm',
  'nexus_7k', 'nexus_9300', 'nexus_9500', 'operations_manager',
  'policy_configuration', 'posture_assessment', 'primary_codec', 'router',
  'router_with_firewall', 'router_with_firewall2', 'router_with_voice', 'rps',
  'secondary_codec', 'secure_catalyst_switch_color', 'secure_catalyst_switch_color2',
  'secure_catalyst_switch_color3', 'secure_catalyst_switch_subdued',
  'secure_catalyst_switch_subdued2', 'secure_router', 'secure_switch',
  'security_management', 'service_ready_engine', 'set_top2', 'shield',
  'ssl_terminator', 'storage', 'telepresence_endpoint',
  'telepresence_endpoint_twin_data_display', 'telepresence_exchange',
  'threat_intelligence', 'transcoder', 'ucs_5108_blade_chassis',
  'ucs_c_series_server', 'ucs_express', 'unity', 'ups', 'vbond', 'video_analytics',
  'video_call_server', 'video_gateway', 'virtual_desktop_service',
  'virtual_matrix_switch', 'virtual_private_network', 'virtual_private_network2',
  'virtual_private_network_connector', 'vmanage', 'vpn_concentrator', 'vsmart',
  'vts2', 'web_application_firewall', 'web_reputation_filtering',
  'web_reputation_filtering_2', 'web_security', 'web_security_services',
  'web_security_services2', 'wireless_intrusion_prevention',
  'wireless_lan_controller', 'wireless_location_appliance', 'wireless_router',
  'workgroup_switch',
]);

// ---------------------------------------------------------------------------
// AWS4  (source: Sidebar-AWS4.js — gn + '.<identifier>' for resIcon/prIcon)
// ---------------------------------------------------------------------------
const VALID_AWS4_RESICONS = new Set([
  'activate', 'alexa_for_business', 'all_products', 'amplify', 'analytics',
  'apache_mxnet_on_aws', 'api_gateway', 'app_config', 'appfabric', 'appflow',
  'application_auto_scaling', 'application_composer', 'application_cost_profiler',
  'application_discovery_service', 'application_integration',
  'application_recovery_controller', 'app_mesh', 'app_runner', 'appstream_20',
  'app_studio', 'appsync', 'app_wizard', 'artifact', 'ar_vr', 'athena',
  'audit_manager', 'augmented_ai', 'aurora', 'autoscaling', 'auto_scaling2',
  'auto_scaling3', 'b2b_data_interchange', 'backint_agent', 'backup', 'batch',
  'bedrock', 'blockchain', 'bottlerocket', 'braket', 'budgets_2',
  'business_application', 'certificate_manager_3', 'chatbot', 'chime',
  'chime_sdk', 'clean_rooms', 'client_vpn', 'cloud9', 'cloud_control_api',
  'cloud_development_kit', 'cloud_directory', 'cloudendure_disaster_recovery',
  'cloudendure_migration', 'cloudformation', 'cloudfront', 'cloudhsm',
  'cloud_map', 'cloudsearch2', 'cloudshell', 'cloudtrail', 'cloud_wan',
  'cloudwatch_2', 'codeartifact', 'codebuild', 'codecatalyst', 'codecommit',
  'codedeploy', 'codeguru', 'codeguru_2', 'codepipeline', 'codestar',
  'codewhisperer', 'cognito', 'command_line_interface', 'comprehend',
  'comprehend_medical', 'compute', 'compute_optimizer', 'config', 'connect',
  'contact_center', 'containers', 'control_tower', 'corretto',
  'cost_and_usage_report', 'cost_explorer', 'cost_management',
  'custom_billing_manager', 'customer_enablement', 'customer_engagement',
  'database', 'database_migration_service', 'data_exchange', 'data_pipeline',
  'datasync', 'data_transfer_terminal', 'datazone', 'deadline_cloud',
  'deepcomposer', 'deep_learning_amis', 'deep_learning_containers', 'deeplens',
  'deepracer', 'desktop_and_app_streaming', 'detective', 'developer_tools',
  'device_farm', 'devops_guru', 'direct_connect', 'directory_service',
  'distro_for_opentelemetry', 'documentdb_with_mongodb_compatibility', 'dynamodb',
  'ec2', 'ec2_image_builder', 'ecr', 'ecs', 'ecs_anywhere', 'efs_infrequentaccess',
  'efs_standard', 'eks', 'eks_anywhere', 'eks_cloud', 'eks_distro', 'elasticache',
  'elastic_beanstalk', 'elastic_block_store', 'elastic_fabric_adapter',
  'elastic_file_system', 'elastic_inference_2', 'elastic_load_balancing',
  'elasticsearch_service', 'elastic_transcoder', 'elastic_vmware_service',
  'elemental', 'elemental_link', 'elemental_mediaconnect',
  'elemental_mediaconvert', 'elemental_medialive', 'elemental_mediapackage',
  'elemental_mediastore', 'elemental_mediatailor', 'emr', 'end_user_messaging',
  'entity_resolution', 'eventbridge', 'express_workflow', 'fargate',
  'fault_injection_simulator', 'file_cache', 'finspace', 'firewall_manager',
  'forecast', 'fraud_detector', 'freertos', 'fsx', 'fsx_for_lustre',
  'fsx_for_netapp_ontap', 'fsx_for_openzfs', 'fsx_for_windows_file_server',
  'gamekit', 'gamelift_2', 'gamelift_streams', 'games', 'gamesparks', 'general',
  'genomics_cli', 'glacier', 'global_accelerator', 'glue', 'glue_databrew',
  'glue_elastic_views', 'greengrass', 'ground_station', 'group_account',
  'group_auto_scaling_group', 'group_aws_cloud', 'group_aws_cloud_alt',
  'group_aws_step_functions_workflow', 'group_corporate_data_center',
  'group_ec2_instance_contents', 'group_elastic_beanstalk',
  'group_iot_greengrass', 'group_iot_greengrass_deployment', 'group_on_premise',
  'group_region', 'group_security_group', 'group_spot_fleet', 'group_vpc2',
  'guardduty', 'healthimaging', 'healthlake', 'healthscribe', 'honeycode',
  'identity_and_access_management', 'infrequent_access_storage_class',
  'inspector', 'interactive_video', 'internet_of_things', 'iot_1click',
  'iot_analytics', 'iot_button', 'iot_core', 'iot_device_defender',
  'iot_device_management', 'iot_edukit', 'iot_events', 'iot_expresslink',
  'iot_fleetwise', 'iot_roborunner', 'iot_sitewise', 'iot_things_graph',
  'iot_twinmaker', 'iq', 'kendra', 'key_management_service', 'keyspaces',
  'kinesis', 'kinesis_data_analytics', 'kinesis_data_firehose',
  'kinesis_data_streams', 'kinesis_video_streams', 'lake_formation', 'lambda',
  'lex', 'license_manager', 'lightsail', 'lightsail_for_research', 'local_zones',
  'location_service', 'lookout_for_equipment', 'lookout_for_metrics',
  'lookout_for_vision', 'lumberyard', 'machine_learning', 'macie',
  'mainframe_modernization', 'managed_apache_cassandra_service',
  'managed_blockchain', 'managed_service_for_apache_flink',
  'managed_service_for_grafana', 'managed_service_for_prometheus',
  'managed_services', 'managed_streaming_for_kafka',
  'managed_workflows_for_apache_airflow', 'management_and_governance',
  'management_console', 'marketplace', 'media_services', 'memorydb_for_redis',
  'migration_and_transfer', 'migration_evaluator', 'migration_hub', 'mobile',
  'mobile_application', 'monitron', 'mq', 'neptune', 'network_firewall',
  'networking_and_content_delivery', 'neuron_ml_sdk', 'nice_dcv',
  'nice_enginframe', 'nimble_studio', 'nitro_enclaves', 'nova2', 'omics',
  'open_3d_engine_2', 'opsworks', 'oracle_database_at_aws', 'organizations',
  'outposts', 'outposts_1u_and_2u_servers', 'outposts_family', 'panorama',
  'parallel_cluster', 'parallel_computing_service', 'payment_cryptography',
  'personal_health_dashboard', 'personalize', 'pinpoint', 'polly', 'private_5g',
  'private_certificate_authority', 'professional_services', 'proton', 'q',
  'quantum_ledger_database', 'quantum_technologies', 'quicksight', 'rds',
  'rds_on_vmware', 'red_hat_openshift', 'redshift', 'rekognition_2', 'repost',
  'repost_private', 'reserved_instance_reporting', 'resilience_hub',
  'resource_access_manager', 'resource_explorer', 'robomaker', 'robotics',
  'route_53', 's3', 's3_on_outposts_storage', 'sagemaker', 'sagemaker_2',
  'sagemaker_ground_truth', 'sagemaker_studio_lab', 'satellite', 'savings_plans',
  'secrets_manager', 'security_hub', 'security_identity_and_compliance',
  'security_incident_response', 'security_lake', 'serverless',
  'serverless_application_repository', 'server_migration_service',
  'service_catalog', 'service_management_connector', 'shield', 'signer',
  'simple_email_service', 'simspace_weaver', 'single_sign_on',
  'site_to_site_vpn', 'snowball', 'snowball_edge', 'snowcone', 'snowmobile',
  'sns', 'sql_workbench', 'sqs', 'step_functions', 'storage', 'storage_gateway',
  'sumerian', 'supply_chain', 'support', 'systems_manager',
  'systems_manager_incident_manager', 'telco_network_builder',
  'tensorflow_on_aws', 'textract', 'thinkbox_deadline', 'thinkbox_draft',
  'thinkbox_frost', 'thinkbox_krakatoa', 'thinkbox_sequoia', 'thinkbox_stoke',
  'thinkbox_xmesh', 'timestream', 'tools_and_sdks', 'torchserve',
  'training_certification', 'transcribe', 'transfer_family', 'transfer_for_sftp',
  'transform', 'transit_gateway', 'translate', 'trusted_advisor',
  'user_notifications', 'verified_access', 'verified_permissions',
  'vmware_cloud_on_aws', 'vpc', 'vpc_lattice', 'vpc_privatelink', 'waf',
  'wavelength', 'well_architect_tool', 'wickr', 'workdocs', 'worklink',
  'workmail', 'workspaces', 'workspaces_family', 'workspaces_thin_client', 'xray',
]);

/**
 * Valid AWS4 shape identifiers used with shape=mxgraph.aws4.<name>.
 * Source: Sidebar-AWS4.js — n + '<identifier>' patterns.
 * Only the identifiers our notation actually uses are listed here.
 */
const VALID_AWS4_SHAPES = new Set([
  'container_1', 'container_2', 'container_3', 'ecs_service', 'ecs_task',
  'ecs_service_connect', 'ecs_copilot_cli', 'ecs_anywhere',
  'container_registry_image', 'generic',
]);

// ---------------------------------------------------------------------------
// GCP2  (source: gcp2.xml stencil — normalised: lowercase + spaces→underscores)
// ---------------------------------------------------------------------------
const VALID_GCP2_SHAPES = new Set([
  'a7_power', 'admin_connected', 'admob', 'advanced_solutions_lab', 'ai_hub',
  'anomaly_detection', 'api_analytics', 'apigee_api_platform', 'apigee_sense',
  'api_monetization', 'app_engine', 'app_engine_icon', 'application',
  'application_system', 'arrow_cycle', 'arrows_system', 'aspect_ratio',
  'automl_natural_language', 'automl_tables', 'automl_translation',
  'automl_video_intelligence', 'automl_vision', 'avere', 'beacon', 'beyondcorp',
  'big_query', 'bigquery', 'biomedical_beaker', 'biomedical_test_tube',
  'biomedical_trio', 'blank', 'blue_hexagon', 'bucket', 'bucket_scale',
  'calculator', 'campaign_manager', 'capabilities', 'certified_industry_standard',
  'check', 'check_2', 'check_available', 'check_scale', 'circuit_board', 'clock',
  'cloud', 'cloud_apis', 'cloud_armor', 'cloud_automl', 'cloud_bigtable',
  'cloud_cdn', 'cloud_checkmark', 'cloud_code', 'cloud_composer',
  'cloud_computer', 'cloud_connected_insight', 'cloud_data_catalog',
  'cloud_dataflow', 'cloud_dataflow_icon', 'cloud_data_fusion', 'cloud_datalab',
  'cloud_dataprep', 'cloud_dataproc', 'cloud_dataproc_icon', 'cloud_datastore',
  'cloud_deployment_manager', 'cloud_dns', 'cloud_endpoints',
  'cloud_external_ip_addresses', 'cloud_filestore', 'cloud_firestore',
  'cloud_firewall_rules', 'cloud_functions', 'cloud_iam', 'cloud_inference_api',
  'cloud_information', 'cloud_iot_core', 'cloud_iot_edge', 'cloud_jobs_api',
  'cloud_load_balancing', 'cloud_machine_learning', 'cloud_memorystore',
  'cloud_messaging', 'cloud_monitoring', 'cloud_nat',
  'cloud_natural_language_api', 'cloud_network', 'cloud_pubsub', 'cloud_router',
  'cloud_routes', 'cloud_run', 'cloud_scheduler', 'cloud_security',
  'cloud_security_command_center', 'cloud_security_scanner', 'cloud_server',
  'cloud_service_mesh', 'cloud_spanner', 'cloud_speech_api', 'cloud_sql',
  'cloud_storage', 'cloud_sub_pub', 'cloud_tasks', 'cloud_test_lab',
  'cloud_text_to_speech', 'cloud_tools_for_powershell', 'cloud_tpu',
  'cloud_translation_api', 'cloud_video_intelligence_api', 'cloud_vision_api',
  'cloud_vpn', 'cluster', 'compute_engine', 'compute_engine_2',
  'compute_engine_icon', 'connected', 'container_builder', 'container_engine',
  'container_engine_icon', 'container_optimized_os', 'container_registry', 'cost',
  'cost_arrows', 'cost_savings', 'data_access', 'database', 'database_2',
  'database_3', 'database_cycle', 'database_speed', 'database_uploading',
  'data_increase', 'data_loss_prevention_api', 'data_storage_cost', 'data_studio',
  'debugger', 'dedicated_game_server', 'dedicated_interconnect', 'desktop',
  'desktop_and_mobile', 'developer_portal', 'dialogflow_enterprise_edition',
  'enhance_ui', 'enhance_ui_2', 'error_reporting', 'external_data_center',
  'external_data_resource', 'external_payment_form', 'fastly', 'files',
  'firebase', 'folders', 'forseti_lockup', 'forseti_logo',
  'frontend_platform_services', 'game', 'gateway', 'gateway_icon', 'gear',
  'gear_arrow', 'gear_chain', 'gear_load', 'genomics', 'gke_on_prem',
  'globe_world', 'google_ad_manager', 'google_ads', 'google_analytics',
  'google_analytics_360', 'google_cloud_platform', 'google_cloud_platform_lockup',
  'google_network', 'google_network_edge_cache', 'google_play_game_service',
  'gpu', 'half_cloud', 'https_load_balancer', 'identity_aware_proxy',
  'image_services', 'increase_cost_arrows', 'internal_payment_authorization',
  'internet_connection', 'istio_logo', 'key', 'key_management_service',
  'kubernetes_logo', 'kubernetes_name', 'laptop', 'legacy_cloud', 'legacy_cloud_2',
  'lifecycle', 'lightbulb', 'list', 'live', 'load_balancing', 'loading',
  'loading_2', 'loading_3', 'lock', 'logging', 'logs_api', 'management_security',
  'maps_api', 'memcache', 'mem_instances', 'memory_card', 'mobile_devices',
  'modifiers_autoscaling', 'modifiers_custom_virtual_machine',
  'modifiers_high_cpu_machine', 'modifiers_high_memory_machine',
  'modifiers_preemptable_vm', 'modifiers_shared_core_machine_f1',
  'modifiers_shared_core_machine_g1', 'modifiers_standard_machine',
  'modifiers_storage', 'monitor', 'monitor_2', 'nat', 'network',
  'network_load_balancer', 'node', 'outline_blank_1', 'outline_blank_2',
  'outline_blank_3', 'outline_highcomp', 'outline_highmem',
  'partner_interconnect', 'payment', 'people_security_management',
  'persistent_disk', 'persistent_disk_snapshot', 'phone', 'phone_android',
  'placeholder', 'play_gear', 'play_start', 'prediction_api',
  'premium_network_tier', 'primary', 'process', 'profiler',
  'push_notification_service', 'recommendations_ai', 'record',
  'replication_controller', 'replication_controller_2',
  'replication_controller_3', 'report', 'repository', 'repository_2',
  'repository_3', 'repository_primary', 'retail', 'safety', 'save', 'scale',
  'scheduled_tasks', 'search', 'search_api', 'security_key_enforcement',
  'segments', 'segments_2', 'segments_overlap', 'servers_stacked', 'service',
  'service_discovery', 'social_media_time', 'solution', 'speaker', 'speed',
  'squid_proxy', 'stackdriver', 'stacked_ownership', 'standard_network_tier',
  'storage', 'stream', 'swap', 'systems_check', 'tape_record', 'task_queues',
  'task_queues_2', 'tensorflow_lockup', 'tensorflow_logo', 'thumbs_up',
  'time_clock', 'trace', 'traffic_director', 'transfer_appliance', 'users',
  'view_list', 'virtual_file_system', 'virtual_private_cloud', 'visibility',
  'vpn', 'vpn_gateway', 'webcam', 'website',
]);

// ---------------------------------------------------------------------------
// ArchiMate3  (source: Sidebar-ArchiMate3.js — am + '<identifier>' patterns)
// ---------------------------------------------------------------------------
const VALID_ARCHIMATE3_SHAPES = new Set([
  'actor', 'application', 'artifact', 'assess', 'businessObject', 'capability',
  'collaboration', 'commNetw', 'component', 'constraint', 'contract',
  'contractSmall', 'course', 'deliverable', 'device', 'distribution', 'driver',
  'equipment', 'event', 'event2', 'facility', 'function', 'gap', 'gapIcon',
  'goal', 'grouping', 'interaction', 'interface', 'location', 'locationIcon',
  'material', 'network', 'node', 'outcome', 'passive', 'path', 'plateau',
  'principle', 'process', 'product', 'productSmall', 'representation',
  'representationSmall', 'requirement', 'resource', 'role', 'service', 'sysSw',
  'tech', 'valueStream', 'workPackage',
]);

// ---------------------------------------------------------------------------
// BPMN  (source: Sidebar-BPMN.js + bpmn.xml stencil)
// ---------------------------------------------------------------------------

/** Valid base shapes for BPMN elements. */
const VALID_BPMN_BASE_SHAPES = new Set([
  'shape', 'task', 'data', 'data_store', 'annotation',
  // Newer versions used in latest Sidebar-BPMN.js (backwards compatible)
  'event', 'gateway2', 'task2', 'data2', 'conversation2', 'swimlane',
]);

/** Valid outline values for BPMN event shapes. */
const VALID_BPMN_OUTLINES = new Set([
  'standard', 'catching', 'throwing', 'end', 'gateway', 'none',
]);

/** Valid symbol values for BPMN event/gateway shapes. */
const VALID_BPMN_SYMBOLS = new Set([
  'cancel', 'compensation', 'conditional', 'error', 'escalation', 'general',
  'link', 'message', 'multiple', 'none', 'parallelMultiple', 'signal', 'star',
  'terminate', 'terminate2', 'timer',
  // Gateway symbols
  'exclusiveGw', 'parallelGw', 'inclusiveGw', 'eventGw', 'complexGw',
]);

/** Valid taskMarker values for BPMN task shapes. */
const VALID_BPMN_TASK_MARKERS = new Set([
  'abstract', 'businessRule', 'business_rule', 'manual', 'script', 'user',
  'service', 'send', 'receive',
]);

// ===========================================================================
// Tests
// ===========================================================================

describe('Stencil fidelity: Cisco19', () => {
  const cisco = getNotation('cisco');

  for (const shape of cisco.shapes) {
    it(`${shape.name} uses a valid style`, () => {
      const prIconMatch = shape.style.match(/prIcon=([^;]+)/);

      if (prIconMatch) {
        const iconName = prIconMatch[1];
        expect(
          VALID_CISCO19_PRICONS.has(iconName),
          `prIcon="${iconName}" (shape "${shape.name}") does not exist in draw.io's cisco19 stencil. ` +
          `Valid icons include: ${[...VALID_CISCO19_PRICONS].filter(n => n.includes(iconName.split('_')[0])).join(', ') || '(no similar names found)'}`,
        ).toBe(true);
      }
    });
  }

  it('few-shot example uses valid prIcon values', () => {
    const prIcons = [...cisco.fewShotExample.matchAll(/prIcon=([^;]+)/g)]
      .map(m => m[1]);

    for (const icon of prIcons) {
      expect(
        VALID_CISCO19_PRICONS.has(icon),
        `Few-shot example uses invalid prIcon="${icon}"`,
      ).toBe(true);
    }
  });
});

describe('Stencil fidelity: AWS4', () => {
  const aws = getNotation('aws');

  for (const shape of aws.shapes) {
    it(`${shape.name} uses valid stencil identifiers`, () => {
      // Check resIcon=mxgraph.aws4.<identifier>
      const resIconMatch = shape.style.match(/resIcon=mxgraph\.aws4\.([^;]+)/);
      if (resIconMatch) {
        const identifier = resIconMatch[1];
        expect(
          VALID_AWS4_RESICONS.has(identifier),
          `resIcon="${identifier}" (shape "${shape.name}") does not exist in draw.io's aws4 stencil. ` +
          `Similar: ${[...VALID_AWS4_RESICONS].filter(n => n.includes(identifier.split('_')[0])).slice(0, 5).join(', ') || '(none)'}`,
        ).toBe(true);
      }

      // Check prIcon=mxgraph.aws4.<identifier>
      const prIconMatch = shape.style.match(/prIcon=mxgraph\.aws4\.([^;]+)/);
      if (prIconMatch) {
        const identifier = prIconMatch[1];
        expect(
          VALID_AWS4_RESICONS.has(identifier),
          `prIcon="${identifier}" (shape "${shape.name}") does not exist in draw.io's aws4 stencil`,
        ).toBe(true);
      }

      // Check shape=mxgraph.aws4.<name> (direct shapes like ecs_task)
      const shapeMatch = shape.style.match(/shape=mxgraph\.aws4\.([^;]+)/);
      if (shapeMatch) {
        const shapeName = shapeMatch[1];
        // resourceIcon and productIcon are wrapper shapes, not in the shapes set
        if (shapeName !== 'resourceIcon' && shapeName !== 'productIcon') {
          expect(
            VALID_AWS4_SHAPES.has(shapeName),
            `shape="${shapeName}" (shape "${shape.name}") does not exist in draw.io's aws4 stencil`,
          ).toBe(true);
        }
      }
    });
  }

  it('few-shot example uses valid resIcon values', () => {
    const resIcons = [...aws.fewShotExample.matchAll(/resIcon=mxgraph\.aws4\.([^;]+)/g)]
      .map(m => m[1]);

    for (const icon of resIcons) {
      expect(
        VALID_AWS4_RESICONS.has(icon),
        `Few-shot example uses invalid resIcon="${icon}"`,
      ).toBe(true);
    }
  });
});

describe('Stencil fidelity: GCP2', () => {
  const gcp = getNotation('gcp');

  for (const shape of gcp.shapes) {
    it(`${shape.name} uses a valid stencil shape`, () => {
      const shapeMatch = shape.style.match(/shape=mxgraph\.gcp2\.([^;]+)/);
      if (shapeMatch) {
        const shapeName = shapeMatch[1];
        expect(
          VALID_GCP2_SHAPES.has(shapeName),
          `shape="${shapeName}" (shape "${shape.name}") does not exist in draw.io's gcp2 stencil. ` +
          `Similar: ${[...VALID_GCP2_SHAPES].filter(n => n.includes(shapeName.split('_')[0])).slice(0, 5).join(', ') || '(none)'}`,
        ).toBe(true);
      }
    });
  }

  it('few-shot example uses valid shape identifiers', () => {
    const shapes = [...gcp.fewShotExample.matchAll(/shape=mxgraph\.gcp2\.([^;]+)/g)]
      .map(m => m[1]);

    for (const name of shapes) {
      expect(
        VALID_GCP2_SHAPES.has(name),
        `Few-shot example uses invalid shape="${name}"`,
      ).toBe(true);
    }
  });
});

describe('Stencil fidelity: ArchiMate3', () => {
  const archimate = getNotation('archimate');

  for (const shape of archimate.shapes) {
    it(`${shape.name} uses a valid stencil shape`, () => {
      const shapeMatch = shape.style.match(/shape=mxgraph\.archimate3\.([^;]+)/);
      if (shapeMatch) {
        const shapeName = shapeMatch[1];
        expect(
          VALID_ARCHIMATE3_SHAPES.has(shapeName),
          `shape="${shapeName}" (shape "${shape.name}") does not exist in draw.io's archimate3 stencil. ` +
          `Valid shapes: ${[...VALID_ARCHIMATE3_SHAPES].join(', ')}`,
        ).toBe(true);
      }
    });
  }

  it('few-shot example uses valid shape identifiers', () => {
    const shapes = [...archimate.fewShotExample.matchAll(/shape=mxgraph\.archimate3\.([^;]+)/g)]
      .map(m => m[1]);

    for (const name of shapes) {
      expect(
        VALID_ARCHIMATE3_SHAPES.has(name),
        `Few-shot example uses invalid shape="${name}"`,
      ).toBe(true);
    }
  });
});

describe('Stencil fidelity: BPMN', () => {
  const bpmn = getNotation('bpmn');

  for (const shape of bpmn.shapes) {
    it(`${shape.name} uses valid BPMN identifiers`, () => {
      // Check base shape name
      const shapeMatch = shape.style.match(/shape=mxgraph\.bpmn\.([^;]+)/);
      if (shapeMatch) {
        const baseName = shapeMatch[1];
        expect(
          VALID_BPMN_BASE_SHAPES.has(baseName),
          `shape="mxgraph.bpmn.${baseName}" (shape "${shape.name}") is not a valid BPMN base shape`,
        ).toBe(true);
      }

      // Check outline value
      const outlineMatch = shape.style.match(/outline=([^;]+)/);
      if (outlineMatch) {
        expect(
          VALID_BPMN_OUTLINES.has(outlineMatch[1]),
          `outline="${outlineMatch[1]}" (shape "${shape.name}") is not a valid BPMN outline`,
        ).toBe(true);
      }

      // Check symbol value
      const symbolMatch = shape.style.match(/symbol=([^;]+)/);
      if (symbolMatch) {
        expect(
          VALID_BPMN_SYMBOLS.has(symbolMatch[1]),
          `symbol="${symbolMatch[1]}" (shape "${shape.name}") is not a valid BPMN symbol`,
        ).toBe(true);
      }

      // Check taskMarker value
      const taskMarkerMatch = shape.style.match(/taskMarker=([^;]+)/);
      if (taskMarkerMatch) {
        expect(
          VALID_BPMN_TASK_MARKERS.has(taskMarkerMatch[1]),
          `taskMarker="${taskMarkerMatch[1]}" (shape "${shape.name}") is not a valid BPMN task marker`,
        ).toBe(true);
      }
    });
  }

  it('few-shot example uses valid BPMN identifiers', () => {
    const baseShapes = [...bpmn.fewShotExample.matchAll(/shape=mxgraph\.bpmn\.([^;]+)/g)]
      .map(m => m[1]);
    for (const name of baseShapes) {
      expect(
        VALID_BPMN_BASE_SHAPES.has(name),
        `Few-shot example uses invalid base shape="${name}"`,
      ).toBe(true);
    }

    const symbols = [...bpmn.fewShotExample.matchAll(/symbol=([^;]+)/g)]
      .map(m => m[1]);
    for (const sym of symbols) {
      expect(
        VALID_BPMN_SYMBOLS.has(sym),
        `Few-shot example uses invalid symbol="${sym}"`,
      ).toBe(true);
    }

    const taskMarkers = [...bpmn.fewShotExample.matchAll(/taskMarker=([^;]+)/g)]
      .map(m => m[1]);
    for (const marker of taskMarkers) {
      expect(
        VALID_BPMN_TASK_MARKERS.has(marker),
        `Few-shot example uses invalid taskMarker="${marker}"`,
      ).toBe(true);
    }
  });
});

describe('Stencil fidelity: Azure (structural)', () => {
  const azure = getNotation('azure');

  for (const shape of azure.shapes) {
    it(`${shape.name} uses a valid Azure SVG path`, () => {
      const imageMatch = shape.style.match(/image=([^;]+)/);
      if (imageMatch) {
        const imagePath = imageMatch[1];
        // Azure images must use the img/lib/azure2/ path pattern
        expect(
          imagePath.startsWith('img/lib/azure2/'),
          `image="${imagePath}" (shape "${shape.name}") does not use the expected img/lib/azure2/ path`,
        ).toBe(true);
        // Must end with .svg
        expect(
          imagePath.endsWith('.svg'),
          `image="${imagePath}" (shape "${shape.name}") does not end with .svg`,
        ).toBe(true);
      }
    });
  }
});

describe('Stencil fidelity: UML (structural)', () => {
  const uml = getNotation('uml');

  /** Known valid native draw.io shape names used in UML diagrams. */
  const VALID_UML_NATIVE_SHAPES = new Set([
    'umlActor', 'umlLifeline', 'umlFrame', 'component', 'folder', 'cube',
    'note', 'note2', 'requires', 'mxgraph.flowchart.start_2', 'doubleCircle',
  ]);

  for (const shape of uml.shapes) {
    it(`${shape.name} uses a valid style`, () => {
      const shapeMatch = shape.style.match(/shape=([^;]+)/);
      if (shapeMatch) {
        const shapeName = shapeMatch[1];
        expect(
          VALID_UML_NATIVE_SHAPES.has(shapeName),
          `shape="${shapeName}" (shape "${shape.name}") is not a known native draw.io UML shape`,
        ).toBe(true);
      }
      // Shapes using swimlane, ellipse, rhombus, rounded, line styles don't have shape=
    });
  }
});
