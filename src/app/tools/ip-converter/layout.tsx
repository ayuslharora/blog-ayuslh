import type { Metadata } from 'next';
import Script from 'next/script';
import { buildSoftwareApplicationJsonLd, buildFaqPageJsonLd, serializeJsonLd } from '../../../lib/jsonLd';
import { FAQS } from '../../../lib/ipConverterFaqs';

export const metadata: Metadata = {
  title: 'IP to Binary Converter',
  description:
    'Free online tool to convert any IPv4 address into its 32-bit binary representation instantly, octet by octet.',
  alternates: { canonical: '/tools/ip-converter' },
};

export default function IpConverterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="jsonld-ip-converter-app"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            buildSoftwareApplicationJsonLd({
              path: '/tools/ip-converter',
              name: 'IP to Binary Converter',
              description:
                'Free online tool to convert any IPv4 address into its 32-bit binary representation instantly, octet by octet.',
            })
          ),
        }}
      />
      <Script
        id="jsonld-ip-converter-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFaqPageJsonLd(FAQS)) }}
      />
      {children}
    </>
  );
}
