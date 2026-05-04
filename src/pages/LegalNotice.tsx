import React from 'react';
import { getPageContent } from '@/config/runtime';
import { CmsPage } from '@/components/ui/CmsPage';
import { MissingPageContent } from '@/components/ui/MissingPageContent';

export const LegalNotice: React.FC = () => {
  const content = getPageContent('legalNotice');
  if (content && content.enabled !== false && (content.blocks?.length || content.title)) {
    return <CmsPage content={content} />;
  }
  return <MissingPageContent pageKey="legalNotice" label="Aviso Legal" />;
};

export default LegalNotice;
