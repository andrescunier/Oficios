import React from 'react';
import { getPageContent } from '@/config/runtime';
import { CmsPage } from '@/components/ui/CmsPage';
import { MissingPageContent } from '@/components/ui/MissingPageContent';

export const ReturnsPage: React.FC = () => {
  const content = getPageContent('returns');
  if (content && content.enabled !== false && (content.blocks?.length || content.title)) {
    return <CmsPage content={content} />;
  }
  return <MissingPageContent pageKey="returns" label="Devoluciones" />;
};

export default ReturnsPage;
