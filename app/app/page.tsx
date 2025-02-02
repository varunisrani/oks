
'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModeToggle } from '@/components/mode-toggle';
import TextCustomizer from '@/components/editor/text-customizer';
import ShapeCustomizer from '@/components/editor/shape-customizer';
import { 
    PlusIcon, 
    ReloadIcon, 
    DownloadIcon, 
    TextIcon, 
    SquareIcon, 
    UpdateIcon as RefreshIcon, 
    StarIcon as SparklesIcon, 
    ImageIcon, 
    UploadIcon 
} from '@radix-ui/react-icons';
import { removeBackground } from "@imgly/background-removal";
import axios from 'axios';
import Groq from 'groq-sdk';
import { Label } from '@/components/ui/label';
import OpenAI from 'openai';

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

export default function AppPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [isImageSetupDone, setIsImageSetupDone] = useState<boolean>(false);
    const [removedBgImageUrl, setRemovedBgImageUrl] = useState<string | null>(null);
    const [textSets, setTextSets] = useState<Array<any>>([]);
    const [shapes, setShapes] = useState<Array<any>>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [colorTheme, setColorTheme] = useState<string | null>(null);
    const [groqResponse, setGroqResponse] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [promptText, setPromptText] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const updateCanvas = useCallback(() => {
        if (!canvasRef.current || !isImageSetupDone || !selectedImage) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bgImg = new window.Image();
        bgImg.crossOrigin = "anonymous";
        
        bgImg.onload = () => {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            // Draw shapes first (behind text)
            shapes.forEach(shape => {
                ctx.save();
                const x = canvas.width * (shape.left + 50) / 100;
                const y = canvas.height * (50 - shape.top) / 100;
                
                ctx.translate(x, y);
                ctx.rotate((shape.rotation * Math.PI) / 180);
                ctx.globalAlpha = shape.opacity;
                
                ctx.fillStyle = shape.color;
                ctx.beginPath();
                
                const scaledWidth = (shape.width / 100) * canvas.width;
                const scaledHeight = (shape.height / 100) * canvas.height;
                
                if (shape.type === 'circle') {
                    ctx.arc(0, 0, scaledWidth / 2, 0, Math.PI * 2);
                } else if (shape.type === 'triangle') {
                    ctx.moveTo(-scaledWidth / 2, scaledHeight / 2);
                    ctx.lineTo(0, -scaledHeight / 2);
                    ctx.lineTo(scaledWidth / 2, scaledHeight / 2);
                } else {
                    ctx.rect(-scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
                }
                
                ctx.fill();
                ctx.restore();
            });

            // Draw text elements
            textSets.forEach(textSet => {
                ctx.save();
                ctx.font = `${textSet.fontWeight} ${textSet.fontSize * 3}px ${textSet.fontFamily}`;
                ctx.fillStyle = textSet.color;
                ctx.globalAlpha = textSet.opacity;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const x = canvas.width * (textSet.left + 50) / 100;
                const y = canvas.height * (50 - textSet.top) / 100;

                ctx.translate(x, y);
                ctx.rotate((textSet.rotation * Math.PI) / 180);
                ctx.fillText(textSet.text, 0, 0);
                ctx.restore();
            });

            // Draw removed background last
            if (removedBgImageUrl) {
                const removedBgImg = new window.Image();
                removedBgImg.crossOrigin = "anonymous";
                removedBgImg.onload = () => {
                    ctx.drawImage(removedBgImg, 0, 0, canvas.width, canvas.height);
                };
                removedBgImg.src = removedBgImageUrl;
            }
        };
        
        bgImg.src = selectedImage;
    }, [shapes, textSets, selectedImage, isImageSetupDone, removedBgImageUrl]);

    useEffect(() => {
        if (isImageSetupDone && selectedImage) {
            updateCanvas();
        }
    }, [isImageSetupDone, selectedImage, updateCanvas]);

    useEffect(() => {
        if (isImageSetupDone && (shapes.length > 0 || textSets.length > 0)) {
            updateCanvas();
        }
    }, [shapes, textSets, isImageSetupDone, updateCanvas]);

    const handleUploadImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const analyzeImageWithGroq = async (base64Image: string) => {
        setIsAnalyzing(true);
        console.log('Starting Groq analysis...');
        try {
            const groq = new Groq({
                apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
                dangerouslyAllowBrowser: true
            });

            // Remove the data URL prefix if present
            const base64WithoutPrefix = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

            console.log('Sending request to Groq API...');
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Analyze the image and provide two things: 1) Recommend suitable background images that would enhance the main element. 2) Create a detailed DALL-E prompt for generating each suggested background. Format the response as JSON with the following structure: { suggestions: [{ description: 'description of background', dallePrompt: 'detailed prompt for DALL-E' }] }"
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64WithoutPrefix}`
                                }
                            }
                        ]
                    }
                ],
                model: "llama-3.2-90b-vision-preview",
                temperature: 0.8,
                max_tokens: 1024,
                top_p: 1,
                stream: false
            });

            const responseMessage = chatCompletion.choices[0].message.content;
            console.log('Groq API Response:', responseMessage);
            setGroqResponse(responseMessage);
        } catch (error) {
            console.error('Error analyzing image with Groq:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('File upload started...');
        const file = event.target.files?.[0];
        if (file) {
            console.log('File details:', {
                name: file.name,
                type: file.type,
                size: file.size
            });

            // Create object URL for display and background removal
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);

            // Read file as base64 for Groq API
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result as string;
                setImageBase64(base64);
                console.log('Base64 image loaded');

                try {
                    // First analyze with Groq for both background and color theme
                    console.log('Starting Groq analyses...');
                    await Promise.all([
                        analyzeImageWithGroq(base64),
                        analyzeColorTheme(base64)
                    ]);
                    console.log('Groq analyses completed');

                    // Then proceed with background removal
                    console.log('Starting background removal...');
                    await setupImage(imageUrl);
                    console.log('Background removal completed');
                } catch (error) {
                    console.error('Error in image processing:', error);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeColorTheme = async (base64Image: string) => {
        try {
            const groq = new Groq({
                apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
                dangerouslyAllowBrowser: true
            });

            // Remove the data URL prefix if present
            const base64WithoutPrefix = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

            console.log('Sending request to Groq API for color analysis...');
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Provide only the color codes for text, background, and shapes based on the image. Format the response as JSON with the following structure: { textColors: [array of hex codes], backgroundColors: [array of hex codes], shapeColors: [array of hex codes] }"
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64WithoutPrefix}`
                                }
                            }
                        ]
                    }
                ],
                model: "llama-3.2-90b-vision-preview",
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 1,
                stream: false
            });

            const responseMessage = chatCompletion.choices[0].message.content;
            console.log('Groq API Color Response:', responseMessage);
            setColorTheme(responseMessage);
        } catch (error) {
            console.error('Error analyzing color theme:', error);
        }
    };

    const setupImage = async (imageUrl: string) => {
        try {
            const imageBlob = await removeBackground(imageUrl);
            const url = URL.createObjectURL(imageBlob);
            setRemovedBgImageUrl(url);
            setIsImageSetupDone(true);
        } catch (error) {
            console.error(error);
        }
    };

    const addNewTextSet = () => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, {
            id: newId,
            text: 'edit',
            fontFamily: 'Inter',
            top: 0,
            left: 0,
            color: 'white',
            fontSize: 200,
            fontWeight: 800,
            opacity: 1,
            shadowColor: 'rgba(0, 0, 0, 0.8)',
            shadowSize: 4,
            rotation: 0
        }]);
    };

    const addNewShape = useCallback(() => {
        const newId = Math.max(...shapes.map(shape => shape.id), 0) + 1;
        const newShape = {
            id: newId,
            type: 'rectangle',
            top: 0,
            left: 0,
            width: 100,
            height: 100,
            rotation: 0,
            color: '#000000',
            opacity: 1
        };
        setShapes(prev => [...prev, newShape]);
        setSelectedItemId(newId);
        setTimeout(updateCanvas, 0);
    }, [shapes, updateCanvas]);

    const handleShapeAttributeChange = useCallback((id: number, attribute: string, value: any) => {
        setShapes(prev => {
            const newShapes = prev.map(shape => 
                shape.id === id ? { ...shape, [attribute]: value } : shape
            );
            setTimeout(updateCanvas, 0);
            return newShapes;
        });
    }, [updateCanvas]);

    const handleTextAttributeChange = useCallback((id: number, attribute: string, value: any) => {
        setTextSets(prev => {
            const newTextSets = prev.map(set => 
                set.id === id ? { ...set, [attribute]: value } : set
            );
            setTimeout(updateCanvas, 0);
            return newTextSets;
        });
    }, [updateCanvas]);

    const duplicateShape = (shape: any) => {
        const newId = Math.max(...shapes.map(s => s.id), 0) + 1;
        const newShape = { ...shape, id: newId };
        setShapes(prev => [...prev, newShape]);
        setSelectedItemId(newId);
        setTimeout(updateCanvas, 0);
    };

    const removeShape = (id: number) => {
        setShapes(prev => {
            const newShapes = prev.filter(shape => shape.id !== id);
            setTimeout(updateCanvas, 0);
            return newShapes;
        });
        if (selectedItemId === id) {
            setSelectedItemId(null);
        }
    };

    const duplicateTextSet = (textSet: any) => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, { ...textSet, id: newId }]);
    };

    const removeTextSet = (id: number) => {
        setTextSets(prev => prev.filter(set => set.id !== id));
    };

    const saveCompositeImage = useCallback(() => {
        console.log('Save image process initiated...');
        
        if (!canvasRef.current || !selectedImage) {
            console.error('Cannot save: Missing required elements', {
                canvas: !!canvasRef.current,
                hasImage: !!selectedImage
            });
            return;
        }

        setIsSaving(true);
        console.log('Starting image composition...');
        
        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Cannot get canvas context');
                setIsSaving(false);
                return;
            }

            const img = new window.Image();
            img.crossOrigin = "anonymous";
            
            img.onload = () => {
                // Set canvas dimensions to match image
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw original image
                ctx.drawImage(img, 0, 0);
                
                // Draw shapes
                shapes.forEach(shape => {
                    ctx.save();
                    const x = canvas.width * (shape.left + 50) / 100;
                    const y = canvas.height * (50 - shape.top) / 100;
                    
                    ctx.translate(x, y);
                    ctx.rotate((shape.rotation * Math.PI) / 180);
                    ctx.globalAlpha = shape.opacity;
                    
                    ctx.fillStyle = shape.color;
                    ctx.beginPath();
                    
                    const scaledWidth = (shape.width / 100) * canvas.width;
                    const scaledHeight = (shape.height / 100) * canvas.height;
                    
                    if (shape.type === 'circle') {
                        ctx.arc(0, 0, scaledWidth / 2, 0, Math.PI * 2);
                    } else if (shape.type === 'triangle') {
                        ctx.moveTo(-scaledWidth/2, scaledHeight/2);
                        ctx.lineTo(0, -scaledHeight/2);
                        ctx.lineTo(scaledWidth/2, scaledHeight/2);
                    } else {
                        ctx.rect(-scaledWidth/2, -scaledHeight/2, scaledWidth, scaledHeight);
                    }
                    
                    ctx.fill();
                    ctx.restore();
                });

                // Draw text
                textSets.forEach(textSet => {
                    ctx.save();
                    ctx.font = `${textSet.fontWeight} ${textSet.fontSize * 3}px ${textSet.fontFamily}`;
                    ctx.fillStyle = textSet.color;
                    ctx.globalAlpha = textSet.opacity;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    const x = canvas.width * (textSet.left + 50) / 100;
                    const y = canvas.height * (50 - textSet.top) / 100;

                    ctx.translate(x, y);
                    ctx.rotate((textSet.rotation * Math.PI) / 180);
                    ctx.fillText(textSet.text, 0, 0);
                    ctx.restore();
                });

                // If there's a removed background, draw it last
                if (removedBgImageUrl) {
                    const removedBgImg = new window.Image();
                    removedBgImg.crossOrigin = "anonymous";
                    removedBgImg.onload = () => {
                        ctx.drawImage(removedBgImg, 0, 0, canvas.width, canvas.height);
                        downloadImage(canvas);
                    };
                    removedBgImg.onerror = (error) => {
                        console.error('Error loading removed background:', error);
                        downloadImage(canvas);
                    };
                    removedBgImg.src = removedBgImageUrl;
                } else {
                    downloadImage(canvas);
                }
            };

            img.onerror = (error) => {
                console.error('Error loading image:', error);
                setIsSaving(false);
            };

            img.src = selectedImage;

        } catch (error) {
            console.error('Error in save process:', error);
            setIsSaving(false);
        }

        function downloadImage(canvas: HTMLCanvasElement) {
            try {
                console.log('Preparing download...');
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const fileName = `edited-image-${timestamp}.png`;
                
                const dataUrl = canvas.toDataURL('image/png', 1.0);
                const link = document.createElement('a');
                link.download = fileName;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log('Download complete:', fileName);
            } catch (error) {
                console.error('Error in download process:', error);
            } finally {
                setIsSaving(false);
            }
        }
    }, [shapes, textSets, selectedImage, removedBgImageUrl]);

    const generateImage = async (prompt: string) => {
        if (!prompt) return;
        
        setIsGenerating(true);
        console.log('Starting OpenAI image generation with prompt:', prompt);

        try {
            const openai = new OpenAI({
                apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
                dangerouslyAllowBrowser: true
            });

            const response = await openai.images.generate({
                model: "dall-e-2",
                prompt: prompt,
                n: 1,
                size: "512x512",
                response_format: "url",
            });

            if (response.data[0].url) {
                console.log('Image generated successfully');
                // Use the proxy URL instead of the direct DALL-E URL
                const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(response.data[0].url)}`;
                setGeneratedImage(proxyUrl);
            }

        } catch (error) {
            console.error('Error in OpenAI image generation:', error);
            if (error instanceof Error) {
                console.log('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'Present' : 'Missing'
                });
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const FontSelect = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
        return (
            <select 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 rounded-md border bg-background"
            >
                {DEFAULT_FONTS.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                    </option>
                ))}
            </select>
        );
    };

    return (
        <div className='flex flex-col h-screen'>
            <header className='flex flex-row items-center justify-between p-6 px-8 backdrop-blur-sm bg-background/60 sticky top-0 z-50 border-b'>
                <h2 className="text-4xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                    <span className="block md:hidden">TBI</span>
                    <span className="hidden md:block">Text behind image editor</span>
                    <span className="text-sm text-muted-foreground font-normal hidden md:inline-block">
                        AI-powered image editor
                    </span>
                </h2>
                <div className='flex gap-4 items-center'>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept=".jpg, .jpeg, .png"
                    />
                    <div className='flex items-center gap-3'>
                        <Button 
                            onClick={handleUploadImage}
                            className="gap-2"
                            size="sm"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Upload image
                        </Button>
                        {selectedImage && (
                            <Button 
                                onClick={saveCompositeImage} 
                                className='hidden md:flex gap-2'
                                variant="secondary"
                                size="sm"
                                disabled={isSaving || !isImageSetupDone}
                            >
                                {isSaving ? (
                                    <>
                                        <ReloadIcon className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <DownloadIcon className="h-4 w-4" />
                                        Save image
                                    </>
                                )}
                            </Button>
                        )}
                        <ModeToggle />
                    </div>
                </div>
            </header>
            <Separator />
            {selectedImage ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6'>
                    <div className="space-y-6">
                        <canvas 
                            ref={canvasRef}
                            style={{ display: 'none' }}
                            className="absolute"
                        />
                        <div className="flex items-center gap-2">
                            <Button onClick={addNewTextSet} size="sm" variant="outline" className="gap-2">
                                <TextIcon className="h-4 w-4" />
                                Add Text
                            </Button>
                            <Button onClick={addNewShape} size="sm" variant="outline" className="gap-2">
                                <SquareIcon className="h-4 w-4" />
                                Add Shape
                            </Button>
                        </div>

                        {/* Image Editor Area */}
                        <div className="aspect-video w-full rounded-lg border bg-muted/50 relative overflow-hidden">
                            {isImageSetupDone ? (
                                <div className="relative w-full h-full">
                                    <NextImage
                                        src={selectedImage}
                                        alt="Uploaded"
                                        layout="fill"
                                        objectFit="contain"
                                        className="transition-all duration-200"
                                        priority
                                        loading="eager"
                                    />
                                    {/* Text and Shape overlays */}
                                    {isImageSetupDone && textSets.map(textSet => (
                                        <div
                                            key={textSet.id}
                                            style={{
                                                position: 'absolute',
                                                top: `${50 - textSet.top}%`,
                                                left: `${textSet.left + 50}%`,
                                                transform: `translate(-50%, -50%) rotate(${textSet.rotation}deg)`,
                                                color: textSet.color,
                                                textAlign: 'center',
                                                fontSize: `${textSet.fontSize}px`,
                                                fontWeight: textSet.fontWeight,
                                                fontFamily: textSet.fontFamily,
                                                opacity: textSet.opacity,
                                                zIndex: 10
                                            }}
                                        >
                                            {textSet.text}
                                        </div>
                                    ))}

                                    {isImageSetupDone && shapes.map(shape => (
                                        <div
                                            key={shape.id}
                                            style={{
                                                position: 'absolute',
                                                top: `${50 - shape.top}%`,
                                                left: `${shape.left + 50}%`,
                                                transform: `translate(-50%, -50%) rotate(${shape.rotation}deg)`,
                                                width: `${shape.width}px`,
                                                height: `${shape.height}px`,
                                                backgroundColor: shape.color,
                                                opacity: shape.opacity,
                                                borderRadius: shape.type === 'circle' ? '50%' : 0,
                                                clipPath: shape.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                                                zIndex: 5,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                            onClick={() => setSelectedItemId(shape.id)}
                                            className={`${selectedItemId === shape.id ? 'ring-2 ring-primary' : ''} hover:ring-2 hover:ring-primary/50`}
                                        />
                                    ))}

                                    {removedBgImageUrl && (
                                        <NextImage
                                            src={removedBgImageUrl}
                                            alt="Removed bg"
                                            layout="fill"
                                            objectFit="contain"
                                            objectPosition="center"
                                            className="absolute top-0 left-0 w-full h-full"
                                            style={{ zIndex: 15 }}
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full bg-muted/10 animate-pulse">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-muted animate-pulse"></div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <ReloadIcon className="h-4 w-4 animate-spin" />
                                            <span className="relative">
                                                Processing image
                                                <span className="absolute -right-4 animate-[bounce_1s_infinite]">.</span>
                                                <span className="absolute -right-7 animate-[bounce_1s_infinite_0.2s]">.</span>
                                                <span className="absolute -right-10 animate-[bounce_1s_infinite_0.4s]">.</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* AI Analysis Section */}
                        {(isAnalyzing || groqResponse || colorTheme) && (
                            <div className="rounded-lg border bg-card">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <SparklesIcon className="h-5 w-5 text-primary" />
                                        AI Analysis
                                        {isAnalyzing && (
                                            <div className="inline-flex items-center">
                                                <RefreshIcon className="h-4 w-4 animate-spin ml-2" />
                                                <div className="ml-2 text-sm text-muted-foreground">
                                                    <span className="relative">
                                                        Analyzing
                                                        <span className="absolute -right-4 animate-[bounce_1s_infinite]">.</span>
                                                        <span className="absolute -right-7 animate-[bounce_1s_infinite_0.2s]">.</span>
                                                        <span className="absolute -right-10 animate-[bounce_1s_infinite_0.4s]">.</span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </h3>
                                    
                                    {isAnalyzing ? (
                                        <div className="space-y-4">
                                            <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                                            <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                                            <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Background Suggestions */}
                                            {groqResponse && (
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-sm">Background Suggestions</h4>
                                                    <div className="rounded-md bg-muted p-4 space-y-4">
                                                        {(() => {
                                                            try {
                                                                const suggestions = JSON.parse(groqResponse).suggestions;
                                                                return suggestions.map((suggestion: any, index: number) => (
                                                                    <div key={index} className="space-y-2">
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {suggestion.description}
                                                                        </p>
                                                                        <div className="flex items-center gap-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => generateImage(suggestion.dallePrompt)}
                                                                                disabled={isGenerating}
                                                                                className="gap-2"
                                                                            >
                                                                                <SparklesIcon className="h-4 w-4" />
                                                                                Generate This Background
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => setPromptText(suggestion.dallePrompt)}
                                                                                className="gap-2"
                                                                            >
                                                                                <TextIcon className="h-4 w-4" />
                                                                                Use Prompt
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ));
                                                            } catch {
                                                                // If the response isn't valid JSON, display it as plain text
                                                                return <p className="text-sm text-muted-foreground whitespace-pre-wrap">{groqResponse}</p>;
                                                            }
                                                        })()}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Color Theme */}
                                            {colorTheme && (
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-sm">Color Palette</h4>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {/* Text Colors */}
                                                        <div className="space-y-2">
                                                            <span className="text-xs text-muted-foreground">Text</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {(() => {
                                                                    try {
                                                                        const colorData = JSON.parse(colorTheme);
                                                                        return (
                                                                            <>
                                                                                {colorData.textColors.map((color, i) => (
                                                                                    <div
                                                                                        key={i}
                                                                                        className="group relative"
                                                                                        onClick={() => navigator.clipboard.writeText(color)}
                                                                                    >
                                                                                        <div
                                                                                            className="w-8 h-8 rounded-md border shadow-sm cursor-pointer 
                                                                                                     transition-all duration-200 hover:scale-110"
                                                                                            style={{ backgroundColor: color }}
                                                                                        />
                                                                                        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 
                                                                                                     text-xs bg-popover px-2 py-1 rounded opacity-0 
                                                                                                     group-hover:opacity-100 transition-opacity">
                                                                                            {color}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </>
                                                                        );
                                                                    } catch {
                                                                        return <p className="text-sm text-muted-foreground whitespace-pre-wrap">{colorTheme}</p>;
                                                                    }
                                                                })()}
                                                            </div>
                                                        </div>
                                                        {/* Similar sections for Background and Shape colors */}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Regenerate Button */}
                                            <div className="flex justify-end">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => {
                                                        if (imageBase64) {
                                                            Promise.all([
                                                                analyzeImageWithGroq(imageBase64),
                                                                analyzeColorTheme(imageBase64)
                                                            ]);
                                                        }
                                                    }}
                                                    disabled={isAnalyzing}
                                                    className="gap-2"
                                                >
                                                    <RefreshIcon className="h-4 w-4" />
                                                    Regenerate
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Image Generation Section */}
                        <div className="rounded-lg border bg-card p-6 space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <SparklesIcon className="h-5 w-5 text-primary" />
                                AI Image Generation
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promptText}
                                        onChange={(e) => setPromptText(e.target.value)}
                                        placeholder="Describe the image you want to create..."
                                        className="flex-1 px-3 py-2 rounded-md border bg-background disabled:opacity-50"
                                        disabled={isGenerating}
                                    />
                                    <Button 
                                        onClick={() => generateImage(promptText)}
                                        disabled={isGenerating || !promptText}
                                        className={`gap-2 transition-all duration-200 ${isGenerating ? 'opacity-50' : ''}`}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <ReloadIcon className="h-4 w-4 animate-spin" />
                                                <span className="relative">
                                                    Creating
                                                    <span className="absolute -right-4 animate-[bounce_1s_infinite]">.</span>
                                                    <span className="absolute -right-7 animate-[bounce_1s_infinite_0.2s]">.</span>
                                                    <span className="absolute -right-10 animate-[bounce_1s_infinite_0.4s]">.</span>
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <SparklesIcon className="h-4 w-4" />
                                                Create
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Generated Image Display */}
                                {(isGenerating || generatedImage) && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Generated Image</h4>
                                        <div className="aspect-square relative rounded-lg overflow-hidden border">
                                            {isGenerating ? (
                                                <div className="w-full h-full bg-muted/10 animate-pulse flex items-center justify-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-16 h-16 rounded-full bg-muted animate-pulse"></div>
                                                        <div className="text-sm text-muted-foreground">Generating your image...</div>
                                                    </div>
                                                </div>
                                            ) : generatedImage && (
                                                <NextImage
                                                    src={generatedImage}
                                                    alt="AI Generated"
                                                    layout="fill"
                                                    objectFit="contain"
                                                    className="transition-all duration-200"
                                                    priority
                                                    loading="eager"
                                                />
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setGeneratedImage(null)}
                                                disabled={isGenerating}
                                            >
                                                Clear
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => {
                                                    if (generatedImage) {
                                                        setSelectedImage(generatedImage);
                                                        setupImage(generatedImage);
                                                    }
                                                }}
                                                disabled={isGenerating}
                                                className="gap-2"
                                            >
                                                <PlusIcon className="h-4 w-4" />
                                                Use Image
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Controls */}
                    <div className="border rounded-lg bg-card">
                        <ScrollArea className="h-[calc(100vh-8rem)]">
                            <div className="p-4">
                                <Accordion type="single" collapsible className="w-full">
                                    {textSets.map(textSet => (
                                        <TextCustomizer
                                            key={textSet.id}
                                            textSet={textSet}
                                            handleAttributeChange={handleTextAttributeChange}
                                            removeTextSet={removeTextSet}
                                            duplicateTextSet={duplicateTextSet}
                                            isSelected={selectedItemId === textSet.id}
                                            onSelect={() => setSelectedItemId(textSet.id)}
                                        />
                                    ))}
                                    {shapes.map(shape => (
                                        <ShapeCustomizer
                                            key={shape.id}
                                            shape={shape}
                                            handleAttributeChange={handleShapeAttributeChange}
                                            removeShape={removeShape}
                                            duplicateShape={duplicateShape}
                                            isSelected={selectedItemId === shape.id}
                                            onSelect={() => setSelectedItemId(shape.id)}
                                        />
                                    ))}
                                </Accordion>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
                    <div className="text-center space-y-4">
                        <div className="p-6 rounded-full bg-muted inline-block">
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold">Get started with your creation</h2>
                        <p className="text-muted-foreground">Upload an image to begin editing</p>
                        <Button onClick={handleUploadImage} className="gap-2">
                            <UploadIcon className="h-4 w-4" />
                            Choose Image
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
