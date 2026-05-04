import React from 'react';
import { getPageContent } from '@/config/runtime';
import { CmsPage } from '@/components/ui/CmsPage';
import { MissingPageContent } from '@/components/ui/MissingPageContent';

export const CookiesPolicy: React.FC = () => {
  const content = getPageContent('cookies');
  if (content && content.enabled !== false && (content.blocks?.length || content.title)) {
    return <CmsPage content={content} />;
  }
  return <MissingPageContent pageKey="cookies" label="Política de Cookies" />;
};

export default CookiesPolicy;
