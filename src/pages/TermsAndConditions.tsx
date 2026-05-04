import React from 'react';
import { getPageContent } from '@/config/runtime';
import { CmsPage } from '@/components/ui/CmsPage';
import { MissingPageContent } from '@/components/ui/MissingPageContent';

export const TermsAndConditions: React.FC = () => {
  const content = getPageContent('terms');
  if (content && content.enabled !== false && (content.blocks?.length || content.title)) {
    return <CmsPage content={content} />;
  }
  return <MissingPageContent pageKey="terms" label="Términos y Condiciones" />;
};

export default TermsAndConditions;
