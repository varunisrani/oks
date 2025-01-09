"use client"

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function PayDialog({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to Premium</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {/* Add your payment UI here */}
          <p>Payment functionality coming soon!</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
