import { describe, it, expect, vi } from 'vitest';
import { InputHandler } from './input-handler.js';

/**
 * Creates a mock event target with addEventListener/removeEventListener.
 */
function createMockEventTarget() {
  const listeners = {};
  return {
    addEventListener: vi.fn((event, handler) => {
      listeners[event] = handler;
    }),
    removeEventListener: vi.fn((event, handler) => {
      if (listeners[event] === handler) {
        delete listeners[event];
      }
    }),
    _listeners: listeners,
    _dispatch(event, eventObj) {
      if (listeners[event]) {
        listeners[event](eventObj);
      }
    }
  };
}

describe('InputHandler', () => {
  function setup() {
    const mockCanvas = createMockEventTarget();
    const mockDoc = createMockEventTarget();
    const handler = new InputHandler(mockCanvas, mockDoc);
    return { mockCanvas, mockDoc, handler };
  }

  it('should register keydown listener on document', () => {
    const { mockDoc, handler } = setup();
    expect(mockDoc.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    handler.destroy();
  });

  it('should register mousedown listener on canvas', () => {
    const { mockCanvas, handler } = setup();
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
    handler.destroy();
  });

  it('should register touchstart listener on canvas', () => {
    const { mockCanvas, handler } = setup();
    expect(mockCanvas.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
    handler.destroy();
  });

  it('should invoke callback on spacebar keydown', () => {
    const { mockDoc, handler } = setup();
    const callback = vi.fn();
    handler.onAction(callback);

    mockDoc._dispatch('keydown', { code: 'Space', preventDefault: vi.fn() });

    expect(callback).toHaveBeenCalledTimes(1);
    handler.destroy();
  });

  it('should call preventDefault on spacebar to avoid page scrolling', () => {
    const { mockDoc, handler } = setup();
    handler.onAction(vi.fn());

    const event = { code: 'Space', preventDefault: vi.fn() };
    mockDoc._dispatch('keydown', event);

    expect(event.preventDefault).toHaveBeenCalled();
    handler.destroy();
  });

  it('should not invoke callback for non-spacebar keys', () => {
    const { mockDoc, handler } = setup();
    const callback = vi.fn();
    handler.onAction(callback);

    mockDoc._dispatch('keydown', { code: 'KeyA', preventDefault: vi.fn() });

    expect(callback).not.toHaveBeenCalled();
    handler.destroy();
  });

  it('should invoke callback on mousedown', () => {
    const { mockCanvas, handler } = setup();
    const callback = vi.fn();
    handler.onAction(callback);

    mockCanvas._dispatch('mousedown', {});

    expect(callback).toHaveBeenCalledTimes(1);
    handler.destroy();
  });

  it('should invoke callback on touchstart', () => {
    const { mockCanvas, handler } = setup();
    const callback = vi.fn();
    handler.onAction(callback);

    mockCanvas._dispatch('touchstart', { preventDefault: vi.fn() });

    expect(callback).toHaveBeenCalledTimes(1);
    handler.destroy();
  });

  it('should call preventDefault on touchstart to prevent mouse emulation', () => {
    const { mockCanvas, handler } = setup();
    handler.onAction(vi.fn());

    const event = { preventDefault: vi.fn() };
    mockCanvas._dispatch('touchstart', event);

    expect(event.preventDefault).toHaveBeenCalled();
    handler.destroy();
  });

  it('should not throw if no callback is registered', () => {
    const { mockCanvas, mockDoc, handler } = setup();

    expect(() => {
      mockDoc._dispatch('keydown', { code: 'Space', preventDefault: vi.fn() });
    }).not.toThrow();

    expect(() => {
      mockCanvas._dispatch('mousedown', {});
    }).not.toThrow();

    expect(() => {
      mockCanvas._dispatch('touchstart', { preventDefault: vi.fn() });
    }).not.toThrow();

    handler.destroy();
  });

  it('should remove all event listeners on destroy()', () => {
    const { mockCanvas, mockDoc, handler } = setup();
    handler.destroy();

    expect(mockDoc.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
  });

  it('should not invoke callback after destroy()', () => {
    const { mockCanvas, mockDoc, handler } = setup();
    const callback = vi.fn();
    handler.onAction(callback);
    handler.destroy();

    // After destroy, listeners are removed from the mock
    mockDoc._dispatch('keydown', { code: 'Space', preventDefault: vi.fn() });
    mockCanvas._dispatch('mousedown', {});
    mockCanvas._dispatch('touchstart', { preventDefault: vi.fn() });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should replace callback when onAction is called multiple times', () => {
    const { mockDoc, handler } = setup();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    handler.onAction(callback1);
    handler.onAction(callback2);

    mockDoc._dispatch('keydown', { code: 'Space', preventDefault: vi.fn() });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
    handler.destroy();
  });
});
