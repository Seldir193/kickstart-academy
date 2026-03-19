// src/app/admin/(app)/coaches/components/Pagination.tsx
"use client";

type Props = {
  page: number;
  pages: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pagination({ page, pages, onPrev, onNext }: Props) {
  return (
    <div className="pager pager--arrows coach-pager">
      <button
        type="button"
        className="btn"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={onPrev}
      >
        <img
          src="/icons/arrow_right_alt.svg"
          alt=""
          aria-hidden="true"
          className="icon-img icon-img--left"
        />
      </button>

      <div className="pager__count" aria-live="polite" aria-atomic="true">
        {page} / {pages}
      </div>

      <button
        type="button"
        className="btn"
        aria-label="Next page"
        disabled={page >= pages}
        onClick={onNext}
      >
        <img
          src="/icons/arrow_right_alt.svg"
          alt=""
          aria-hidden="true"
          className="icon-img"
        />
      </button>
    </div>
  );
}

// //src\app\admin\(app)\coaches\components\Pagination.tsx
// "use client";

// type Props = {
//   page: number;
//   pages: number;
//   onPrev: () => void;
//   onNext: () => void;
// };

// export default function Pagination({ page, pages, onPrev, onNext }: Props) {
//   return (
//     <div className="pager pager--arrows coach-pager">
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
//         {page} / {pages}
//       </div>

//       <button
//         type="button"
//         className="btn"
//         aria-label="Next page"
//         disabled={page >= pages}
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
