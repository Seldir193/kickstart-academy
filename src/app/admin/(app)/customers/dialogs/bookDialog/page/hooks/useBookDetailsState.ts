import { useState } from "react";
import type { BookDetailsState } from "../types";

export function useBookDetailsState(): BookDetailsState {
  const text = useBookTextDetails();
  const main = useMainChildDetails();
  const sibling = useSiblingDetails();
  return { ...text, ...main, ...sibling };
}

function useBookTextDetails() {
  const [voucher, setVoucher] = useState("");
  const [source, setSource] = useState("");
  return { voucher, source, setVoucher, setSource };
}

function useMainChildDetails() {
  const [mainTShirtSize, setMainTShirtSize] = useState("");
  const [mainGoalkeeperSchool, setMainGoalkeeperSchool] = useState(false);
  return {
    mainTShirtSize,
    mainGoalkeeperSchool,
    setMainTShirtSize,
    setMainGoalkeeperSchool,
  };
}

function useSiblingDetails() {
  const [hasSibling, setHasSibling] = useState(false);
  const fields = useSiblingFieldState();
  return { hasSibling, setHasSibling, ...fields };
}

function useSiblingFieldState() {
  const [siblingGender, setSiblingGender] = useState("");
  const [siblingBirthDate, setSiblingBirthDate] = useState("");
  const [siblingFirstName, setSiblingFirstName] = useState("");
  const [siblingLastName, setSiblingLastName] = useState("");
  const [siblingTShirtSize, setSiblingTShirtSize] = useState("");
  const [siblingGoalkeeperSchool, setSiblingGoalkeeperSchool] = useState(false);
  return {
    siblingGender,
    siblingBirthDate,
    siblingFirstName,
    siblingLastName,
    siblingTShirtSize,
    siblingGoalkeeperSchool,
    setSiblingGender,
    setSiblingBirthDate,
    setSiblingFirstName,
    setSiblingLastName,
    setSiblingTShirtSize,
    setSiblingGoalkeeperSchool,
  };
}
