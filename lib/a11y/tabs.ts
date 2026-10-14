import type React from 'react';

/**
 * WAI-ARIA tabs keyboard pattern (automatic activation).
 * Attach to the element with role="tablist"; Arrow keys, Home and End move
 * selection between the tabs it contains and move focus with it.
 */
export function handleTabListKeyDown<T extends string>(
  event: React.KeyboardEvent<HTMLElement>,
  ids: readonly T[],
  current: T,
  select: (id: T) => void
) {
  const index = ids.indexOf(current);
  let next = index;

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      next = (index + 1) % ids.length;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      next = (index - 1 + ids.length) % ids.length;
      break;
    case 'Home':
      next = 0;
      break;
    case 'End':
      next = ids.length - 1;
      break;
    default:
      return;
  }

  event.preventDefault();
  select(ids[next]);
  const tabs = event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]');
  tabs[next]?.focus();
}
