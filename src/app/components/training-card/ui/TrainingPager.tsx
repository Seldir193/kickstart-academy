"use client";

import { useTranslation } from "react-i18next";

type Props = {
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function TrainingPager(props: Props) {
  const { t } = useTranslation();
  return (
    <>
      <button
        type="button"
        className="btn"
        aria-label={t("common.training.pager.previous")}
        disabled={props.page <= 1}
        onClick={props.onPrev}
      >
        <img
          src="/icons/arrow_right_alt.svg"
          alt=""
          aria-hidden="true"
          className="icon-img icon-img--left"
        />
      </button>

      <div className="pager__count" aria-live="polite" aria-atomic="true">
        {props.page} / {props.pageCount}
      </div>

      <button
        type="button"
        className="btn"
        aria-label={t("common.training.pager.next")}
        disabled={props.page >= props.pageCount}
        onClick={props.onNext}
      >
        <img
          src="/icons/arrow_right_alt.svg"
          alt=""
          aria-hidden="true"
          className="icon-img"
        />
      </button>
    </>
  );
}

// ("use client");

// import React from "react";

// type Props = {
//   page: number;
//   pageCount: number;
//   onPrev: () => void;
//   onNext: () => void;
// };

// export default function TrainingPager({
//   page,
//   pageCount,
//   onPrev,
//   onNext,
// }: Props) {
//   return (
//     <div className="pager pager--arrows mt-3">
//       <button
//         type="button"
//         className="btn"
//         aria-label="Previous page"
//         disabled={page <= 1}
//         onClick={onPrev}
//       >
//         <img
//           src="/icons/arrow_right_alt.svg"
//           alt=""
//           aria-hidden="true"
//           className="icon-img icon-img--left"
//         />
//       </button>

//       <div className="pager__count" aria-live="polite" aria-atomic="true">
//         {page} / {pageCount}
//       </div>

//       <button
//         type="button"
//         className="btn"
//         aria-label="Next page"
//         disabled={page >= pageCount}
//         onClick={onNext}
//       >
//         <img
//           src="/icons/arrow_right_alt.svg"
//           alt=""
//           aria-hidden="true"
//           className="icon-img"
//         />
//       </button>
//     </div>
//   );
// }
