export const ROOMS = [
  {
    id: 'attic',
    label: 'Attic',
    color: 0xE8A45A,
    eyebrow: 'ATTIC · INSULATION',
    title: 'Seal it, then blanket it',
    body: 'Around 9 in 10 U.S. homes are under-insulated. Sealing air leaks around windows, doors and the foundation, then adding insulation in the attic, floors and basement, cuts heating and cooling costs.',
    stat: '≈ 15% lower heating & cooling bills',
  },
  {
    id: 'living',
    label: 'Living room',
    color: 0xF2B36B,
    eyebrow: 'LIVING ROOM · THERMOSTAT',
    title: 'Turn it down a few degrees',
    body: 'If your health allows, keep the thermostat around 68°F in winter. Every degree below that trims a little more off your heating bill.',
    stat: '≈ 5% savings per degree lowered',
  },
  {
    id: 'furnace',
    label: 'Furnace room',
    color: 0xE87B3E,
    eyebrow: 'UTILITY ROOM · HEATING SYSTEM',
    title: 'Give the furnace a check-up',
    body: 'Heating is usually the single biggest energy draw in a home. A yearly HVAC tune-up keeps the system running efficiently through the cold months.',
    stat: 'Biggest single energy user',
  },
  {
    id: 'water',
    label: 'Water heater',
    color: 0x6FA8D0,
    eyebrow: 'BASEMENT · WATER HEATER',
    title: 'Dial back the hot water',
    body: "Water heating is roughly 18% of a home's energy use. Low-flow faucet aerators and showerheads, plus setting the heater to 120°F (its low setting), reduce that load.",
    stat: '≈ 18% of home energy use',
  },
];

export function roomColorHex(color) {
  return '#' + color.toString(16).padStart(6, '0');
}
