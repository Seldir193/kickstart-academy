"use client";

import type { FeedbackCategoryFilter, FeedbackSortKey } from "../helpers";
import FeedbackSearchInput from "./FeedbackSearchInput";
import FeedbackCategoryFilterBox from "./FeedbackCategoryFilter";
import FeedbackSortFilter from "./FeedbackSortFilter";

type Props = {
  query: string;
  category: FeedbackCategoryFilter;
  sort: FeedbackSortKey;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: FeedbackCategoryFilter) => void;
  onSortChange: (value: FeedbackSortKey) => void;
};

export default function FeedbackFiltersBar(props: Props) {
  return (
    <div className="feedback-admin__filters">
      <FeedbackSearchInput
        value={props.query}
        onChange={props.onQueryChange}
      />

      <FeedbackSortFilter
        value={props.sort}
        onChange={props.onSortChange}
      />

      <FeedbackCategoryFilterBox
        value={props.category}
        onChange={props.onCategoryChange}
      />
    </div>
  );
}