/**
 * Test Setup File
 * Configures happy-dom for testing environment
 */

import { Window } from 'happy-dom';

// Set up happy-dom window
const window = new Window();

// @ts-expect-error - happy-dom Window type differs from global Window type
global.window = window;
// @ts-expect-error - happy-dom Document type differs from global Document type
global.document = window.document;
// @ts-expect-error - happy-dom Navigator type differs from global Navigator type
global.navigator = window.navigator;
// @ts-expect-error - happy-dom HTMLElement type differs from global HTMLElement type
global.HTMLElement = window.HTMLElement;
// @ts-expect-error - happy-dom HTMLCanvasElement type differs from global HTMLCanvasElement type
global.HTMLCanvasElement = window.HTMLCanvasElement;
// @ts-expect-error - happy-dom HTMLVideoElement type differs from global HTMLVideoElement type
global.HTMLVideoElement = window.HTMLVideoElement;
global.localStorage = window.localStorage;
global.sessionStorage = window.sessionStorage;

// Mock Image class for Canvas tests
// @ts-expect-error - Mocking Image for testing
global.Image = class Image {
  public src = '';
  public onload: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public width = 100;
  public height = 100;

  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
};
