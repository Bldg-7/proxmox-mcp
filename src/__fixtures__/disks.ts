// Physical disk list response
export const sampleDiskList = [
  {
    devpath: '/dev/sda',
    used: 'LVM',
    gpt: true,
    mounted: false,
    size: 1000204886016,
    vendor: 'Samsung',
    model: 'SSD 870 EVO',
    serial: 'S5GUNG0N123456',
    health: 'PASSED',
  },
  {
    devpath: '/dev/sdb',
    used: 'ZFS',
    gpt: true,
    mounted: false,
    size: 2000409772032,
    vendor: 'WDC',
    model: 'WD20EZRZ',
    serial: 'WD-WCC1S0123456',
    health: 'PASSED',
  },
  {
    devpath: '/dev/nvme0n1',
    used: '',
    gpt: false,
    mounted: false,
    size: 500107862016,
    vendor: 'Samsung',
    model: 'PM9A1',
    serial: 'S5GUNG0N654321',
    health: 'PASSED',
  },
  {
    devpath: '/dev/sdc',
    used: '',
    gpt: false,
    mounted: false,
    size: 4000787030016,
    vendor: 'Seagate',
    model: 'ST4000DM004',
    serial: 'Z305ABCD',
    health: 'FAILED',
  },
];

// SMART health data response
export const sampleSmartData = {
  health: 'PASSED',
  type: 'ata',
  attributes: [
    {
      id: 5,
      name: 'Reallocated_Sector_Ct',
      value: 100,
      worst: 100,
      threshold: 10,
      raw: '0',
    },
    {
      id: 9,
      name: 'Power_On_Hours',
      value: 98,
      worst: 98,
      threshold: 0,
      raw: '8760',
    },
    {
      id: 12,
      name: 'Power_Cycle_Count',
      value: 99,
      worst: 99,
      threshold: 0,
      raw: '42',
    },
    {
      id: 184,
      name: 'End-to-End_Error',
      value: 100,
      worst: 100,
      threshold: 99,
      raw: '0',
    },
    {
      id: 187,
      name: 'Reported_Uncorrect',
      value: 100,
      worst: 100,
      threshold: 0,
      raw: '0',
    },
    {
      id: 194,
      name: 'Temperature_Celsius',
      value: 85,
      worst: 85,
      threshold: 0,
      raw: '35 (Min/Max 20/45)',
    },
    {
      id: 199,
      name: 'UDMA_CRC_Error_Count',
      value: 100,
      worst: 100,
      threshold: 0,
      raw: '0',
    },
  ],
  text: 'smartctl 7.3 2023-02-28 r5338 [x86_64-linux-6.2.16-3-pve] (local build)\nCopyright (C) 2002-23, Bruce Allen, Christian Franke, www.smartmontools.org\n\n=== START OF INFORMATION SECTION ===\nModel Family:     Samsung 870 EVO\nDevice Model:     Samsung SSD 870 EVO\nSerial Number:    S5GUNG0N123456\nLU WWN Device Id: 5 002538 d5a1b2c3d\nFirmware Version: SVT04B6Q\nUser Capacity:    1,000,204,886,016 bytes [1.00 TB]\nSector Sizes:     512 bytes logical, 4096 bytes physical\nForm Factor:      2.5 inches\nDevice is:        In smartctl database 7.3/5319\nATA Version is:   ACS-4 (minor revision not indicated)\nSMART support is: Available - device has SMART capability.\nSMART support is: Enabled\n\n=== START OF READ SMART DATA SECTION ===\nSMART overall-health self-assessment test result: PASSED\n\nGeneral SMART Values:\nOffline data collection status:  (0x00)  Offline data collection activity\n                                        was never started.\n                                        Auto Offline Data Collection: Disabled.\nSelf-test execution status:      (0)     The previous self-test routine completed\n                                        without error or no self-test has ever\n                                        been run.\nTotal time to complete Offline\ndata collection:                (    0) seconds.\nOffline data collection\nimprovements:                   (0x00)  No Offline data collection improvement\n                                        activities have been recommended.\nRecommended polling time:       ( 0) minutes.\n\nPRE-FAILURE ATTRIBUTES:\nID# ATTRIBUTE_NAME          FLAG     VALUE WORST THRESH TYPE      UPDATED  WHEN_FAILED RAW_VALUE\n  5 Reallocated_Sector_Ct   0x0033   100   100   010    Pre-fail  Always       -       0\n  9 Power_On_Hours          0x0032   098   098   000    Old_age   Always       -       8760\n 12 Power_Cycle_Count       0x0032   099   099   000    Old_age   Always       -       42\n184 End-to-End_Error        0x0033   100   100   099    Pre-fail  Always       -       0\n187 Reported_Uncorrect      0x0032   100   100   000    Old_age   Always       -       0\n194 Temperature_Celsius     0x0022   085   085   000    Old_age   Always       -       35 (Min/Max 20/45)\n199 UDMA_CRC_Error_Count    0x0032   100   100   000    Old_age   Always       -       0\n\n=== START OF INFORMATION SECTION ===\nSelf-test has not been run\n',
};

// SMART data with warnings
export const sampleSmartDataWarning = {
  health: 'WARNING',
  type: 'ata',
  attributes: [
    {
      id: 5,
      name: 'Reallocated_Sector_Ct',
      value: 80,
      worst: 80,
      threshold: 10,
      raw: '50',
    },
    {
      id: 194,
      name: 'Temperature_Celsius',
      value: 60,
      worst: 60,
      threshold: 0,
      raw: '55 (Min/Max 20/65)',
    },
  ],
  text: 'SMART overall-health self-assessment test result: WARNING\n',
};

// LVM volume groups tree structure
export const sampleLvmData = {
  leaf: false,
  children: [
    {
      leaf: false,
      name: 'pve',
      size: 1000204886016,
      free: 500102443008,
      children: [
        {
          leaf: true,
          name: '/dev/sda3',
          size: 1000204886016,
          free: 500102443008,
        },
      ],
    },
    {
      leaf: false,
      name: 'data',
      size: 2000409772032,
      free: 1000204886016,
      children: [
        {
          leaf: true,
          name: '/dev/sdb1',
          size: 2000409772032,
          free: 1000204886016,
        },
      ],
    },
  ],
};

// ZFS pools array
export const sampleZfsData = [
  {
    name: 'rpool',
    size: 1000204886016,
    alloc: 250051221504,
    free: 750153664512,
    frag: 12,
    dedup: 1.0,
    health: 'ONLINE',
  },
  {
    name: 'tank',
    size: 2000409772032,
    alloc: 1500307329024,
    free: 500102443008,
    frag: 25,
    dedup: 1.05,
    health: 'ONLINE',
  },
];

// ZFS pool with degraded health
export const sampleZfsDataDegraded = [
  {
    name: 'backup',
    size: 4000787030016,
    alloc: 3000590272512,
    free: 1000196757504,
    frag: 45,
    dedup: 1.1,
    health: 'DEGRADED',
  },
];

// Edge cases
export const emptyDiskList = [];
export const noLvmConfigured = { leaf: false, children: [] };
export const noZfsPools = [];

// Disk with no SMART capability
export const diskNoSmartCapability = {
  devpath: '/dev/sdd',
  used: '',
  gpt: false,
  mounted: false,
  size: 1000204886016,
  vendor: 'Generic',
  model: 'USB Drive',
  serial: 'GENERIC123456',
  health: 'UNKNOWN',
};
