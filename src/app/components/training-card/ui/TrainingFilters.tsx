// src/app/components/training-card/ui/TrainingFilters.tsx
"use client";

import React from "react";
import {
  GROUPED_COURSE_OPTIONS,
  ALL_COURSE_OPTIONS,
} from "@/app/lib/courseOptions";
import type { TrainingSortKey } from "../types";
import { clsx, trainingSortLabel } from "../utils";

type Props = {
  q: string;
  setQ: (value: string) => void;
  setPage: (value: number) => void;
  locations: string[];
  locationFilter: string;
  setLocationFilter: (value: string) => void;
  courseValue: string;
  setCourseValue: (value: string) => void;
  sort: TrainingSortKey;
  setSort: (value: TrainingSortKey) => void;
  locationOpen: boolean;
  setLocationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  courseOpen: boolean;
  setCourseOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sortOpen: boolean;
  setSortOpen: React.Dispatch<React.SetStateAction<boolean>>;
  locationDropdownRef: React.RefObject<HTMLDivElement | null>;
  courseDropdownRef: React.RefObject<HTMLDivElement | null>;
  sortDropdownRef: React.RefObject<HTMLDivElement | null>;
  onCreate: () => void;
  createDisabled: boolean;
};

function courseLabel(courseValue: string) {
  if (!courseValue) return "All courses";
  const found = ALL_COURSE_OPTIONS.find((item) => item.value === courseValue);
  return found?.label || "All courses";
}

export default function TrainingFilters(props: Props) {
  const locationLabel = props.locationFilter || "All locations";

  return (
    <div className="news-admin__filters">
      <div className="news-admin__filter">
        <div className="input-with-icon">
          <img
            src="/icons/search.svg"
            alt=""
            aria-hidden="true"
            className="input-with-icon__icon"
          />
          <input
            value={props.q}
            onChange={(event) => {
              props.setQ(event.target.value);
              props.setPage(1);
            }}
            className="input input-with-icon__input"
            placeholder="e.g., Summer Camp or street/city/zip"
          />
        </div>
      </div>

      <div className="news-admin__filter news-admin__filter--sort">
        <div
          className={clsx(
            "ks-training-select",
            props.locationOpen && "ks-training-select--open",
          )}
          ref={props.locationDropdownRef}
        >
          <button
            type="button"
            className="ks-training-select__trigger"
            onClick={() => {
              props.setLocationOpen((open) => !open);
              props.setCourseOpen(false);
              props.setSortOpen(false);
            }}
          >
            <span className="ks-training-select__label">{locationLabel}</span>
            <span className="ks-training-select__chevron" aria-hidden="true" />
          </button>

          {props.locationOpen ? (
            <ul className="ks-training-select__menu" role="listbox">
              <li>
                <button
                  type="button"
                  className={clsx(
                    "ks-training-select__option",
                    !props.locationFilter && "is-selected",
                  )}
                  onClick={() => {
                    props.setLocationFilter("");
                    props.setPage(1);
                    props.setLocationOpen(false);
                  }}
                >
                  All locations
                </button>
              </li>

              {props.locations.map((location) => (
                <li key={location}>
                  <button
                    type="button"
                    className={clsx(
                      "ks-training-select__option",
                      props.locationFilter === location && "is-selected",
                    )}
                    onClick={() => {
                      props.setLocationFilter(location);
                      props.setPage(1);
                      props.setLocationOpen(false);
                    }}
                  >
                    {location}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="news-admin__filter news-admin__filter--sort">
        <div
          className={clsx(
            "ks-training-select",
            props.sortOpen && "ks-training-select--open",
          )}
          ref={props.sortDropdownRef}
        >
          <button
            type="button"
            className="ks-training-select__trigger"
            onClick={() => {
              props.setSortOpen((open) => !open);
              props.setLocationOpen(false);
              props.setCourseOpen(false);
            }}
          >
            <span className="ks-training-select__label">
              {trainingSortLabel(props.sort)}
            </span>
            <span className="ks-training-select__chevron" aria-hidden="true" />
          </button>

          {props.sortOpen ? (
            <ul className="ks-training-select__menu" role="listbox">
              <li>
                <button
                  type="button"
                  className={clsx(
                    "ks-training-select__option",
                    props.sort === "newest" && "is-selected",
                  )}
                  onClick={() => {
                    props.setSort("newest");
                    props.setPage(1);
                    props.setSortOpen(false);
                  }}
                >
                  Newest
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={clsx(
                    "ks-training-select__option",
                    props.sort === "oldest" && "is-selected",
                  )}
                  onClick={() => {
                    props.setSort("oldest");
                    props.setPage(1);
                    props.setSortOpen(false);
                  }}
                >
                  Oldest
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={clsx(
                    "ks-training-select__option",
                    props.sort === "training_asc" && "is-selected",
                  )}
                  onClick={() => {
                    props.setSort("training_asc");
                    props.setPage(1);
                    props.setSortOpen(false);
                  }}
                >
                  Training A–Z
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={clsx(
                    "ks-training-select__option",
                    props.sort === "training_desc" && "is-selected",
                  )}
                  onClick={() => {
                    props.setSort("training_desc");
                    props.setPage(1);
                    props.setSortOpen(false);
                  }}
                >
                  Training Z–A
                </button>
              </li>
            </ul>
          ) : null}
        </div>
      </div>

      <div className="news-admin__filter news-admin__filter--sort">
        <div
          className={clsx(
            "ks-training-select",
            props.courseOpen && "ks-training-select--open",
          )}
          ref={props.courseDropdownRef}
        >
          <button
            type="button"
            className="ks-training-select__trigger"
            onClick={() => {
              props.setCourseOpen((open) => !open);
              props.setLocationOpen(false);
              props.setSortOpen(false);
            }}
          >
            <span className="ks-training-select__label">
              {courseLabel(props.courseValue)}
            </span>
            <span className="ks-training-select__chevron" aria-hidden="true" />
          </button>

          {props.courseOpen ? (
            <div className="ks-training-select__menu ks-training-select__menu--grouped">
              <button
                type="button"
                className={clsx(
                  "ks-training-select__option ks-training-select__option--top",
                  !props.courseValue && "is-selected",
                )}
                onClick={() => {
                  props.setCourseValue("");
                  props.setPage(1);
                  props.setCourseOpen(false);
                }}
              >
                All courses
              </button>

              {GROUPED_COURSE_OPTIONS.map((group) => (
                <div key={group.label} className="ks-training-select__group">
                  <div className="ks-training-select__group-label">
                    {group.label}
                  </div>

                  {group.items.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={clsx(
                        "ks-training-select__option",
                        props.courseValue === option.value && "is-selected",
                      )}
                      onClick={() => {
                        props.setCourseValue(option.value);
                        props.setPage(1);
                        props.setCourseOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="news-admin__filter news-admin__filter--action">
        <button
          className="btn ks-training-admin__create"
          type="button"
          onClick={props.onCreate}
          disabled={props.createDisabled}
        >
          <img
            src="/icons/plus.svg"
            alt=""
            aria-hidden="true"
            className="btn__icon"
          />
          New training
        </button>
      </div>
    </div>
  );
}
// //src\app\components\training-card\ui\TrainingFilters.tsx
// "use client";

// import React from "react";
// import {
//   GROUPED_COURSE_OPTIONS,
//   ALL_COURSE_OPTIONS,
// } from "@/app/lib/courseOptions";
// import type { TrainingSortKey } from "../types";
// import { clsx, trainingSortLabel } from "../utils";

// type Props = {
//   q: string;
//   setQ: (value: string) => void;
//   setPage: (value: number) => void;
//   locations: string[];
//   locationFilter: string;
//   setLocationFilter: (value: string) => void;
//   courseValue: string;
//   setCourseValue: (value: string) => void;
//   sort: TrainingSortKey;
//   setSort: (value: TrainingSortKey) => void;
//   locationOpen: boolean;
//   setLocationOpen: React.Dispatch<React.SetStateAction<boolean>>;
//   courseOpen: boolean;
//   setCourseOpen: React.Dispatch<React.SetStateAction<boolean>>;
//   sortOpen: boolean;
//   setSortOpen: React.Dispatch<React.SetStateAction<boolean>>;
//   locationDropdownRef: React.RefObject<HTMLDivElement | null>;
//   courseDropdownRef: React.RefObject<HTMLDivElement | null>;
//   sortDropdownRef: React.RefObject<HTMLDivElement | null>;
// };

// function courseLabel(courseValue: string) {
//   if (!courseValue) return "All courses";
//   const found = ALL_COURSE_OPTIONS.find((item) => item.value === courseValue);
//   return found?.label || "All courses";
// }

// export default function TrainingFilters(props: Props) {
//   const locationLabel = props.locationFilter || "All locations";

//   return (
//     <div className="news-admin__filters">
//       <div className="news-admin__filter">
//         <label className="lbl news-admin__filter-label">Search</label>

//         <div className="input-with-icon">
//           <img
//             src="/icons/search.svg"
//             alt=""
//             aria-hidden="true"
//             className="input-with-icon__icon"
//           />
//           <input
//             value={props.q}
//             onChange={(event) => {
//               props.setQ(event.target.value);
//               props.setPage(1);
//             }}
//             className="input input-with-icon__input"
//             placeholder="e.g., Summer Camp or street/city/zip"
//           />
//         </div>
//       </div>

//       <div className="news-admin__filter news-admin__filter--sort">
//         <label className="lbl news-admin__filter-label">Locations</label>

//         <div
//           className={clsx(
//             "ks-training-select",
//             props.locationOpen && "ks-training-select--open",
//           )}
//           ref={props.locationDropdownRef}
//         >
//           <button
//             type="button"
//             className="ks-training-select__trigger"
//             onClick={() => {
//               props.setLocationOpen((open) => !open);
//               props.setCourseOpen(false);
//               props.setSortOpen(false);
//             }}
//           >
//             <span className="ks-training-select__label">{locationLabel}</span>
//             <span className="ks-training-select__chevron" aria-hidden="true" />
//           </button>

//           {props.locationOpen ? (
//             <ul className="ks-training-select__menu" role="listbox">
//               <li>
//                 <button
//                   type="button"
//                   className={clsx(
//                     "ks-training-select__option",
//                     !props.locationFilter && "is-selected",
//                   )}
//                   onClick={() => {
//                     props.setLocationFilter("");
//                     props.setPage(1);
//                     props.setLocationOpen(false);
//                   }}
//                 >
//                   All locations
//                 </button>
//               </li>

//               {props.locations.map((location) => (
//                 <li key={location}>
//                   <button
//                     type="button"
//                     className={clsx(
//                       "ks-training-select__option",
//                       props.locationFilter === location && "is-selected",
//                     )}
//                     onClick={() => {
//                       props.setLocationFilter(location);
//                       props.setPage(1);
//                       props.setLocationOpen(false);
//                     }}
//                   >
//                     {location}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           ) : null}
//         </div>
//       </div>

//       <div className="news-admin__filter news-admin__filter--sort">
//         <label className="lbl news-admin__filter-label">Sort</label>

//         <div
//           className={clsx(
//             "ks-training-select",
//             props.sortOpen && "ks-training-select--open",
//           )}
//           ref={props.sortDropdownRef}
//         >
//           <button
//             type="button"
//             className="ks-training-select__trigger"
//             onClick={() => {
//               props.setSortOpen((open) => !open);
//               props.setLocationOpen(false);
//               props.setCourseOpen(false);
//             }}
//           >
//             <span className="ks-training-select__label">
//               {trainingSortLabel(props.sort)}
//             </span>
//             <span className="ks-training-select__chevron" aria-hidden="true" />
//           </button>

//           {props.sortOpen ? (
//             <ul
//               className="ks-training-select__menu"
//               role="listbox"
//               aria-label="Sort"
//             >
//               <li>
//                 <button
//                   type="button"
//                   className={clsx(
//                     "ks-training-select__option",
//                     props.sort === "newest" && "is-selected",
//                   )}
//                   onClick={() => {
//                     props.setSort("newest");
//                     props.setPage(1);
//                     props.setSortOpen(false);
//                   }}
//                 >
//                   Newest
//                 </button>
//               </li>
//               <li>
//                 <button
//                   type="button"
//                   className={clsx(
//                     "ks-training-select__option",
//                     props.sort === "oldest" && "is-selected",
//                   )}
//                   onClick={() => {
//                     props.setSort("oldest");
//                     props.setPage(1);
//                     props.setSortOpen(false);
//                   }}
//                 >
//                   Oldest
//                 </button>
//               </li>
//               <li>
//                 <button
//                   type="button"
//                   className={clsx(
//                     "ks-training-select__option",
//                     props.sort === "training_asc" && "is-selected",
//                   )}
//                   onClick={() => {
//                     props.setSort("training_asc");
//                     props.setPage(1);
//                     props.setSortOpen(false);
//                   }}
//                 >
//                   Training A–Z
//                 </button>
//               </li>
//               <li>
//                 <button
//                   type="button"
//                   className={clsx(
//                     "ks-training-select__option",
//                     props.sort === "training_desc" && "is-selected",
//                   )}
//                   onClick={() => {
//                     props.setSort("training_desc");
//                     props.setPage(1);
//                     props.setSortOpen(false);
//                   }}
//                 >
//                   Training Z–A
//                 </button>
//               </li>
//             </ul>
//           ) : null}
//         </div>
//       </div>

//       <div className="news-admin__filter news-admin__filter--sort">
//         <label className="lbl news-admin__filter-label">Courses</label>

//         <div
//           className={clsx(
//             "ks-training-select",
//             props.courseOpen && "ks-training-select--open",
//           )}
//           ref={props.courseDropdownRef}
//         >
//           <button
//             type="button"
//             className="ks-training-select__trigger"
//             onClick={() => {
//               props.setCourseOpen((open) => !open);
//               props.setLocationOpen(false);
//               props.setSortOpen(false);
//             }}
//           >
//             <span className="ks-training-select__label">
//               {courseLabel(props.courseValue)}
//             </span>
//             <span className="ks-training-select__chevron" aria-hidden="true" />
//           </button>

//           {props.courseOpen ? (
//             <div className="ks-training-select__menu ks-training-select__menu--grouped">
//               <button
//                 type="button"
//                 className={clsx(
//                   "ks-training-select__option ks-training-select__option--top",
//                   !props.courseValue && "is-selected",
//                 )}
//                 onClick={() => {
//                   props.setCourseValue("");
//                   props.setPage(1);
//                   props.setCourseOpen(false);
//                 }}
//               >
//                 All courses
//               </button>

//               {GROUPED_COURSE_OPTIONS.map((group) => (
//                 <div key={group.label} className="ks-training-select__group">
//                   <div className="ks-training-select__group-label">
//                     {group.label}
//                   </div>

//                   {group.items.map((option) => (
//                     <button
//                       key={option.value}
//                       type="button"
//                       className={clsx(
//                         "ks-training-select__option",
//                         props.courseValue === option.value && "is-selected",
//                       )}
//                       onClick={() => {
//                         props.setCourseValue(option.value);
//                         props.setPage(1);
//                         props.setCourseOpen(false);
//                       }}
//                     >
//                       {option.label}
//                     </button>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// }
