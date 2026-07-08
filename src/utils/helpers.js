import { FEE_MONTHS, CALENDAR_MONTHS } from "./constants";

export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

export const getLocalDateString = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const getCampusColor = (campusId) => {
  const colors = {
    boys: "#185FA5",
    girls: "#993556",
    kids: "#854F0B",
  };
  return colors[campusId] || "#185FA5";
};

export const getStatusBadgeClass = (status) => {
  const statusLower = (status || "unpaid").toLowerCase();
  if (statusLower === "paid") return "bg-[#e1f5ee] text-[#0f6e56]";
  if (statusLower === "partial") return "bg-[#faeeda] text-[#ba7517]";
  return "bg-[#fcebeb] text-[#a32d2d]";
};

export const getCurrentMonthName = () => CALENDAR_MONTHS[new Date().getMonth()];

export const getAcademicYearStart = (date = new Date()) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  return month < 2 ? year - 1 : year;
};

export const getAcademicYearLabel = (startYear = getAcademicYearStart()) =>
  `${startYear}-${String(startYear + 1).slice(-2)}`;

export const getFeeYearForMonth = (
  month,
  academicStartYear = getAcademicYearStart(),
) => {
  if (month === "January" || month === "February") return academicStartYear + 1;
  return academicStartYear;
};

export const findFeeRecord = (
  feeRecords,
  month,
  academicStartYear = getAcademicYearStart(),
) => {
  if (Array.isArray(feeRecords)) {
    const year = getFeeYearForMonth(month, academicStartYear);
    return (
      feeRecords.find((r) => r.month === month && r.year === year) ||
      feeRecords.find((r) => r.month === month) ||
      null
    );
  }
  if (feeRecords && typeof feeRecords === "object") {
    const year = getFeeYearForMonth(month, academicStartYear);
    return feeRecords[`${month}_${year}`] || feeRecords[month] || null;
  }
  return null;
};

export const buildMonthlyRecordsMap = (
  feeRecords,
  academicStartYear = getAcademicYearStart(),
) => {
  const map = {};
  FEE_MONTHS.forEach((month) => {
    map[month] = findFeeRecord(feeRecords, month, academicStartYear);
  });
  return map;
};

export const getDefaultFeeRecord = (monthlyFee = 2000) => ({
  status: "Unpaid",
  amount: monthlyFee,
  paidAmount: 0,
});

export const getDefaultFeeStartMonth = () =>
  CALENDAR_MONTHS[new Date().getMonth()];

export const resolveStudentFeeStartMonth = (student) => {
  if (student?.feeStartMonth) return student.feeStartMonth;
  if (student?.admissionDate) {
    return CALENDAR_MONTHS[new Date(student.admissionDate).getMonth()];
  }
  return FEE_MONTHS[0];
};

export const getStudentFeeStartIndex = (student) => {
  const feeStartMonth = resolveStudentFeeStartMonth(student);
  const index = FEE_MONTHS.indexOf(feeStartMonth);
  return index === -1 ? 0 : index;
};

export const isMonthBeforeFeeStart = (student, month) => {
  const monthIndex = FEE_MONTHS.indexOf(month);
  if (monthIndex === -1) return false;
  return monthIndex < getStudentFeeStartIndex(student);
};

export const formatDisplayDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
