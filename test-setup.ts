/**
 * Test Setup File
 * Configures happy-dom for testing environment
 */

import { Window } from "happy-dom";

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
  public src = "";
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

// Mock FileReader for file upload tests
// @ts-expect-error - Mocking FileReader for testing
global.FileReader = class FileReader {
  public result: string | ArrayBuffer | null = null;
  public onload: ((event: any) => void) | null = null;
  public onerror: ((event: any) => void) | null = null;
  public readyState = 0;

  readAsDataURL(blob: Blob) {
    setTimeout(() => {
      this.readyState = 2;
      this.result =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      if (this.onload) {
        this.onload({ target: this });
      }
    }, 0);
  }

  readAsText(blob: Blob) {
    setTimeout(() => {
      this.readyState = 2;
      this.result = "test file content";
      if (this.onload) {
        this.onload({ target: this });
      }
    }, 0);
  }

  abort() {
    this.readyState = 2;
  }
};

// Mock DataTransfer for drag and drop tests
// @ts-expect-error - Mocking DataTransfer for testing
global.DataTransfer = class DataTransfer {
  private _files: File[] = [];

  get files(): FileList {
    const fileList = {
      length: this._files.length,
      item: (index: number) => this._files[index] || null,
      [Symbol.iterator]: function* () {
        yield* this._files;
      }.bind(this),
    };

    // Add array-like access
    this._files.forEach((file, index) => {
      // @ts-expect-error - Dynamic property assignment
      fileList[index] = file;
    });

    // @ts-expect-error - Cast to FileList
    return fileList;
  }

  get items() {
    const self = this;
    const files = self._files;
    return {
      length: files.length,
      add: (file: File) => {
        self._files.push(file);
        return null;
      },
      remove: (index: number) => {
        self._files.splice(index, 1);
      },
      clear: () => {
        self._files = [];
      },
      [Symbol.iterator]: function* () {
        yield* files;
      },
    };
  }

  constructor() {
    this._files = [];
  }
};

// Mock Clipboard API for copy/paste tests
if (!global.navigator.clipboard) {
  // @ts-expect-error - Mocking clipboard API
  global.navigator.clipboard = {
    writeText: async (text: string) => {
      // Store for potential verification in tests
      // @ts-expect-error - Custom property for testing
      global.navigator.clipboard._lastCopiedText = text;
      return Promise.resolve();
    },
    readText: async () => {
      // @ts-expect-error - Custom property for testing
      return Promise.resolve(global.navigator.clipboard._lastCopiedText || "");
    },
    _lastCopiedText: "",
  };
}
