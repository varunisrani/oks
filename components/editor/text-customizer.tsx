import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { 
    CopyIcon, 
    TrashIcon,
    TextIcon
} from '@radix-ui/react-icons';

const DEFAULT_FONTS = [
    'Inter',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'Impact'
];

interface TextCustomizerProps {
    textSet: {
        id: number;
        text: string;
        fontFamily: string;
        fontSize: number;
        fontWeight: number;
        color: string;
        opacity: number;
        rotation: number;
        top: number;
        left: number;
    };
    handleAttributeChange: (id: number, attribute: string, value: any) => void;
    removeTextSet: (id: number) => void;
    duplicateTextSet: (textSet: any) => void;
    isSelected: boolean;
    onSelect: () => void;
}

export default function TextCustomizer({
    textSet,
    handleAttributeChange,
    removeTextSet,
    duplicateTextSet,
    isSelected,
    onSelect,
}: TextCustomizerProps) {
    return (
        <AccordionItem value={`text-${textSet.id}`} className="border-b">
            <AccordionTrigger
                onClick={onSelect}
                className={`hover:no-underline ${isSelected ? 'text-primary' : ''}`}
            >
                <div className="flex items-center gap-2">
                    <TextIcon className="h-4 w-4" />
                    <span>{textSet.text.substring(0, 20)}{textSet.text.length > 20 ? '...' : ''}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4 p-2">
                    {/* Text Content */}
                    <div className="space-y-2">
                        <Label>Text Content</Label>
                        <Input
                            value={textSet.text}
                            onChange={(e) => handleAttributeChange(textSet.id, 'text', e.target.value)}
                            placeholder="Enter text..."
                        />
                    </div>

                    {/* Font Family */}
                    <div className="space-y-2">
                        <Label>Font Family</Label>
                        <select
                            value={textSet.fontFamily}
                            onChange={(e) => handleAttributeChange(textSet.id, 'fontFamily', e.target.value)}
                            className="w-full p-2 rounded-md border bg-background"
                        >
                            {DEFAULT_FONTS.map(font => (
                                <option key={font} value={font} style={{ fontFamily: font }}>
                                    {font}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-2">
                        <Label>Font Size: {textSet.fontSize}</Label>
                        <Slider
                            value={[textSet.fontSize]}
                            onValueChange={(value) => handleAttributeChange(textSet.id, 'fontSize', value[0])}
                            min={10}
                            max={400}
                            step={1}
                        />
                    </div>

                    {/* Font Weight */}
                    <div className="space-y-2">
                        <Label>Font Weight: {textSet.fontWeight}</Label>
                        <Slider
                            value={[textSet.fontWeight]}
                            onValueChange={(value) => handleAttributeChange(textSet.id, 'fontWeight', value[0])}
                            min={100}
                            max={900}
                            step={100}
                        />
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={textSet.color}
                                onChange={(e) => handleAttributeChange(textSet.id, 'color', e.target.value)}
                                className="w-12 h-12 p-1"
                            />
                            <Input
                                type="text"
                                value={textSet.color}
                                onChange={(e) => handleAttributeChange(textSet.id, 'color', e.target.value)}
                                placeholder="#000000"
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* Opacity */}
                    <div className="space-y-2">
                        <Label>Opacity: {Math.round(textSet.opacity * 100)}%</Label>
                        <Slider
                            value={[textSet.opacity * 100]}
                            onValueChange={(value) => handleAttributeChange(textSet.id, 'opacity', value[0] / 100)}
                            min={0}
                            max={100}
                            step={1}
                        />
                    </div>

                    {/* Rotation */}
                    <div className="space-y-2">
                        <Label>Rotation: {textSet.rotation}°</Label>
                        <Slider
                            value={[textSet.rotation]}
                            onValueChange={(value) => handleAttributeChange(textSet.id, 'rotation', value[0])}
                            min={-180}
                            max={180}
                            step={1}
                        />
                    </div>

                    {/* Position */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>X Position: {textSet.left}</Label>
                            <Slider
                                value={[textSet.left]}
                                onValueChange={(value) => handleAttributeChange(textSet.id, 'left', value[0])}
                                min={-50}
                                max={50}
                                step={1}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Y Position: {textSet.top}</Label>
                            <Slider
                                value={[textSet.top]}
                                onValueChange={(value) => handleAttributeChange(textSet.id, 'top', value[0])}
                                min={-50}
                                max={50}
                                step={1}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateTextSet(textSet)}
                            className="gap-2"
                        >
                            <CopyIcon className="h-4 w-4" />
                            Duplicate
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTextSet(textSet.id)}
                            className="gap-2"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Remove
                        </Button>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}