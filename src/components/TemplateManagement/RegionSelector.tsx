/**
 * RegionSelector Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/components/TemplateManagement/TemplateEditor.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ src/types/template.ts
 *   └─ src/components/common/Button/Button.tsx
 *
 * Related Documentation:
 *   ├─ Spec: ./RegionSelector.spec.md
 *   ├─ Tests: ./RegionSelector.test.tsx
 *   └─ Plan: docs/03_plans/template-management/20241103_01_next-implementation-plan.md
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Region } from '../../types/template';
import { Button } from '../common/Button/Button';

interface RegionSelectorProps {
  imageData: string;
  regions?: Region[];
  onRegionsChange: (regions: Region[]) => void;
  maxRegions?: number;
  readOnly?: boolean;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface Point {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface ResizeState {
  isResizing: boolean;
  handle: ResizeHandle | null;
  targetId: string | null;
  startX: number;
  startY: number;
  originalRegion: Region | null;
}

const HANDLE_SIZE = 8;
const HANDLE_HIT_AREA = 12;
const MIN_REGION_SIZE = 10;
const MIN_DRAG_DISTANCE = 5;

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  imageData,
  regions: initialRegions = [],
  onRegionsChange,
  maxRegions = 20,
  readOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [regions, setRegions] = useState<Region[]>(initialRegions);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    handle: null,
    targetId: null,
    startX: 0,
    startY: 0,
    originalRegion: null,
  });
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<ResizeHandle | null>(null);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Load image
  useEffect(() => {
    if (!imageData) {
      setImageLoadError('画像データが指定されていません');
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImageElement(img);
      setImageLoadError(null);

      // Calculate canvas size maintaining aspect ratio
      const containerWidth = containerRef.current?.clientWidth || 800;
      const maxWidth = Math.min(containerWidth - 320, 800); // Reserve space for region list
      const maxHeight = 600;

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }

      setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
    };

    img.onerror = () => {
      setImageLoadError('画像の読み込みに失敗しました');
      setImageElement(null);
    };

    img.src = imageData;
  }, [imageData]);

  // Update regions when initialRegions change
  useEffect(() => {
    setRegions(initialRegions);
  }, [initialRegions]);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageElement) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    // Draw existing regions
    regions.forEach((region) => {
      const isSelected = region.id === selectedRegionId;
      const isHovered = region.id === hoveredRegionId;

      const x = region.coordinates.x * canvas.width;
      const y = region.coordinates.y * canvas.height;
      const width = region.coordinates.width * canvas.width;
      const height = region.coordinates.height * canvas.height;

      // Draw rectangle
      ctx.strokeStyle = isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : '#10b981';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(x, y, width, height);

      // Draw semi-transparent fill
      ctx.fillStyle = isSelected
        ? 'rgba(59, 130, 246, 0.1)'
        : isHovered
          ? 'rgba(96, 165, 250, 0.1)'
          : 'rgba(16, 185, 129, 0.05)';
      ctx.fillRect(x, y, width, height);

      // Draw label
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${region.order}. ${region.name}`, x + 4, y + 16);

      // Draw resize handles for selected region
      if (isSelected && !readOnly) {
        const handles: { handle: ResizeHandle; x: number; y: number }[] = [
          { handle: 'nw', x: x - HANDLE_SIZE / 2, y: y - HANDLE_SIZE / 2 },
          {
            handle: 'n',
            x: x + width / 2 - HANDLE_SIZE / 2,
            y: y - HANDLE_SIZE / 2,
          },
          {
            handle: 'ne',
            x: x + width - HANDLE_SIZE / 2,
            y: y - HANDLE_SIZE / 2,
          },
          {
            handle: 'e',
            x: x + width - HANDLE_SIZE / 2,
            y: y + height / 2 - HANDLE_SIZE / 2,
          },
          {
            handle: 'se',
            x: x + width - HANDLE_SIZE / 2,
            y: y + height - HANDLE_SIZE / 2,
          },
          {
            handle: 's',
            x: x + width / 2 - HANDLE_SIZE / 2,
            y: y + height - HANDLE_SIZE / 2,
          },
          {
            handle: 'sw',
            x: x - HANDLE_SIZE / 2,
            y: y + height - HANDLE_SIZE / 2,
          },
          {
            handle: 'w',
            x: x - HANDLE_SIZE / 2,
            y: y + height / 2 - HANDLE_SIZE / 2,
          },
        ];

        handles.forEach(({ handle, x: hx, y: hy }) => {
          ctx.fillStyle = hoveredHandle === handle ? '#2563eb' : '#3b82f6';
          ctx.fillRect(hx, hy, HANDLE_SIZE, HANDLE_SIZE);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(hx, hy, HANDLE_SIZE, HANDLE_SIZE);
        });
      }
    });

    // Draw current drag rectangle
    if (dragState.isDragging && !resizeState.isResizing) {
      const x = Math.min(dragState.startX, dragState.currentX);
      const y = Math.min(dragState.startY, dragState.currentY);
      const width = Math.abs(dragState.currentX - dragState.startX);
      const height = Math.abs(dragState.currentY - dragState.startY);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(x, y, width, height);
      ctx.setLineDash([]);
    }
  }, [
    imageElement,
    regions,
    selectedRegionId,
    hoveredRegionId,
    hoveredHandle,
    dragState,
    resizeState,
    readOnly,
  ]);

  // Redraw canvas when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Convert canvas coordinates to relative coordinates
  const toRelative = useCallback((x: number, y: number, width?: number, height?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, width: 0, height: 0 };

    return {
      x: Math.max(0, Math.min(1, x / canvas.width)),
      y: Math.max(0, Math.min(1, y / canvas.height)),
      width: width !== undefined ? Math.max(0, Math.min(1, width / canvas.width)) : 0,
      height: height !== undefined ? Math.max(0, Math.min(1, height / canvas.height)) : 0,
    };
  }, []);

  // Convert relative coordinates to canvas coordinates
  const toAbsolute = useCallback(
    (relX: number, relY: number, relWidth?: number, relHeight?: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0, width: 0, height: 0 };

      return {
        x: relX * canvas.width,
        y: relY * canvas.height,
        width: relWidth !== undefined ? relWidth * canvas.width : 0,
        height: relHeight !== undefined ? relHeight * canvas.height : 0,
      };
    },
    []
  );

  // Get mouse/touch position relative to canvas
  const getCanvasPosition = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: Math.max(0, Math.min(canvas.width, clientX - rect.left)),
      y: Math.max(0, Math.min(canvas.height, clientY - rect.top)),
    };
  }, []);

  // Find region at point
  const findRegionAtPoint = useCallback(
    (x: number, y: number): Region | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      // Check in reverse order (top region first)
      for (let i = regions.length - 1; i >= 0; i--) {
        const region = regions[i];
        const abs = toAbsolute(
          region.coordinates.x,
          region.coordinates.y,
          region.coordinates.width,
          region.coordinates.height
        );

        if (x >= abs.x && x <= abs.x + abs.width && y >= abs.y && y <= abs.y + abs.height) {
          return region;
        }
      }

      return null;
    },
    [regions, toAbsolute]
  );

  // Find resize handle at point
  const findHandleAtPoint = useCallback(
    (x: number, y: number, regionId: string): ResizeHandle | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const region = regions.find((r) => r.id === regionId);
      if (!region) return null;

      const abs = toAbsolute(
        region.coordinates.x,
        region.coordinates.y,
        region.coordinates.width,
        region.coordinates.height
      );

      const handles: { handle: ResizeHandle; x: number; y: number }[] = [
        { handle: 'nw', x: abs.x, y: abs.y },
        { handle: 'n', x: abs.x + abs.width / 2, y: abs.y },
        { handle: 'ne', x: abs.x + abs.width, y: abs.y },
        { handle: 'e', x: abs.x + abs.width, y: abs.y + abs.height / 2 },
        { handle: 'se', x: abs.x + abs.width, y: abs.y + abs.height },
        { handle: 's', x: abs.x + abs.width / 2, y: abs.y + abs.height },
        { handle: 'sw', x: abs.x, y: abs.y + abs.height },
        { handle: 'w', x: abs.x, y: abs.y + abs.height / 2 },
      ];

      for (const { handle, x: hx, y: hy } of handles) {
        if (Math.abs(x - hx) <= HANDLE_HIT_AREA / 2 && Math.abs(y - hy) <= HANDLE_HIT_AREA / 2) {
          return handle;
        }
      }

      return null;
    },
    [regions, toAbsolute]
  );

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (readOnly) return;

      const pos = getCanvasPosition(e);

      // Check if clicking on a resize handle
      if (selectedRegionId) {
        const handle = findHandleAtPoint(pos.x, pos.y, selectedRegionId);
        if (handle) {
          const region = regions.find((r) => r.id === selectedRegionId);
          if (region) {
            setResizeState({
              isResizing: true,
              handle,
              targetId: selectedRegionId,
              startX: pos.x,
              startY: pos.y,
              originalRegion: region,
            });
            return;
          }
        }
      }

      // Check if clicking on an existing region
      const clickedRegion = findRegionAtPoint(pos.x, pos.y);
      if (clickedRegion) {
        setSelectedRegionId(clickedRegion.id);
        return;
      }

      // Start new region creation
      if (regions.length >= maxRegions) {
        alert(`最大${maxRegions}個までの領域しか作成できません`);
        return;
      }

      setSelectedRegionId(null);
      setDragState({
        isDragging: true,
        startX: pos.x,
        startY: pos.y,
        currentX: pos.x,
        currentY: pos.y,
      });
    },
    [
      readOnly,
      selectedRegionId,
      regions,
      maxRegions,
      getCanvasPosition,
      findHandleAtPoint,
      findRegionAtPoint,
    ]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const pos = getCanvasPosition(e);

      // Update hover state
      if (!dragState.isDragging && !resizeState.isResizing) {
        const hoveredRegion = findRegionAtPoint(pos.x, pos.y);
        setHoveredRegionId(hoveredRegion?.id || null);

        if (selectedRegionId) {
          const handle = findHandleAtPoint(pos.x, pos.y, selectedRegionId);
          setHoveredHandle(handle);
        } else {
          setHoveredHandle(null);
        }
      }

      // Update drag state
      if (dragState.isDragging) {
        setDragState((prev) => ({
          ...prev,
          currentX: pos.x,
          currentY: pos.y,
        }));
        drawCanvas();
      }

      // Update resize state
      if (resizeState.isResizing && resizeState.originalRegion) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const deltaX = pos.x - resizeState.startX;
        const deltaY = pos.y - resizeState.startY;
        const original = resizeState.originalRegion;
        const abs = toAbsolute(
          original.coordinates.x,
          original.coordinates.y,
          original.coordinates.width,
          original.coordinates.height
        );

        let newX = abs.x;
        let newY = abs.y;
        let newWidth = abs.width;
        let newHeight = abs.height;

        // Apply resize based on handle
        switch (resizeState.handle) {
          case 'nw':
            newX = abs.x + deltaX;
            newY = abs.y + deltaY;
            newWidth = abs.width - deltaX;
            newHeight = abs.height - deltaY;
            break;
          case 'n':
            newY = abs.y + deltaY;
            newHeight = abs.height - deltaY;
            break;
          case 'ne':
            newY = abs.y + deltaY;
            newWidth = abs.width + deltaX;
            newHeight = abs.height - deltaY;
            break;
          case 'e':
            newWidth = abs.width + deltaX;
            break;
          case 'se':
            newWidth = abs.width + deltaX;
            newHeight = abs.height + deltaY;
            break;
          case 's':
            newHeight = abs.height + deltaY;
            break;
          case 'sw':
            newX = abs.x + deltaX;
            newWidth = abs.width - deltaX;
            newHeight = abs.height + deltaY;
            break;
          case 'w':
            newX = abs.x + deltaX;
            newWidth = abs.width - deltaX;
            break;
        }

        // Ensure minimum size
        if (newWidth < MIN_REGION_SIZE) {
          newWidth = MIN_REGION_SIZE;
          newX = abs.x + abs.width - MIN_REGION_SIZE;
        }
        if (newHeight < MIN_REGION_SIZE) {
          newHeight = MIN_REGION_SIZE;
          newY = abs.y + abs.height - MIN_REGION_SIZE;
        }

        // Constrain to canvas bounds
        newX = Math.max(0, newX);
        newY = Math.max(0, newY);
        newWidth = Math.min(canvas.width - newX, newWidth);
        newHeight = Math.min(canvas.height - newY, newHeight);

        // Update region
        const relative = toRelative(newX, newY, newWidth, newHeight);
        const updatedRegions = regions.map((r) =>
          r.id === resizeState.targetId ? { ...r, coordinates: relative } : r
        );
        setRegions(updatedRegions);
        onRegionsChange(updatedRegions);
      }
    },
    [
      dragState.isDragging,
      resizeState,
      selectedRegionId,
      regions,
      getCanvasPosition,
      findRegionAtPoint,
      findHandleAtPoint,
      drawCanvas,
      toAbsolute,
      toRelative,
      onRegionsChange,
    ]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (resizeState.isResizing) {
      setResizeState({
        isResizing: false,
        handle: null,
        targetId: null,
        startX: 0,
        startY: 0,
        originalRegion: null,
      });
      return;
    }

    if (dragState.isDragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const x = Math.min(dragState.startX, dragState.currentX);
      const y = Math.min(dragState.startY, dragState.currentY);
      const width = Math.abs(dragState.currentX - dragState.startX);
      const height = Math.abs(dragState.currentY - dragState.startY);

      // Check minimum size
      if (width >= MIN_DRAG_DISTANCE && height >= MIN_DRAG_DISTANCE) {
        // Constrain to canvas bounds
        const constrainedWidth = Math.min(width, canvas.width - x);
        const constrainedHeight = Math.min(height, canvas.height - y);

        if (constrainedWidth >= MIN_REGION_SIZE && constrainedHeight >= MIN_REGION_SIZE) {
          const relative = toRelative(x, y, constrainedWidth, constrainedHeight);
          const newRegion: Region = {
            id: `region-${Date.now()}`,
            name: `領域${regions.length + 1}`,
            coordinates: relative,
            order: regions.length + 1,
          };

          const updatedRegions = [...regions, newRegion];
          setRegions(updatedRegions);
          setSelectedRegionId(newRegion.id);
          onRegionsChange(updatedRegions);
        }
      }

      setDragState({
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
      });
    }
  }, [dragState, resizeState, regions, toRelative, onRegionsChange]);

  // Handle region name change
  const handleNameChange = useCallback(
    (id: string, newName: string) => {
      const updatedRegions = regions.map((r) =>
        r.id === id ? { ...r, name: newName.trim() || r.name } : r
      );
      setRegions(updatedRegions);
      onRegionsChange(updatedRegions);
    },
    [regions, onRegionsChange]
  );

  // Handle region delete
  const handleDelete = useCallback(
    (id: string) => {
      const updatedRegions = regions
        .filter((r) => r.id !== id)
        .map((r, index) => ({ ...r, order: index + 1 }));
      setRegions(updatedRegions);
      if (selectedRegionId === id) {
        setSelectedRegionId(null);
      }
      onRegionsChange(updatedRegions);
    },
    [regions, selectedRegionId, onRegionsChange]
  );

  // Handle region order change
  const handleMoveUp = useCallback(
    (id: string) => {
      const index = regions.findIndex((r) => r.id === id);
      if (index <= 0) return;

      const updatedRegions = [...regions];
      [updatedRegions[index - 1], updatedRegions[index]] = [
        updatedRegions[index],
        updatedRegions[index - 1],
      ];
      updatedRegions.forEach((r, i) => {
        r.order = i + 1;
      });

      setRegions(updatedRegions);
      onRegionsChange(updatedRegions);
    },
    [regions, onRegionsChange]
  );

  const handleMoveDown = useCallback(
    (id: string) => {
      const index = regions.findIndex((r) => r.id === id);
      if (index < 0 || index >= regions.length - 1) return;

      const updatedRegions = [...regions];
      [updatedRegions[index], updatedRegions[index + 1]] = [
        updatedRegions[index + 1],
        updatedRegions[index],
      ];
      updatedRegions.forEach((r, i) => {
        r.order = i + 1;
      });

      setRegions(updatedRegions);
      onRegionsChange(updatedRegions);
    },
    [regions, onRegionsChange]
  );

  // Handle region list item click
  const handleRegionListClick = useCallback((id: string) => {
    setSelectedRegionId(id);
  }, []);

  if (imageLoadError) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 mb-4">{imageLoadError}</p>
          <Button variant="secondary" onClick={() => setImageLoadError(null)}>
            再試行
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex gap-4">
      <div className="flex-1">
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          />
        </div>
        {!readOnly && (
          <p className="text-sm text-gray-600 mt-2">
            {regions.length === 0
              ? 'ドラッグして新規領域を選択してください'
              : `${regions.length}/${maxRegions} 個の領域`}
          </p>
        )}
      </div>

      <div className="w-80 border-2 border-gray-300 rounded-lg p-4 bg-white">
        <h3 className="font-semibold mb-4">領域リスト</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {regions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">領域が選択されていません</p>
          ) : (
            regions.map((region, index) => (
              <button
                key={region.id}
                type="button"
                className={`w-full border rounded p-2 text-left ${
                  region.id === selectedRegionId ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
                onClick={() => handleRegionListClick(region.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{region.order}.</span>
                  {!readOnly && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleMoveUp(region.id);
                        }}
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleMoveDown(region.id);
                        }}
                        disabled={index === regions.length - 1}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDelete(region.id);
                        }}
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={region.name}
                  onChange={(e) => handleNameChange(region.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  disabled={readOnly}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="領域名を入力"
                />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
