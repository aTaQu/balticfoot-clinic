import * as migration_20260407_110144 from './20260407_110144';
import * as migration_20260407_134500 from './20260407_134500';

export const migrations = [
  {
    up: migration_20260407_110144.up,
    down: migration_20260407_110144.down,
    name: '20260407_110144',
  },
  {
    up: migration_20260407_134500.up,
    down: migration_20260407_134500.down,
    name: '20260407_134500'
  },
];
