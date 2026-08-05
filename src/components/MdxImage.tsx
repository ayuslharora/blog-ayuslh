import Image from 'next/image';
import imageDimensions from '../lib/imageDimensions.json';

type Dimensions = { width: number; height: number };
const dimensions: Record<string, Dimensions> = imageDimensions;

type MdxImageProps = {
  src?: string;
  alt?: string;
  className?: string;
};

export default function MdxImage({ src, alt = '', className }: MdxImageProps) {
  const size = src ? dimensions[src] : undefined;

  // Fall back to a plain <img> for anything not in the manifest (external
  // URLs, or a new image added without regenerating imageDimensions.json)
  // so a missing entry never breaks a post.
  if (!src || !size) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size.width}
      height={size.height}
      className={className}
      sizes="(min-width: 1024px) 800px, 100vw"
    />
  );
}
