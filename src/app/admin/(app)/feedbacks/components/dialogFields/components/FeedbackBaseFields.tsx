import FeedbackAuthorField from "./FeedbackAuthorField";
import FeedbackCategoryField from "./FeedbackCategoryField";
import FeedbackSortField from "./FeedbackSortField";
import FeedbackStatusField from "./FeedbackStatusField";
import type { BaseFieldProps } from "../types";

export default function FeedbackBaseFields(props: BaseFieldProps) {
  return (
    <>
      <FeedbackCategoryField {...props} />
      <FeedbackSortField {...props} />
      <FeedbackAuthorField {...props} />
      <FeedbackStatusField {...props} />
    </>
  );
}
