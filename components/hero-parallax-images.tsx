"use client";

import { ParallaxScroll } from "./ui/parallax-scroll";

import bear from '@/public/bear.png'
import life from '@/public/life.png' 
import wow from '@/public/wow.png'
import go from '@/public/go.png'
import cold from '@/public/cold.png'
import enjoy from '@/public/enjoy.png'
import nature from '@/public/nature.png'
import vie from '@/public/vie.png'
import snap from '@/public/snap.png'

// Define the ImageItem interface if not already defined
interface ImageItem {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export function HeroParallaxImages() {
  return <ParallaxScroll images={images} className="w-full"/>;
}

const images: ImageItem[] = [
  {
    src: image1.src,
    alt: "Image 1 description",
    width: image1.width,
    height: image1.height
  },
  // ... repeat for other images
  {
    src: image2.src,
    alt: "Image 2 description",
    width: image2.width,
    height: image2.height
  },
  // ... and so on
];  
