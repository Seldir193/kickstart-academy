import type { PageState, PaginationState } from "./types";

export function pagination(
  page: number,
  totalPages: number,
  onPrev: () => void,
  onNext: () => void,
): PaginationState {
  return { page, totalPages, onPrev, onNext };
}

export function provPendingPagination(p: PageState) {
  return pagination(p.pagProvPending.page, p.pagProvPending.pages, p.prevProvPending, p.nextProvPending);
}

export function provApprovedPagination(p: PageState) {
  return pagination(p.pagProvApproved.page, p.pagProvApproved.pages, p.prevProvApproved, p.nextProvApproved);
}

export function provRejectedPagination(p: PageState) {
  return pagination(p.pagProvRejected.page, p.pagProvRejected.pages, p.prevProvRejected, p.nextProvRejected);
}

export function minePendingPagination(p: PageState) {
  return pagination(p.pagMinePending.page, p.pagMinePending.pages, p.prevMinePending, p.nextMinePending);
}

export function mineApprovedPagination(p: PageState) {
  return pagination(p.pagMineApproved.page, p.pagMineApproved.pages, p.prevMineApproved, p.nextMineApproved);
}

export function mineRejectedPagination(p: PageState) {
  return pagination(p.pagMineRejected.page, p.pagMineRejected.pages, p.prevMineRejected, p.nextMineRejected);
}
