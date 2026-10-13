"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CompanyBranding {
  companyName: string;
  brandTitle: string;
  tagline: string;
  logoUrl: string;
  supportEmail: string;
  headquarters: string;
  operationalStatus: string;
}

export const DEFAULT_BRANDING: CompanyBranding = {
  companyName: "PrimeWave Lab (Pvt) Ltd",
  brandTitle: "PrimeWave Lab",
  tagline: "Resource Reservation Management System",
  logoUrl: "/company-logo.png",
  supportEmail: "support@primewave.com",
  headquarters: "Silicon Quad Innovation District, Level 4",
  operationalStatus: "All Systems Operational • ACID Concurrency Active",
};

interface BrandingContextType {
  branding: CompanyBranding;
  updateBranding: (updates: Partial<CompanyBranding>) => void;
  resetBranding: () => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

const BRANDING_STORAGE_KEY = "pw_company_branding";

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<CompanyBranding>(DEFAULT_BRANDING);

  // Keep state synchronized with storage and listen for external changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BRANDING_STORAGE_KEY);
      if (stored) {
        setBranding({ ...DEFAULT_BRANDING, ...JSON.parse(stored) });
      }
    } catch (err) {
      console.error("Failed to re-read branding storage:", err);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === BRANDING_STORAGE_KEY && e.newValue) {
        try {
          setBranding({ ...DEFAULT_BRANDING, ...JSON.parse(e.newValue) });
        } catch (err) {
          console.error("Storage event parsing error:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateBranding = useCallback((updates: Partial<CompanyBranding>) => {
    setBranding((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save branding updates:", err);
      }
      return updated;
    });
  }, []);

  const resetBranding = useCallback(() => {
    setBranding(DEFAULT_BRANDING);
    try {
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(DEFAULT_BRANDING));
    } catch (err) {
      console.error("Failed to reset branding:", err);
    }
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): BrandingContextType {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}
