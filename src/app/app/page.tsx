'use client'

import React from 'react';
import { motion } from "framer-motion";
import TextCustomizer from '@/components/editor/text-customizer';
import { ModeToggle } from '@/components/mode-toggle';

export default function AppPage() {
  return (
    <div className="min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <TextCustomizer />
        </motion.div>
      </main>
    </div>
  );
} 