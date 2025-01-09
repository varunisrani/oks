"use client";
import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { motion } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

interface ImageItem {
  src: string | StaticImageData;
  alt: string;
  className?: string;
}

interface ParallaxScrollProps {
  images: ImageItem[];
  className?: string;
}

export function ParallaxScroll({ images, className }: ParallaxScrollProps) {
  const gridRef = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start start", "end start"]
  });

  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, 0]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const third = Math.ceil(images.length / 3);
  const firstPart = images.slice(0, third);
  const secondPart = images.slice(third, 2 * third);
  const thirdPart = images.slice(2 * third);

  return (
    <div
      className={cn("h-full items-start overflow-y-auto w-full", className)}
      ref={gridRef}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start justify-start mx-auto gap-10 pt-40 px-10">
        <div className="grid gap-10">
          {firstPart.map((image, idx) => (
            <motion.div
              style={{ y: translateFirst }}
              key={"grid-1" + idx}
              className="relative aspect-[4/3]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                className={cn("object-cover object-left-top rounded-lg !m-0 !p-0", image.className)}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>
          ))}
        </div>
        <div className="grid gap-10">
          {secondPart.map((image, idx) => (
            <motion.div
              style={{ y: translateSecond }}
              key={"grid-2" + idx}
              className="relative aspect-[4/3]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                className={cn("object-cover object-left-top rounded-lg !m-0 !p-0", image.className)}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>
          ))}
        </div>
        <div className="grid gap-10">
          {thirdPart.map((image, idx) => (
            <motion.div
              style={{ y: translateThird }}
              key={"grid-3" + idx}
              className="relative aspect-[4/3]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                className={cn("object-cover object-left-top rounded-lg !m-0 !p-0", image.className)}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
