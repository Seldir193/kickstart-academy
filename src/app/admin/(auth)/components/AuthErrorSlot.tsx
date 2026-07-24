type Props = {
  error?: string;
};

export default function AuthErrorSlot({ error }: Props) {
  return (
    <span className="error-slot" aria-live="polite">
      {error ? <span className="error">{error}</span> : null}
    </span>
  );
}
