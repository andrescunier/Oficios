import React from 'react';
import { getPageContent } from '@/config/runtime';
import { CmsPage } from '@/components/ui/CmsPage';
import { MissingPageContent } from '@/components/ui/MissingPageContent';

export const ContactPage: React.FC = () => {
  const content = getPageContent('contact');
  if (content && content.enabled !== false && (content.blocks?.length || content.title)) {
    return <CmsPage content={content} />;
  }
  return <MissingPageContent pageKey="contact" label="Contacto" />;
};

export default ContactPage;
