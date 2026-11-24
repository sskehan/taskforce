// Starter list, taken from the Household Chores list in Microsoft To Do (24 Nov 2026).
const base = { remindWhen: 'due', remindAgain: '2d', remindTime: '18:00', important: false, steps: [], notes: '', onDay: null, lastDone: null, assignee: 'either', type: 'job' };
const job = (o) => ({ ...base, ...o });
const SAT = 6, SUN = 0, TUE = 2;

export const STARTER = [
  job({ name: 'Clean/Vacuum Kluger', category: 'cars', every: 2, unit: 'weeks', countFrom: 'done', nextDue: '2026-11-07' }),
  job({ name: 'Clean/Vacuum Yaris', category: 'cars', every: 2, unit: 'weeks', countFrom: 'done', nextDue: '2026-11-07' }),
  job({ name: 'Worm chooks – diatomaceous', category: 'pets', every: 2, unit: 'months', countFrom: 'done', nextDue: '2027-01-08', lastDone: '2026-11-08', assignee: 'shaun' }),
  job({ name: "Check/review printer's ink", category: 'house', every: 6, unit: 'months', countFrom: 'done', nextDue: '2027-02-28' }),
  job({ name: 'Charge Gooloo jump pack', category: 'gear', every: 3, unit: 'months', countFrom: 'done', nextDue: '2026-12-16', assignee: 'shaun' }),
  job({ name: "Clean Brooke's room", category: 'house', every: 2, unit: 'weeks', countFrom: 'fixed', onDay: SAT, nextDue: '2026-09-19' }),
  job({ name: 'Oil deck', category: 'house', every: 1, unit: 'years', countFrom: 'done', nextDue: '2027-04-15', assignee: 'shaun' }),
  job({ name: 'Clean fridge', category: 'house', every: 1, unit: 'months', countFrom: 'fixed', nextDue: '2026-11-30' }),
  job({ name: 'Water indoor plants', category: 'house', every: 1, unit: 'weeks', countFrom: 'fixed', onDay: SAT, nextDue: '2026-11-14' }),
  job({ name: 'Wash bedsheets & linen', category: 'house', every: 2, unit: 'weeks', countFrom: 'fixed', onDay: SAT, nextDue: '2026-10-31' }),
  job({ name: 'Pantry', category: 'house', every: 3, unit: 'months', countFrom: 'fixed', nextDue: '2027-01-22' }),
  job({ name: 'Clean office room', category: 'house', every: 2, unit: 'weeks', countFrom: 'fixed', onDay: TUE, nextDue: '2026-08-25' }),
  job({ name: 'Clean master bedroom', category: 'house', every: 1, unit: 'months', countFrom: 'fixed', nextDue: '2026-09-15' }),
  job({ name: 'Clean bathroom', category: 'house', every: 2, unit: 'weeks', countFrom: 'fixed', onDay: SUN, nextDue: '2026-09-20' }),
  job({ name: 'Clean toilet', category: 'house', every: 1, unit: 'weeks', countFrom: 'fixed', onDay: SUN, nextDue: '2026-11-15' }),
  job({ name: 'Clean washing machine', category: 'house', every: 2, unit: 'months', countFrom: 'fixed', nextDue: '2026-12-15' }),
  job({ name: 'Clean dishwasher', category: 'house', every: 1, unit: 'months', countFrom: 'fixed', nextDue: '2026-12-15' }),
  job({ name: 'CPAP mask cushion', category: 'cpap', type: 'item', every: 1, unit: 'months', countFrom: 'done', nextDue: '2026-11-24', lastDone: '2026-10-24', assignee: 'shaun', notes: 'Suggested 1 month (ResMed). Silicone cushions can last longer.' }),
  job({ name: 'CPAP air filters', category: 'cpap', type: 'item', every: 1, unit: 'months', countFrom: 'done', nextDue: '2026-12-17', lastDone: '2026-11-17', assignee: 'shaun', notes: 'Suggested monthly, or sooner if discoloured.' }),
  job({ name: 'CPAP hose', category: 'cpap', type: 'item', every: 3, unit: 'months', countFrom: 'done', nextDue: '2027-02-24', lastDone: '2026-11-24', assignee: 'shaun', notes: 'Suggested 3 months (ResMed US), 12 months (ResMed AU).' }),
  job({ name: 'CPAP water tub', category: 'cpap', type: 'item', every: 6, unit: 'months', countFrom: 'done', nextDue: '2027-05-24', lastDone: '2026-11-24', assignee: 'shaun', notes: 'Suggested 6 months.' }),
  job({ name: 'CPAP mask frame', category: 'cpap', type: 'item', every: 6, unit: 'months', countFrom: 'done', nextDue: '2027-02-24', lastDone: '2026-08-24', assignee: 'shaun', notes: 'Suggested 6 months (ResMed AU: 6–12).' })
];

export const DEFAULT_CATEGORIES = [
  { id: 'house', name: 'House', color: 'terra', icon: 'house' },
  { id: 'cars', name: 'Cars', color: 'slate', icon: 'car' },
  { id: 'pets', name: 'Pets', color: 'wattle', icon: 'paw' },
  { id: 'cpap', name: 'CPAP', color: 'gum', icon: 'mask' },
  { id: 'gear', name: 'Gear', color: 'ochre', icon: 'battery' }
];
