import { useTranslation } from "react-i18next";

type Props = {
  status: "idle" | "sending" | "success" | "error";
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
  const { t } = useTranslation("book");

  return (
    <>
      {/* <div className="book-actions">
       
        {submitLabel && (
          <button className="btn" disabled={isSubmitDisabled}>
            {submitLabel}
          </button>
        )}
        {status === "success" && (
          <span className="ok">{t("actions.success")}</span>
        )}
        {status === "error" && (
          <span className="error">{t("actions.error")}</span>
        )}
        {errors.offerId && <span className="error">{errors.offerId}</span>}
      </div>  */}

      <div className="book-actions">
        {status === "success" && (
          <span className="ok">{t("actions.success")}</span>
        )}
        {status === "error" && (
          <span className="error">{t("actions.error")}</span>
        )}
        {errors.offerId && <span className="error">{errors.offerId}</span>}

        {submitLabel && (
          <button className="btn" disabled={isSubmitDisabled}>
            {submitLabel}
          </button>
        )}
      </div>

      {!offerLoading && offerError && (
        <p className="error error--top">{offerError}</p>
      )}
    </>
  );
}
