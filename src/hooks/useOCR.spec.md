/\*\*

- useOCR Hook Specification
-
- Related Files:
- - Implementation: `src/hooks/useOCR.ts`
- - Tests: `src/hooks/useOCR.test.ts`
- - Spec: `src/hooks/useOCR.spec.md`
- - Issue: `docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md`
- - Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`
    \*/

# useOCR Hook Specification

## Overview

Custom React hook for managing OCR processing with progress tracking and error handling.

## Requirements

### Functional Requirements

- **FR-001**: Initialize OCR engine on first use
- **FR-002**: Process image with OCR and return recognized text
- **FR-003**: Track progress during OCR processing
- **FR-004**: Support processing multiple regions
- **FR-005**: Handle cancellation of ongoing OCR processing
- **FR-006**: Apply image preprocessing (resize, grayscale, contrast, brightness)
- **FR-007**: Return results with confidence scores

### Non-Functional Requirements

- **NFR-001**: Response time: OCR processing should complete within 30 seconds per image
- **NFR-002**: Memory efficiency: Cleanup engine resources properly
- **NFR-003**: Type safety: Full TypeScript support
- **NFR-004**: Error handling: Graceful degradation on failures

## Interface Definition

```typescript
interface UseOCROptions {
  /** Language for OCR (default: 'jpn') */
  language?: string;

  /** Apply image preprocessing (default: true) */
  preprocessing?: boolean;

  /** Preprocessing options */
  preprocessingOptions?: {
    resize?: { width: number; height: number };
    grayscale?: boolean;
    contrast?: number;
    brightness?: number;
  };
}

interface OCRRegionResult {
  /** Region ID */
  regionId: string;

  /** Region name */
  regionName: string;

  /** Recognized text */
  text: string;

  /** Confidence level (0-100) */
  confidence: number;

  /** Processing time in milliseconds */
  processingTime: number;
}

interface UseOCRState {
  /** Whether OCR is currently processing */
  isProcessing: boolean;

  /** Current processing progress (0-1) */
  progress: number;

  /** Current status message */
  status: string;

  /** Results from completed processing */
  results: OCRRegionResult[];

  /** Error message if processing failed */
  error: string | null;
}

interface UseOCRActions {
  /** Process image with specified regions */
  processImage(
    imageData: string,
    regions?: Array<{
      id: string;
      name: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>
  ): Promise<OCRRegionResult[]>;

  /** Cancel ongoing processing */
  cancel(): Promise<void>;

  /** Reset state */
  reset(): void;
}

interface UseOCRReturn extends UseOCRState, UseOCRActions {}

function useOCR(options?: UseOCROptions): UseOCRReturn;
```

## Behavior Specification

### Normal Cases

#### NC-001: Initialize on first use

**Condition**: Hook is first called
**Expected Result**:

- OCR engine initializes asynchronously
- Initial state: `isProcessing=false`, `progress=0`, `results=[]`, `error=null`

#### NC-002: Single image OCR processing

**Condition**: `processImage()` called with image data
**Expected Result**:

- `isProcessing` becomes `true`
- `progress` increments from 0 to 1
- `status` updates with current processing stage
- Results returned with text and confidence
- `isProcessing` becomes `false`

#### NC-003: Multiple regions processing

**Condition**: `processImage()` called with multiple regions
**Expected Result**:

- Regions processed sequentially or in parallel
- Each region result includes regionId, regionName, text, confidence
- Total processing time tracked

#### NC-004: Progress tracking

**Condition**: OCR processing in progress
**Expected Result**:

- `progress` value reflects actual processing progress (0-1)
- `status` message changes during processing
- Progress callbacks triggered as processing advances

### Edge Cases

#### EC-001: Empty image data

**Condition**: `processImage()` called with empty string
**Expected Result**: Error thrown with message "Invalid image data"

#### EC-002: No regions specified

**Condition**: `processImage()` called without regions
**Expected Result**: Entire image processed as single region

#### EC-003: Cancel during processing

**Condition**: `cancel()` called while processing
**Expected Result**:

- `isProcessing` becomes `false`
- Current results kept
- Error set to "Processing cancelled"

#### EC-004: Multiple concurrent calls

**Condition**: `processImage()` called multiple times before first completes
**Expected Result**: Later calls wait for earlier one to complete or rejected

### Error Cases

#### ER-001: OCR engine initialization failure

**Condition**: Tesseract.js fails to initialize
**Expected Result**: Error message set, processing prevented

#### ER-002: Image preprocessing failure

**Condition**: Image processing throws error
**Expected Result**: Error caught and returned, OCR not attempted

#### ER-003: OCR processing timeout

**Condition**: Processing exceeds 30 seconds
**Expected Result**: Processing cancelled, error message returned

## Test Cases

### TC-001: Hook initialization

**Purpose**: Verify hook initializes correctly
**Steps**:

1. Call `useOCR()`
2. Check initial state values
3. Verify engine initializes asynchronously

**Expected**:

- `isProcessing === false`
- `progress === 0`
- `results.length === 0`
- `error === null`

### TC-002: Single image processing

**Purpose**: Verify OCR processes single image correctly
**Steps**:

1. Create test image
2. Call `processImage(imageData)`
3. Wait for completion
4. Check results

**Expected**:

- Results array has 1 item
- Result has `text`, `confidence`, `processingTime`
- Confidence is 0-100

### TC-003: Multiple regions

**Purpose**: Verify multiple regions processed
**Steps**:

1. Create test image
2. Define multiple regions
3. Call `processImage(imageData, regions)`
4. Wait for completion

**Expected**:

- Results array has N items (one per region)
- Each result has corresponding regionId
- All results completed

### TC-004: Progress tracking

**Purpose**: Verify progress updates during processing
**Steps**:

1. Start processing
2. Track progress value changes
3. Verify status message updates

**Expected**:

- Progress increases from 0 to 1
- Status message changes during processing

### TC-005: Error handling

**Purpose**: Verify errors handled gracefully
**Steps**:

1. Try processing with invalid data
2. Check error state
3. Verify hook recovers

**Expected**:

- Error message set
- isProcessing becomes false
- Can retry after error

### TC-006: Cancel operation

**Purpose**: Verify cancellation works
**Steps**:

1. Start long processing
2. Call cancel()
3. Check state

**Expected**:

- isProcessing becomes false
- Error set to "Processing cancelled"
- Results kept from before cancel

### TC-007: Reset state

**Purpose**: Verify state reset
**Steps**:

1. Process image
2. Call reset()
3. Check state

**Expected**:

- results cleared
- error cleared
- progress reset to 0
- isProcessing reset to false

### TC-008: Options configuration

**Purpose**: Verify options applied
**Steps**:

1. Create hook with options
2. Verify preprocessing applied
3. Check language setting

**Expected**:

- Preprocessing options used in image processing
- Language passed to OCR engine

### TC-009: Resource cleanup

**Purpose**: Verify resources cleaned up
**Steps**:

1. Process multiple images
2. Unmount component
3. Verify engine terminated

**Expected**:

- Engine resources released
- No memory leaks

### TC-010: Concurrent processing handling

**Purpose**: Verify concurrent calls handled
**Steps**:

1. Call processImage() twice rapidly
2. Observe behavior
3. Verify state consistency

**Expected**:

- Calls handled sequentially or with queue
- State remains consistent
- No race conditions

## Acceptance Criteria

- [ ] All test cases TC-001 through TC-010 pass
- [ ] 100% type safety with TypeScript
- [ ] Progress tracking accurate and updated regularly
- [ ] Error handling comprehensive
- [ ] Resource cleanup on unmount
- [ ] Cancellation works reliably
- [ ] No console errors in test environment
- [ ] Performance: Single region OCR < 10 seconds in test environment
