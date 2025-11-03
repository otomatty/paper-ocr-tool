/\*\*

- OCRProcessor Component Specification
-
- Related Files:
- - Implementation: `src/components/DataInput/OCRProcessor.tsx`
- - Tests: `src/components/DataInput/OCRProcessor.test.tsx`
- - Hooks: `src/hooks/useOCR.ts`
- - Issue: `docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md`
- - Plan: `docs/03_plans/overall/20241102_01_project-overall-plan.md`
    \*/

# OCRProcessor Component Specification

## Overview

React component for managing OCR processing workflow. Handles image upload/camera capture, applies preprocessing, displays progress, and shows results.

## Requirements

### Functional Requirements

- **FR-001**: Accept image input from file upload or camera
- **FR-002**: Display OCR processing progress with status message
- **FR-003**: Show recognized text results from OCR
- **FR-004**: Support template region-based processing
- **FR-005**: Allow result editing before saving
- **FR-006**: Handle processing errors gracefully
- **FR-007**: Provide cancel functionality during processing

### Non-Functional Requirements

- **NFR-001**: Responsive design for mobile and desktop
- **NFR-002**: Real-time progress feedback (updated every 100ms)
- **NFR-003**: TypeScript strict type safety
- **NFR-004**: Accessibility (ARIA labels, keyboard navigation)

## Interface Definition

```typescript
interface OCRProcessorProps {
  /** Template with regions to process */
  template?: Template;

  /** Callback when OCR processing completes */
  onComplete?: (results: OCRRegionResult[]) => void;

  /** Callback when error occurs */
  onError?: (error: Error) => void;

  /** Enable/disable component */
  disabled?: boolean;

  /** Custom preprocessing options */
  preprocessingOptions?: UseOCROptions["preprocessingOptions"];
}

interface OCRProcessorState {
  /** Image selected for processing */
  imageData: string | null;

  /** Whether processing is active */
  isProcessing: boolean;

  /** Processing progress (0-1) */
  progress: number;

  /** Status message */
  status: string;

  /** Recognized results */
  results: OCRRegionResult[];

  /** Error message if any */
  error: string | null;

  /** Whether to show result editor */
  showResultEditor: boolean;
}
```

## Behavior Specification

### Normal Cases

#### NC-001: Image Upload

**Condition**: User selects image file via file input
**Steps**:

1. File picker opens
2. User selects image file
3. Image is validated (type, size)
4. Image displayed in preview

**Expected Result**:

- Image rendered in preview area
- Upload button becomes enabled
- Error cleared if previously shown

#### NC-002: OCR Processing

**Condition**: User clicks process button with valid image
**Steps**:

1. Processing starts
2. `isProcessing` becomes `true`
3. Progress bar appears
4. Status message updates

**Expected Result**:

- Progress increases 0 → 1
- Status shows "Processing: 50%", etc.
- Results populated when complete
- `isProcessing` becomes `false`

#### NC-003: Results Display

**Condition**: OCR processing completes successfully
**Expected Result**:

- Recognized text displayed for each region
- Confidence scores shown
- Edit button available
- Save button available

### Edge Cases

#### EC-001: Large Image

**Condition**: User selects large image (>5MB)
**Expected Result**:

- Error message: "Image size too large"
- Image not processed
- Error cleared after 5 seconds

#### EC-002: Invalid Image Format

**Condition**: User selects non-image file
**Expected Result**:

- Error message: "Invalid file type"
- Processing not started

#### EC-003: Processing Cancellation

**Condition**: User clicks cancel during processing
**Expected Result**:

- Processing stops immediately
- `isProcessing` becomes `false`
- Results cleared
- Status reset

### Error Cases

#### ER-001: OCR Engine Failure

**Condition**: OCR engine throws error
**Expected Result**:

- Error message displayed
- State preserved for retry
- Cancel button available

#### ER-002: Network Timeout

**Condition**: Processing exceeds 30 seconds
**Expected Result**:

- Processing cancelled
- Timeout error message shown
- Retry button available

## Component Structure

```
OCRProcessor
├── ImageInput (file upload + preview)
├── ProcessingProgressBar
├── ResultsList
│   ├── RegionResultItem (editable)
│   ├── RegionResultItem
│   └── RegionResultItem
├── ResultEditor (modal)
└── ActionButtons (Cancel, Save)
```

## Test Cases

### TC-001: Component Rendering

**Purpose**: Verify component renders with initial state
**Input**: Default props
**Expected**:

- Component mounts without errors
- File input rendered
- Upload button disabled (no image)

### TC-002: Image Upload

**Purpose**: Verify image can be selected and previewed
**Input**: Valid image file (PNG, 500x500px, <1MB)
**Expected**:

- Image rendered in preview
- File name displayed
- Upload button enabled

### TC-003: Processing Start

**Purpose**: Verify OCR processing starts correctly
**Input**: Valid image, click process button
**Expected**:

- Processing state activated
- Progress bar shown
- Status message displays

### TC-004: Progress Display

**Purpose**: Verify progress updates during processing
**Input**: Processing in progress
**Expected**:

- Progress percentage increases
- Status message updates
- Cancel button available

### TC-005: Results Display

**Purpose**: Verify results render after processing
**Input**: Processing completes successfully
**Expected**:

- Results list displayed
- Each region shows: id, name, text, confidence
- Edit and Save buttons available

### TC-006: Error Handling

**Purpose**: Verify errors are displayed properly
**Input**: Invalid image or OCR error
**Expected**:

- Error message shown
- Red alert styling
- Retry capability

### TC-007: Cancel Processing

**Purpose**: Verify cancellation works
**Input**: Click cancel during processing
**Expected**:

- Processing stops
- Results cleared
- State reset to initial

### TC-008: Result Editing

**Purpose**: Verify result text can be edited
**Input**: Edit button clicked, change text
**Expected**:

- Text becomes editable
- Save button enabled
- Changes preserved on save

### TC-009: Template Region Matching

**Purpose**: Verify results match template regions
**Input**: Template with 3 regions, process image
**Expected**:

- 3 results returned
- regionId matches template
- regionName from template

### TC-010: Responsive Behavior

**Purpose**: Verify component adapts to screen size
**Input**: Render on mobile viewport
**Expected**:

- Controls stack vertically
- Touch-friendly button sizes
- Text readable at smaller sizes

## Acceptance Criteria

- [ ] Component renders without errors
- [ ] File upload/camera input works
- [ ] Progress display updates in real-time
- [ ] Results display with proper formatting
- [ ] Error handling prevents crashes
- [ ] Results can be edited
- [ ] Cancel functionality works
- [ ] All tests pass (TC-001 through TC-010)
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Accessibility requirements met (ARIA labels)

## Related Components & Dependencies

### Parent Components

- `DataInputPage` - Container component
- Future: `UploadForm` - Input wrapper

### Child Components

- `Button` - UI button component
- `Layout` - Page layout wrapper
- `ProgressBar` - Progress indicator (future)
- `ResultsList` - Results display (future)

### Hooks

- `useOCR` - OCR processing management
- `useTemplate` - Template management

### Types

- `OCRRegionResult` - Result interface
- `Template` - Template interface
- `Region` - Region definition

## Implementation Notes

1. **Async Processing**: Use useOCR hook for all OCR operations
2. **State Management**: Combine local state (imageData) with hook state
3. **Error Recovery**: Always provide retry path for errors
4. **Performance**: Debounce progress updates if needed
5. **Accessibility**: Add ARIA labels for screen readers
