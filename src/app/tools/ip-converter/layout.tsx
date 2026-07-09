import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IP to Binary Converter',
  description:
    'Free online tool to convert any IPv4 address into its 32-bit binary representation instantly, octet by octet.',
  alternates: { canonical: '/tools/ip-converter' },
};

export default function IpConverterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
