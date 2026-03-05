import { SchemaData, QueryExample } from './types';

export const mollerSchema: SchemaData = {
  tables: [
    {
      name: 'run',
      schema: 'public',
      description: 'Main run information table',
      columns: [
        { name: 'run_number', type: 'integer', nullable: false, isPrimaryKey: true, description: 'Unique run identifier' },
        { name: 'run_type', type: 'varchar(50)', nullable: true, description: 'Type of run (production, calibration, etc.)' },
        { name: 'start_time', type: 'timestamp', nullable: true, description: 'Run start timestamp' },
        { name: 'end_time', type: 'timestamp', nullable: true, description: 'Run end timestamp' },
        { name: 'target_type', type: 'varchar(50)', nullable: true, description: 'Target material type' },
        { name: 'beam_energy', type: 'numeric(10,3)', nullable: true, description: 'Beam energy in GeV' },
        { name: 'polarization', type: 'numeric(5,2)', nullable: true, description: 'Beam polarization percentage' },
        { name: 'run_quality', type: 'varchar(20)', nullable: true, description: 'Quality assessment (good, bad, unknown)' },
        { name: 'total_events', type: 'bigint', nullable: true, description: 'Total number of events collected' },
        { name: 'comments', type: 'text', nullable: true, description: 'Additional notes about the run' },
      ],
    },
    {
      name: 'slow_controls_data',
      schema: 'public',
      description: 'Slow controls monitoring data',
      columns: [
        { name: 'id', type: 'bigserial', nullable: false, isPrimaryKey: true, description: 'Unique record identifier' },
        { name: 'run_number', type: 'integer', nullable: false, isForeignKey: true, foreignKeyRef: { table: 'run', column: 'run_number' }, description: 'Associated run number' },
        { name: 'timestamp', type: 'timestamp', nullable: false, description: 'Measurement timestamp' },
        { name: 'device_name', type: 'varchar(100)', nullable: false, description: 'Name of the monitoring device' },
        { name: 'channel', type: 'varchar(100)', nullable: false, description: 'Channel or sensor identifier' },
        { name: 'value', type: 'numeric(15,6)', nullable: true, description: 'Measured value' },
        { name: 'units', type: 'varchar(20)', nullable: true, description: 'Measurement units' },
        { name: 'status', type: 'varchar(20)', nullable: true, description: 'Status flag (ok, warning, error)' },
      ],
    },
    {
      name: 'detector_data',
      schema: 'public',
      description: 'Detector readout and analysis data',
      columns: [
        { name: 'id', type: 'bigserial', nullable: false, isPrimaryKey: true, description: 'Unique record identifier' },
        { name: 'run_number', type: 'integer', nullable: false, isForeignKey: true, foreignKeyRef: { table: 'run', column: 'run_number' }, description: 'Associated run number' },
        { name: 'event_number', type: 'bigint', nullable: false, description: 'Event sequence number' },
        { name: 'detector_id', type: 'varchar(50)', nullable: false, description: 'Detector identifier' },
        { name: 'ring_number', type: 'integer', nullable: true, description: 'Ring number for segmented detectors' },
        { name: 'adc_value', type: 'integer', nullable: true, description: 'ADC readout value' },
        { name: 'tdc_value', type: 'integer', nullable: true, description: 'TDC readout value' },
        { name: 'energy', type: 'numeric(12,6)', nullable: true, description: 'Calibrated energy in MeV' },
        { name: 'asymmetry', type: 'numeric(10,8)', nullable: true, description: 'Measured asymmetry value' },
      ],
    },
    {
      name: 'beam_conditions',
      schema: 'public',
      description: 'Beam parameter measurements',
      columns: [
        { name: 'id', type: 'bigserial', nullable: false, isPrimaryKey: true, description: 'Unique record identifier' },
        { name: 'run_number', type: 'integer', nullable: false, isForeignKey: true, foreignKeyRef: { table: 'run', column: 'run_number' }, description: 'Associated run number' },
        { name: 'timestamp', type: 'timestamp', nullable: false, description: 'Measurement timestamp' },
        { name: 'beam_current', type: 'numeric(10,3)', nullable: true, description: 'Beam current in μA' },
        { name: 'beam_energy', type: 'numeric(10,3)', nullable: true, description: 'Beam energy in GeV' },
        { name: 'position_x', type: 'numeric(8,4)', nullable: true, description: 'Beam position X in mm' },
        { name: 'position_y', type: 'numeric(8,4)', nullable: true, description: 'Beam position Y in mm' },
        { name: 'angle_x', type: 'numeric(8,4)', nullable: true, description: 'Beam angle X in mrad' },
        { name: 'angle_y', type: 'numeric(8,4)', nullable: true, description: 'Beam angle Y in mrad' },
        { name: 'halo', type: 'numeric(8,4)', nullable: true, description: 'Beam halo measurement' },
      ],
    },
    {
      name: 'analysis_results',
      schema: 'public',
      description: 'Physics analysis results',
      columns: [
        { name: 'id', type: 'bigserial', nullable: false, isPrimaryKey: true, description: 'Unique analysis identifier' },
        { name: 'run_number', type: 'integer', nullable: false, isForeignKey: true, foreignKeyRef: { table: 'run', column: 'run_number' }, description: 'Associated run number' },
        { name: 'analysis_type', type: 'varchar(50)', nullable: false, description: 'Type of analysis performed' },
        { name: 'analyzer', type: 'varchar(100)', nullable: true, description: 'Name of person/tool that performed analysis' },
        { name: 'analysis_date', type: 'timestamp', nullable: true, description: 'When analysis was completed' },
        { name: 'physics_asymmetry', type: 'numeric(12,9)', nullable: true, description: 'Measured physics asymmetry' },
        { name: 'statistical_error', type: 'numeric(12,9)', nullable: true, description: 'Statistical uncertainty' },
        { name: 'systematic_error', type: 'numeric(12,9)', nullable: true, description: 'Systematic uncertainty' },
        { name: 'chi_squared', type: 'numeric(12,6)', nullable: true, description: 'Chi-squared value' },
        { name: 'degrees_of_freedom', type: 'integer', nullable: true, description: 'Degrees of freedom' },
        { name: 'passed_cuts', type: 'boolean', nullable: true, description: 'Whether data passed quality cuts' },
        { name: 'notes', type: 'text', nullable: true, description: 'Analysis notes and comments' },
      ],
    },
    {
      name: 'target_configuration',
      schema: 'public',
      description: 'Target system configuration',
      columns: [
        { name: 'id', type: 'serial', nullable: false, isPrimaryKey: true, description: 'Unique configuration identifier' },
        { name: 'run_number', type: 'integer', nullable: false, isForeignKey: true, foreignKeyRef: { table: 'run', column: 'run_number' }, description: 'Associated run number' },
        { name: 'target_material', type: 'varchar(50)', nullable: false, description: 'Target material composition' },
        { name: 'target_thickness', type: 'numeric(10,4)', nullable: true, description: 'Target thickness in cm' },
        { name: 'target_position', type: 'varchar(20)', nullable: true, description: 'Target position (upstream, downstream, etc.)' },
        { name: 'temperature', type: 'numeric(8,3)', nullable: true, description: 'Target temperature in K' },
        { name: 'pressure', type: 'numeric(8,3)', nullable: true, description: 'Target pressure in torr' },
        { name: 'polarization_direction', type: 'varchar(20)', nullable: true, description: 'Target polarization direction' },
      ],
    },
    {
      name: 'calibration_constants',
      schema: 'public',
      description: 'Calibration constants and corrections',
      columns: [
        { name: 'id', type: 'serial', nullable: false, isPrimaryKey: true, description: 'Unique calibration identifier' },
        { name: 'detector_id', type: 'varchar(50)', nullable: false, description: 'Detector identifier' },
        { name: 'valid_from_run', type: 'integer', nullable: false, description: 'First run where calibration is valid' },
        { name: 'valid_to_run', type: 'integer', nullable: true, description: 'Last run where calibration is valid' },
        { name: 'calibration_type', type: 'varchar(50)', nullable: false, description: 'Type of calibration (pedestal, gain, etc.)' },
        { name: 'constant_value', type: 'numeric(15,8)', nullable: false, description: 'Calibration constant value' },
        { name: 'uncertainty', type: 'numeric(15,8)', nullable: true, description: 'Uncertainty in constant' },
        { name: 'calibration_date', type: 'timestamp', nullable: true, description: 'When calibration was determined' },
        { name: 'method', type: 'text', nullable: true, description: 'Method used to determine calibration' },
      ],
    },
    {
      name: 'run_log',
      schema: 'public',
      description: 'Run operator log entries',
      columns: [
        { name: 'id', type: 'serial', nullable: false, isPrimaryKey: true, description: 'Unique log entry identifier' },
        { name: 'run_number', type: 'integer', nullable: true, isForeignKey: true, foreignKeyRef: { table: 'run', column: 'run_number' }, description: 'Associated run number (if applicable)' },
        { name: 'timestamp', type: 'timestamp', nullable: false, description: 'Log entry timestamp' },
        { name: 'operator', type: 'varchar(100)', nullable: false, description: 'Name of operator' },
        { name: 'log_type', type: 'varchar(30)', nullable: true, description: 'Type of log entry (info, warning, error)' },
        { name: 'subject', type: 'varchar(200)', nullable: true, description: 'Subject/title of log entry' },
        { name: 'entry', type: 'text', nullable: false, description: 'Log entry content' },
      ],
    },
  ],
};

export const queryExamples: QueryExample[] = [
  {
    title: 'Get Recent Production Runs',
    category: 'Basic Queries',
    description: 'Retrieve the 10 most recent production runs with their basic information',
    sql: `SELECT run_number, run_type, start_time, end_time, 
       target_type, beam_energy, run_quality
FROM run
WHERE run_type = 'production'
ORDER BY start_time DESC
LIMIT 10;`,
  },
  {
    title: 'Run Duration and Event Rate',
    category: 'Basic Queries',
    description: 'Calculate run duration and average event rate for completed runs',
    sql: `SELECT run_number, 
       start_time, 
       end_time,
       EXTRACT(EPOCH FROM (end_time - start_time))/3600 as duration_hours,
       total_events,
       total_events / EXTRACT(EPOCH FROM (end_time - start_time)) as events_per_second
FROM run
WHERE end_time IS NOT NULL
  AND start_time IS NOT NULL
  AND total_events > 0
ORDER BY start_time DESC;`,
  },
  {
    title: 'Beam Conditions Summary by Run',
    category: 'Joins',
    description: 'Get average beam parameters for each run',
    sql: `SELECT r.run_number, 
       r.run_type,
       AVG(bc.beam_current) as avg_current,
       AVG(bc.beam_energy) as avg_energy,
       AVG(bc.position_x) as avg_pos_x,
       AVG(bc.position_y) as avg_pos_y,
       COUNT(*) as num_measurements
FROM run r
JOIN beam_conditions bc ON r.run_number = bc.run_number
GROUP BY r.run_number, r.run_type
ORDER BY r.run_number DESC;`,
  },
  {
    title: 'Find Runs with Analysis Results',
    category: 'Joins',
    description: 'Get runs that have completed physics analysis with quality cuts',
    sql: `SELECT r.run_number,
       r.start_time,
       r.target_type,
       ar.physics_asymmetry,
       ar.statistical_error,
       ar.systematic_error,
       ar.passed_cuts
FROM run r
JOIN analysis_results ar ON r.run_number = ar.run_number
WHERE ar.passed_cuts = true
  AND ar.physics_asymmetry IS NOT NULL
ORDER BY r.run_number DESC;`,
  },
  {
    title: 'Detector Performance by Ring',
    category: 'Aggregation',
    description: 'Analyze detector data grouped by ring number',
    sql: `SELECT detector_id,
       ring_number,
       COUNT(*) as event_count,
       AVG(energy) as avg_energy,
       STDDEV(energy) as energy_stddev,
       AVG(asymmetry) as avg_asymmetry
FROM detector_data
WHERE ring_number IS NOT NULL
  AND energy IS NOT NULL
GROUP BY detector_id, ring_number
ORDER BY detector_id, ring_number;`,
  },
  {
    title: 'Slow Controls Warnings',
    category: 'Monitoring',
    description: 'Find recent slow controls measurements with warning or error status',
    sql: `SELECT sc.run_number,
       sc.timestamp,
       sc.device_name,
       sc.channel,
       sc.value,
       sc.units,
       sc.status
FROM slow_controls_data sc
WHERE sc.status IN ('warning', 'error')
  AND sc.timestamp > NOW() - INTERVAL '7 days'
ORDER BY sc.timestamp DESC;`,
  },
  {
    title: 'Target Configuration History',
    category: 'Configuration',
    description: 'View target configurations used across runs',
    sql: `SELECT r.run_number,
       r.start_time,
       tc.target_material,
       tc.target_thickness,
       tc.temperature,
       tc.pressure,
       tc.polarization_direction
FROM run r
JOIN target_configuration tc ON r.run_number = tc.run_number
ORDER BY r.start_time DESC;`,
  },
  {
    title: 'Current Calibration Constants',
    category: 'Calibration',
    description: 'Get the most recent calibration constants for each detector',
    sql: `SELECT detector_id,
       calibration_type,
       constant_value,
       uncertainty,
       valid_from_run,
       valid_to_run,
       calibration_date
FROM calibration_constants
WHERE valid_to_run IS NULL
   OR valid_to_run >= (SELECT MAX(run_number) FROM run)
ORDER BY detector_id, calibration_type;`,
  },
  {
    title: 'Run Quality Statistics',
    category: 'Statistics',
    description: 'Count runs by quality assessment and type',
    sql: `SELECT run_type,
       run_quality,
       COUNT(*) as num_runs,
       SUM(total_events) as total_events_collected,
       AVG(beam_energy) as avg_beam_energy
FROM run
WHERE run_quality IS NOT NULL
GROUP BY run_type, run_quality
ORDER BY run_type, run_quality;`,
  },
  {
    title: 'Operator Log for Run',
    category: 'Logging',
    description: 'Get all log entries associated with a specific run',
    sql: `SELECT timestamp,
       operator,
       log_type,
       subject,
       entry
FROM run_log
WHERE run_number = 12345
ORDER BY timestamp;`,
  },
];
