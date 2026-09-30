import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SplitButton } from './split-button';

const setup = (over: Partial<Parameters<typeof SplitButton>[0]> = {}) => {
  const onClick = vi.fn();
  const postNow = vi.fn();
  const template = vi.fn();
  render(
    <div>
      <SplitButton
        label="Add to calendar"
        menuLabel="More ways to publish"
        onClick={onClick}
        items={[
          { key: 'now', label: 'Post now', onSelect: postNow },
          { key: 'tpl', label: 'Save as template', onSelect: template },
        ]}
        {...over}
      />
      <button>outside</button>
    </div>
  );
  return { onClick, postNow, template };
};

describe('SplitButton', () => {
  it('runs the primary action without opening the menu', () => {
    const { onClick } = setup();
    fireEvent.click(screen.getByRole('button', { name: /add to calendar/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens on click (not hover) and exposes menu semantics', () => {
    setup();
    const toggle = screen.getByRole('button', { name: /more ways to publish/i });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('menu')).toBeTruthy();
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });

  it('runs an item and closes the menu', () => {
    const { postNow } = setup();
    fireEvent.click(screen.getByRole('button', { name: /more ways to publish/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /post now/i }));
    expect(postNow).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes on Escape and returns focus to the toggle', () => {
    setup();
    const toggle = screen.getByRole('button', { name: /more ways to publish/i });
    fireEvent.click(toggle);
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(toggle);
  });

  it('closes when clicking outside', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /more ways to publish/i }));
    fireEvent.mouseDown(screen.getByText('outside'));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('moves focus with the arrow keys and wraps', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /more ways to publish/i }));
    const [first, second] = screen.getAllByRole('menuitem');
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(second);
  });

  it('disables both buttons and skips the action while loading', () => {
    const { onClick } = setup({ loading: true });
    const primary = screen.getByRole('button', { name: /add to calendar/i }) as HTMLButtonElement;
    const toggle = screen.getByRole('button', { name: /more ways to publish/i }) as HTMLButtonElement;
    expect(primary.disabled).toBe(true);
    expect(toggle.disabled).toBe(true);
    fireEvent.click(primary);
    expect(onClick).not.toHaveBeenCalled();
  });
});
