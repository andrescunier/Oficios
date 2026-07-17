/**
 * Renders pages.* content blocks (hero, intro, value cards, html sections, CTA).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import type { PageContent, PageBlock } from '@/config/runtime';
import { getFeatureBenefitIcon } from '@/components/ui/featureBenefitIcons';

interface CmsPageProps {
  content?: PageContent;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

const ICON_BG_BY_COLOR: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600 border-blue-600',
  green: 'bg-green-100 text-green-600 border-green-600',
  purple: 'bg-purple-100 text-purple-600 border-purple-600',
  orange: 'bg-orange-100 text-orange-600 border-orange-600',
  red: 'bg-red-100 text-red-600 border-red-600',
  amber: 'bg-amber-100 text-amber-600 border-amber-600',
  slate: 'bg-slate-100 text-slate-600 border-slate-600',
};

function colorClasses(color?: string): string {
  return ICON_BG_BY_COLOR[color || 'blue'] || ICON_BG_BY_COLOR.blue;
}

function renderBlock(block: PageBlock, idx: number): React.ReactNode {
  const type = block.type || 'text';

  if (type === 'paragraph' || type === 'text') {
    return (
      <div key={idx} className="mb-8">
        {block.title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{block.title}</h2>
        )}
        {block.subtitle && (
          <p className="text-lg text-gray-600 mb-3">{block.subtitle}</p>
        )}
        {block.html ? (
          <div
            className="text-lg text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        ) : block.body ? (
          <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{block.body}</p>
        ) : null}
      </div>
    );
  }

  if (type === 'heading') {
    return (
      <h2 key={idx} className="text-3xl font-bold text-gray-900 mt-10 mb-4">
        {block.title}
      </h2>
    );
  }

  if (type === 'cards' && Array.isArray(block.items)) {
    return (
      <div key={idx} className="grid md:grid-cols-2 gap-8 my-12">
        {block.items.map((item: any, i: number) => {
          const Icon = getFeatureBenefitIcon(item.icon || 'Shield');
          const cls = colorClasses(item.iconColor || item.color);
          const [bg, text, border] = cls.split(' ');
          return (
            <div
              key={i}
              className={`bg-white p-8 rounded-xl shadow-lg border-t-4 ${border}`}
            >
              <div className="flex items-center mb-4">
                <div
                  className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center mr-4`}
                >
                  <Icon className={`w-6 h-6 ${text}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
              </div>
              <p className="text-gray-600">{item.description || item.body}</p>
            </div>
          );
        })}
      </div>
    );
  }

  if (type === 'list' && Array.isArray(block.items)) {
    return (
      <div key={idx} className="my-6">
        {block.title && (
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{block.title}</h3>
        )}
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          {block.items.map((item: any, i: number) => (
            <li key={i}>{typeof item === 'string' ? item : item.body || item.label}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (type === 'html' && block.html) {
    return (
      <div
        key={idx}
        className="prose prose-lg max-w-none my-6"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    );
  }

  if (type === 'section') {
    return (
      <section key={idx} className="my-10">
        {block.title && (
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{block.title}</h2>
        )}
        {block.subtitle && <p className="text-lg text-gray-600 mb-6">{block.subtitle}</p>}
        {block.html ? (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        ) : block.body ? (
          <p className="text-gray-700 leading-relaxed">{block.body}</p>
        ) : null}
      </section>
    );
  }

  return null;
}

export const CmsPage: React.FC<CmsPageProps> = ({ content, fallbackTitle, fallbackSubtitle }) => {
  if (!content || content.enabled === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{fallbackTitle || 'Página'}</h1>
          {fallbackSubtitle && <p className="text-gray-600">{fallbackSubtitle}</p>}
        </div>
      </div>
    );
  }

  const heroVariant = content.heroVariant || 'gradient';
  const blocks = content.blocks || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {(content.title || content.subtitle) && (
        <section
          className={
            heroVariant === 'plain'
              ? 'bg-white py-12 border-b'
              : 'relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20'
          }
          style={
            content.heroImage
              ? { backgroundImage: `url(${content.heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : undefined
          }
        >
          {heroVariant !== 'plain' && <div className="absolute inset-0 bg-black/10" />}
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {content.title && (
                <h1
                  className={`font-bold mb-4 ${
                    heroVariant === 'plain'
                      ? 'text-3xl md:text-4xl text-gray-900'
                      : 'text-4xl md:text-6xl'
                  }`}
                >
                  {content.title}
                </h1>
              )}
              {content.subtitle && (
                <p
                  className={`${
                    heroVariant === 'plain' ? 'text-lg text-gray-600' : 'text-2xl md:text-3xl'
                  }`}
                >
                  {content.subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {blocks.map(renderBlock)}
          </div>
        </div>
      </section>

      {(content.ctaTitle || content.ctaPrimaryLabel) && (
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 text-center">
            {content.ctaTitle && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.ctaTitle}</h2>
            )}
            {content.ctaSubtitle && (
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">{content.ctaSubtitle}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {content.ctaPrimaryLabel && content.ctaPrimaryHref && (
                <Link
                  to={content.ctaPrimaryHref}
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  {content.ctaPrimaryLabel}
                </Link>
              )}
              {content.ctaSecondaryLabel && content.ctaSecondaryHref && (
                <Link
                  to={content.ctaSecondaryHref}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors"
                >
                  {content.ctaSecondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {content.lastUpdated && (
        <div className="container mx-auto px-4 pb-8">
          <p className="text-sm text-gray-500 text-center">{content.lastUpdated}</p>
        </div>
      )}
    </div>
  );
};

export default CmsPage;
