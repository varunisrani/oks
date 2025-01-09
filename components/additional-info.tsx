"use client";
import Image from "next/image";
import React from "react";
import { WobbleCard } from "./ui/wobble-card";
import { motion } from "framer-motion";
import { Github, Twitter } from "lucide-react";

import OpenSource from '@/public/open-source.png'
import Link from "next/link";

export function AdditionalInfo() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Open Source Card */}
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 min-h-[300px]"
        className="relative overflow-hidden"
      >
        <Link href={'https://github.com/RexanWONG/text-behind-image'} target="_blank" rel="noopener noreferrer" className="block h-full">
          <div className="flex flex-col h-full justify-between p-6">
            <div className="max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center gap-3">
                  <Github className="w-8 h-8" />
                  Open Source Project
                </h2>
                <p className="text-blue-100">
                  100% of the code is public on Github. Check it out, star the repo, and contribute to make it even better!
                </p>
              </motion.div>
            </div>
            <Image
              src={OpenSource}
              width={400}
              height={400}
              alt="Open Source Illustration"
              className="absolute -right-10 -bottom-10 w-64 md:w-80 object-contain opacity-90"
            />
          </div>
        </Link>
      </WobbleCard>

      {/* Share Designs Card */}
      <Link href={'https://x.com/rexan_wong/status/1840286290052538714'} target="_blank" rel="noopener noreferrer">
        <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-gradient-to-br from-purple-600 to-purple-800">
          <div className="p-6 h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <Twitter className="w-8 h-8" />
                Share Your Designs
              </h2>
              <p className="text-purple-100">
                Created something amazing? Share your designs with our community and inspire others!
              </p>
            </motion.div>
          </div>
        </WobbleCard>
      </Link>
    </div>
  );
}
