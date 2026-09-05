import { useEffect, useRef, type ReactNode } from 'react';
import { emailMailto } from '../config/site';

export function EmailAddress({ address }: { address: string }) {
  const [local, domain] = address.split('@');

  if (!local || !domain) return <>{address}</>;

  return (
    <>
      <span>{local}</span><span>@</span><span>{domain}</span>
    </>
  );
}

export function SafeEmailLink({ address, subject, className, children }: { address: string; subject?: string; className?: string; children: ReactNode }) {
  const linkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    linkRef.current?.setAttribute('href', emailMailto(address, subject));
  }, [address, subject]);

  return <a ref={linkRef} className={className} href="/contact">{children}</a>;
}
