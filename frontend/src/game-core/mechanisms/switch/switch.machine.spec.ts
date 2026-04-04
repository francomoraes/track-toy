import { applySwitchToggle, createSwitch } from './switch.machine';

describe('Switch mechanism', () => {
  it('starts with direction alternate (correct path to elevator B)', () => {
    expect(createSwitch().direction).toBe('alternate');
  });

  it('toggles from alternate to main', () => {
    const toggled = applySwitchToggle(createSwitch());
    expect(toggled.direction).toBe('main');
  });

  it('toggles from main back to alternate', () => {
    const s = { direction: 'main' as const };
    expect(applySwitchToggle(s).direction).toBe('alternate');
  });

  it('does not mutate the original state', () => {
    const original = createSwitch();
    applySwitchToggle(original);
    expect(original.direction).toBe('alternate');
  });
});
