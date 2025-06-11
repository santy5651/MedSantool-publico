
'use client';

import React from 'react';
import { ImageAnalysisModule } from '@/components/modules/image-analysis-module';
import { PdfExtractionModule } from '@/components/modules/pdf-extraction-module';
import { TextAnalysisModule } from '@/components/modules/text-analysis-module';
import { ClinicalAnalysisModule } from '@/components/modules/clinical-analysis-module';
import { DiagnosisSupportModule } from '@/components/modules/diagnosis-support-module';
import { TreatmentPlanModule } from '@/components/modules/treatment-plan-module';
import { MedicalOrdersModule } from '@/components/modules/medical-orders-module';
import { HistoryModule } from '@/components/modules/history-module';

export default function MedInsightPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Left Column: Analysis Modules */}
      <div className="lg:col-span-2 space-y-6">
        <ImageAnalysisModule />
        <PdfExtractionModule />
        <TextAnalysisModule />
        <ClinicalAnalysisModule />
        <DiagnosisSupportModule />
        <TreatmentPlanModule />
        <MedicalOrdersModule />
      </div>

      {/* Right Column: History Module */}
      <div className="lg:col-span-1 sticky top-6"> {/* Sticky for desktop view */}
        <HistoryModule />
      </div>
    </div>
  );
}
