
import Image from 'next/image';
import monopolyManImage from '../../public/monopoly-man.png';

export function MonopolyManLogo({ className }: { className?: string }) {
  return (
    <Image
      src={monopolyManImage}
      alt="Monopoly Man"
      width={200}
      height={150}
      className={className}
      data-ai-hint="monopoly man"
      priority
    />
  );
}
