"use client";
import React from "react";
import { LayoutGrid } from "./ui/layout-grid";
import Image from "next/image";
import { motion } from "framer-motion";

import POV from '@/public/pov.png'
import Ride from '@/public/ride.png'
import SF from '@/public/sf.png'
import Goats from '@/public/goats.png'

export function HeroImages() {
  return (
    <div className="h-[40rem] w-full">
      <LayoutGrid cards={cards} />
    </div>
  );
}

const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-black/20 backdrop-blur-sm">
      <h3 className="font-bold text-2xl md:text-3xl text-white tracking-tight">{title}</h3>
      <p className="text-neutral-200/90 text-sm md:text-base leading-relaxed">{description}</p>
    </div>
  );
};

const cards = [
  {
    id: 1,
    content: (
      <FeatureCard
        title="POV: A Moment Captured"
        description="Experience the beauty of the moment with this captivating view. The text behind the image effect enhances the scene, drawing you into the experience."
      />
    ),
    className: "md:col-span-2 hover:scale-[1.02] transition-transform duration-300",
    thumbnail: POV
  },
  {
    id: 2,
    content: (
      <FeatureCard
        title="Ride: Adventure Awaits"
        description="Embrace the thrill of adventure. The text behind the image effect enhances the excitement, inviting you to join the journey."
      />
    ),
    className: "col-span-1 hover:scale-[1.02] transition-transform duration-300",
    thumbnail: Ride
  },
  {
    id: 3,
    content: (
      <FeatureCard
        title="Behind the Scenes"
        description="Hey, it's Rexan! I'm the creator of this website. Get inspired and create your own stunning designs with our easy-to-use tools."
      />
    ),
    className: "col-span-1 hover:scale-[1.02] transition-transform duration-300",
    thumbnail: Goats
  },
  {
    id: 4,
    content: (
      <FeatureCard
        title="SF: City by the Bay"
        description="Discover the charm of San Francisco. The text behind the image effect beautifully complements the iconic skyline, enriching the urban experience."
      />
    ),
    className: "md:col-span-2 hover:scale-[1.02] transition-transform duration-300",
    thumbnail: SF
  },
];