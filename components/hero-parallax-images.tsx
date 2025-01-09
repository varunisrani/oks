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
    src: bear.src,
    alt: "Bear image",
    width: bear.width,
    height: bear.height
  },
  {
    src: life.src,
    alt: "Life image",
    width: life.width,
    height: life.height
  },
  {
    src: wow.src,
    alt: "Wow image",
    width: wow.width,
    height: wow.height
  },
  {
    src: go.src,
    alt: "Go image",
    width: go.width,
    height: go.height
  },
  {
    src: cold.src,
    alt: "Cold image",
    width: cold.width,
    height: cold.height
  },
  {
    src: enjoy.src,
    alt: "Enjoy image",
    width: enjoy.width,
    height: enjoy.height
  },
  {
    src: nature.src,
    alt: "Nature image",
    width: nature.width,
    height: nature.height
  },
  {
    src: vie.src,
    alt: "Vie image",
    width: vie.width,
    height: vie.height
  },
  {
    src: snap.src,
    alt: "Snap image",
    width: snap.width,
    height: snap.height
  }
];  
