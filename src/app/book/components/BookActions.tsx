// app/book/components/BookActions.tsx

type Props = {
  status: 'idle' | 'sending' | 'success' | 'error';
  submitLabel: string;
  isSubmitDisabled: boolean;
  errors: Record<string, string>;
  offerError: string | null;
  offerLoading: boolean;
};

export function BookActions({
  status,
  submitLabel,
  isSubmitDisabled,
  errors,
  offerError,
  offerLoading,
}: Props) {
  return (
    <>
      <div className="book-actions">
        <button className="btn" disabled={isSubmitDisabled}>
          {submitLabel}
        </button>
        {status === 'success' && (
          <span className="ok">Anfrage gesendet!</span>
        )}
        {status === 'error' && (
          <span className="error">Etwas ist schiefgelaufen.</span>
        )}
        {errors.offerId && <span className="error">{errors.offerId}</span>}
      </div>

      {!offerLoading && offerError && (
        <p className="error error--top">{offerError}</p>
      )}
    </>
  );
}
