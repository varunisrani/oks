'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import SliderField from './slider-field';
import ColorPicker from './color-picker';
import { Circle, Square, Triangle, Move, Type, Palette, RotateCw, LightbulbIcon } from 'lucide-react';

interface ShapeCustomizerProps {
    shape: {
        id: number;
        type: 'rectangle' | 'circle' | 'triangle';
        top: number;
        left: number;
        width: number;
        height: number;
        rotation: number;
        color: string;
        opacity: number;
    };
    handleAttributeChange: (id: number, attribute: string, value: any) => void;
    removeShape: (id: number) => void;
    duplicateShape: (shape: any) => void;
    isSelected?: boolean;
    onSelect?: () => void;
}

const ShapeCustomizer = ({ 
    shape,
    handleAttributeChange,
    removeShape,
    duplicateShape,
    isSelected,
    onSelect
}: ShapeCustomizerProps) => {
    const [activeControl, setActiveControl] = useState<string | null>(null);
    const [localShape, setLocalShape] = useState(shape);
    const [isDragging, setIsDragging] = useState(false);
    const lastUpdateRef = useRef<number>(Date.now());
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const updateDelay = 50; // ms delay for updates

    // Sync with parent when shape prop changes
    useEffect(() => {
        setLocalShape(shape);
    }, [shape]);

    // Debounced update function
    const debouncedUpdate = useCallback((attribute: string, value: any) => {
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
            const now = Date.now();
            if (now - lastUpdateRef.current > updateDelay) {
                handleAttributeChange(shape.id, attribute, value);
                lastUpdateRef.current = now;
            }
        }, updateDelay);
    }, [shape.id, handleAttributeChange, updateDelay]);

    // Update canvas whenever shape properties change
    useEffect(() => {
        const timer = setTimeout(() => {
            handleAttributeChange(shape.id, 'update', localShape);
        }, updateDelay);

        return () => clearTimeout(timer);
    }, [localShape, shape.id, handleAttributeChange]);

    // Handle local changes with immediate update
    const handleLocalChange = useCallback((attribute: string, value: any) => {
        setLocalShape(prev => {
            const newShape = {
                ...prev,
                [attribute]: value
            };
            // Notify parent of change
            handleAttributeChange(shape.id, attribute, value);
            return newShape;
        });
    }, [shape.id, handleAttributeChange]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    // Handle drag operations
    const handleDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        // Update final position
        handleAttributeChange(shape.id, 'left', localShape.left);
        handleAttributeChange(shape.id, 'top', localShape.top);
    }, [shape.id, localShape, handleAttributeChange]);

    const controls = [
        { id: 'type', icon: <Type size={20} />, label: 'Type' },
        { id: 'color', icon: <Palette size={20} />, label: 'Color' },
        { id: 'position', icon: <Move size={20} />, label: 'Position' },
        { id: 'size', icon: <Square size={20} />, label: 'Size' },
        { id: 'rotation', icon: <RotateCw size={20} />, label: 'Rotate' },
        { id: 'opacity', icon: <LightbulbIcon size={20} />, label: 'Opacity' },
    ];

    const getShapeIcon = useCallback(() => {
        switch (localShape.type) {
            case 'circle':
                return <Circle size={16} />;
            case 'triangle':
                return <Triangle size={16} />;
            default:
                return <Square size={16} />;
        }
    }, [localShape.type]);

    return (
        <AccordionItem 
            value={`shape-${localShape.id}`}
            className={`${isSelected ? 'border-2 border-primary' : ''}`}
            onClick={() => onSelect?.()}
        >
            <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                    {getShapeIcon()}
                    <span className="capitalize">{localShape.type} {localShape.id}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                {/* Mobile Controls */}
                <div className="md:hidden">
                    <ScrollArea className="w-full">
                        <div className="flex w-max gap-1 mb-2 p-1">
                            {controls.map((control) => (
                                <button
                                    key={control.id}
                                    onClick={() => setActiveControl(activeControl === control.id ? null : control.id)}
                                    className={`flex flex-col items-center justify-center min-w-[4.2rem] h-[4.2rem] rounded-lg ${
                                        activeControl === control.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                                    }`}
                                >
                                    {control.icon}
                                    <span className="text-xs mt-1">{control.label}</span>
                                </button>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    <div className="p-2">
                        {activeControl === 'type' && (
                            <select
                                className="w-full p-2 border rounded"
                                value={localShape.type}
                                onChange={(e) => handleLocalChange('type', e.target.value)}
                            >
                                <option value="rectangle">Rectangle</option>
                                <option value="circle">Circle</option>
                                <option value="triangle">Triangle</option>
                            </select>
                        )}

                        {activeControl === 'color' && (
                            <ColorPicker
                                attribute="color"
                                label="Shape Color"
                                currentColor={localShape.color}
                                handleAttributeChange={(_, value) => handleLocalChange('color', value)}
                            />
                        )}

                        {activeControl === 'position' && (
                            <div className="space-y-4">
                                <SliderField
                                    attribute="left"
                                    label="X Position"
                                    min={-100}
                                    max={100}
                                    step={1}
                                    currentValue={localShape.left}
                                    handleAttributeChange={(_, value) => handleLocalChange('left', value)}
                                />
                                <SliderField
                                    attribute="top"
                                    label="Y Position"
                                    min={-100}
                                    max={100}
                                    step={1}
                                    currentValue={localShape.top}
                                    handleAttributeChange={(_, value) => handleLocalChange('top', value)}
                                />
                            </div>
                        )}

                        {activeControl === 'size' && (
                            <div className="space-y-4">
                                <SliderField
                                    attribute="width"
                                    label="Width"
                                    min={10}
                                    max={500}
                                    step={1}
                                    currentValue={localShape.width}
                                    handleAttributeChange={(_, value) => handleLocalChange('width', value)}
                                />
                                <SliderField
                                    attribute="height"
                                    label="Height"
                                    min={10}
                                    max={500}
                                    step={1}
                                    currentValue={localShape.height}
                                    handleAttributeChange={(_, value) => handleLocalChange('height', value)}
                                />
                            </div>
                        )}

                        {activeControl === 'rotation' && (
                            <SliderField
                                attribute="rotation"
                                label="Rotation"
                                min={0}
                                max={360}
                                step={1}
                                currentValue={localShape.rotation}
                                handleAttributeChange={(_, value) => handleLocalChange('rotation', value)}
                            />
                        )}

                        {activeControl === 'opacity' && (
                            <SliderField
                                attribute="opacity"
                                label="Opacity"
                                min={0}
                                max={1}
                                step={0.1}
                                currentValue={localShape.opacity}
                                handleAttributeChange={(_, value) => handleLocalChange('opacity', value)}
                            />
                        )}
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block space-y-4 p-2">
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateShape(localShape)}
                        >
                            Duplicate
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeShape(localShape.id)}
                        >
                            Remove
                        </Button>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Type</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={localShape.type}
                            onChange={(e) => handleLocalChange('type', e.target.value)}
                        >
                            <option value="rectangle">Rectangle</option>
                            <option value="circle">Circle</option>
                            <option value="triangle">Triangle</option>
                        </select>
                    </div>

                    <ColorPicker
                        attribute="color"
                        label="Shape Color"
                        currentColor={localShape.color}
                        handleAttributeChange={(_, value) => handleLocalChange('color', value)}
                    />

                    <SliderField
                        attribute="width"
                        label="Width"
                        min={10}
                        max={500}
                        step={1}
                        currentValue={localShape.width}
                        handleAttributeChange={(_, value) => handleLocalChange('width', value)}
                    />

                    <SliderField
                        attribute="height"
                        label="Height"
                        min={10}
                        max={500}
                        step={1}
                        currentValue={localShape.height}
                        handleAttributeChange={(_, value) => handleLocalChange('height', value)}
                    />

                    <SliderField
                        attribute="left"
                        label="X Position"
                        min={-100}
                        max={100}
                        step={1}
                        currentValue={localShape.left}
                        handleAttributeChange={(_, value) => handleLocalChange('left', value)}
                    />

                    <SliderField
                        attribute="top"
                        label="Y Position"
                        min={-100}
                        max={100}
                        step={1}
                        currentValue={localShape.top}
                        handleAttributeChange={(_, value) => handleLocalChange('top', value)}
                    />

                    <SliderField
                        attribute="rotation"
                        label="Rotation"
                        min={0}
                        max={360}
                        step={1}
                        currentValue={localShape.rotation}
                        handleAttributeChange={(_, value) => handleLocalChange('rotation', value)}
                    />

                    <SliderField
                        attribute="opacity"
                        label="Opacity"
                        min={0}
                        max={1}
                        step={0.1}
                        currentValue={localShape.opacity}
                        handleAttributeChange={(_, value) => handleLocalChange('opacity', value)}
                    />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

export default React.memo(ShapeCustomizer); 