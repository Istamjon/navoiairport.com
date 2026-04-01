import * as migration_20260317_191617_localization_fix from './20260317_191617_localization_fix';
import * as migration_20260317_191943_finalize_localization from './20260317_191943_finalize_localization';
import * as migration_20260317_192533_fix_hero_localization from './20260317_192533_fix_hero_localization';
import * as migration_20260317_192941_fix_hero_localization_final_v2 from './20260317_192941_fix_hero_localization_final_v2';

export const migrations = [
  {
    up: migration_20260317_191617_localization_fix.up,
    down: migration_20260317_191617_localization_fix.down,
    name: '20260317_191617_localization_fix',
  },
  {
    up: migration_20260317_191943_finalize_localization.up,
    down: migration_20260317_191943_finalize_localization.down,
    name: '20260317_191943_finalize_localization',
  },
  {
    up: migration_20260317_192533_fix_hero_localization.up,
    down: migration_20260317_192533_fix_hero_localization.down,
    name: '20260317_192533_fix_hero_localization',
  },
  {
    up: migration_20260317_192941_fix_hero_localization_final_v2.up,
    down: migration_20260317_192941_fix_hero_localization_final_v2.down,
    name: '20260317_192941_fix_hero_localization_final_v2'
  },
];
