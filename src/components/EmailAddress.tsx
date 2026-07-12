export function EmailAddress({ address }: { address: string }) {
  const [local, domain] = address.split('@');

  if (!local || !domain) return <>{address}</>;

  return (
    <>
      <span>{local}</span><span>@</span><span>{domain}</span>
    </>
  );
}
