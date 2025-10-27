// page.tsx
"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

const MapViewer = dynamic(
  () => import("@/app/_components/MapViewer"),
  { ssr: false }
);

import DescriptionSection from "@/app/_components/DescriptionSection";

const HomePage = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col h-screen items-center">
      {/* Description Section */}
      <DescriptionSection expanded={expanded} setExpanded={setExpanded} />

      {/* Map */}
      <MapViewer />
    </div>
  );
};

export default HomePage;
