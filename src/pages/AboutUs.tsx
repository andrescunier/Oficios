import React from 'react';
import { useLocation } from 'react-router-dom';
import { getPageContent } from '@/config/runtime';
import { CmsPage } from '@/components/ui/CmsPage';
import { MissingPageContent } from '@/components/ui/MissingPageContent';

/** `/como-funciona` → pages.about · `/sobrenosotros` → pages.company (fallback about). */
export const AboutUs: React.FC = () => {
  const { pathname } = useLocation();
  const isCompany = pathname.includes('sobrenosotros');
  const content = getPageContent(isCompany ? 'company' : 'about')
    || (isCompany ? getPageContent('about') : undefined);

  if (content && content.enabled !== false && (content.blocks?.length || content.title)) {
    return <CmsPage content={content} />;
  }
  return (
    <MissingPageContent
      pageKey={isCompany ? 'company' : 'about'}
      label={isCompany ? 'Sobre OficiosHub' : 'Cómo funciona'}
    />
  );
};

export default AboutUs;
