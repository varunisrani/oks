'use client';

import React from 'react';
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from '@/components/ui/hero-highlight';
import { HeroImages } from '@/components/hero-images';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { HeroParallaxImages } from '@/components/hero-parallax-images';
import { AdditionalInfo } from '@/components/additional-info';
import Link from 'next/link';
import RandomColorAd from '@/ads/randomcolor';
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className='flex flex-col min-h-screen w-full'>
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1609710199882100" crossOrigin="anonymous"></script>
            
            <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-6 lg:px-8 py-24 lg:py-32">
                <HeroHighlight>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: [20, -5, 0] }} 
                        transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
                        className="text-center max-w-[1200px] mx-auto"
                    >
                        <h1 className="text-4xl lg:text-7xl font-bold text-black dark:text-white mb-8">
                            Create stunning{" "}
                            <Highlight className='text-white'>
                                text-behind-image
                            </Highlight>
                            {" "} designs
                        </h1>
                        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-12">
                            Transform your images with beautiful text overlays. Perfect for social media, marketing materials, and creative projects.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link href={'/app'}>
                                <HoverBorderGradient 
                                    containerClassName="rounded-full" 
                                    className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-10 py-4 text-lg font-medium"
                                >
                                    Start Creating
                                </HoverBorderGradient>
                            </Link>
                            <div className="text-base text-neutral-500 dark:text-neutral-400 font-medium">
                                200,000+ designs created
                            </div>
                        </div>
                    </motion.div>
                </HeroHighlight>
            </section>

            <section className="w-full py-12 lg:py-32 bg-neutral-50 dark:bg-neutral-900">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6">Featured Examples</h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Discover what's possible with our text-behind-image tool
                        </p>
                    </div>
                    <HeroImages />
                </div>
            </section>

            <section className="w-full py-24 lg:py-32 overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6">Community Creations</h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Get inspired by what others have created
                        </p>
                    </div>
                    <HeroParallaxImages />
                </div>
            </section>


            <div className="h-16 lg:h-24"></div>
        </div>
    );
}