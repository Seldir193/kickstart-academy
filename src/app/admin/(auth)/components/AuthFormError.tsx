type Props = {
  error: string;
};

export default function AuthFormError({ error }: Props) {
  if (!error) return null;
  return (
    <div className="form-error" role="alert" aria-live="polite">
      {error}
    </div>
  );
}
