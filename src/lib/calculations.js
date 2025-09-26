import dayjs from "dayjs";

export function computePeriodRange(params) {
  const now = dayjs();
  let start, end;
  if (params.period) {
    switch (params.period) {
      case "1m":
        start = now.subtract(1, "month");
        break;
      case "3m":
        start = now.subtract(3, "month");
        break;
      case "6m":
        start = now.subtract(6, "month");
        break;
      case "1y":
        start = now.subtract(1, "year");
        break;
      default:
        throw new Error("Invalid period");
    }
    end = now;
  } else if (params.from && params.to) {
    start = dayjs(params.from);
    end = dayjs(params.to);
  } else {
    throw new Error("Provide period or from/to");
  }
  if (!start.isValid() || !end.isValid() || !end.isAfter(start)) {
    throw new Error("Invalid date range");
  }
  return { start: start.startOf("day"), end: end.startOf("day") };
}

export function pickNearestOrEarlierNav(navHistory, targetIsoDate) {
  // navHistory assumed sorted asc by date (iso)
  // Return entry with date <= targetIsoDate and nearest to it
  let candidate = undefined;
  for (let i = 0; i < navHistory.length; i++) {
    const entry = navHistory[i];
    if (entry.date <= targetIsoDate) {
      candidate = entry;
    } else {
      break;
    }
  }
  return candidate;
}

export function computeReturns(navHistory, params) {
  const { start, end } = computePeriodRange(params);
  const startEntry = pickNearestOrEarlierNav(navHistory, start.format("YYYY-MM-DD"));
  const endEntry = pickNearestOrEarlierNav(navHistory, end.format("YYYY-MM-DD")) || navHistory[navHistory.length - 1];

  if (!startEntry || !endEntry) {
    return { needs_review: true, reason: "Insufficient NAV data" };
  }
  const startNAV = startEntry.nav;
  const endNAV = endEntry.nav;
  const simpleReturn = ((endNAV - startNAV) / startNAV) * 100;

  const days = end.diff(start, "day");
  let annualizedReturn = null;
  if (days >= 30) {
    const years = days / 365.25;
    annualizedReturn = (Math.pow(endNAV / startNAV, 1 / years) - 1) * 100;
  }

  return {
    startDate: startEntry.date,
    endDate: endEntry.date,
    startNAV,
    endNAV,
    simpleReturn,
    annualizedReturn,
  };
}

export function generateSipSchedule(fromIso, toIso, frequency) {
  const schedule = [];
  let cursor = dayjs(fromIso).startOf("day");
  const end = dayjs(toIso).startOf("day");
  if (!cursor.isValid() || !end.isValid()) return schedule;
  const unit = frequency === "weekly" ? "week" : frequency === "quarterly" ? "quarter" : "month";
  while (cursor.isBefore(end) || cursor.isSame(end)) {
    schedule.push(cursor.format("YYYY-MM-DD"));
    cursor = cursor.add(1, unit);
  }
  return schedule;
}

export function computeSip(navHistory, { amount, frequency, from, to }) {
  const schedule = generateSipSchedule(from, to, frequency);
  if (!schedule.length) {
    return { needs_review: true, reason: "Empty SIP schedule" };
  }
  let totalUnits = 0;
  let totalInvested = 0;
  const contributions = [];

  for (const dateIso of schedule) {
    const entry = pickNearestOrEarlierNav(navHistory, dateIso);
    if (!entry || !Number.isFinite(entry.nav) || entry.nav <= 0) {
      continue;
    }
    const units = amount / entry.nav;
    totalUnits += units;
    totalInvested += amount;
    contributions.push({ date: entry.date, units, amount, nav: entry.nav });
  }

  if (totalInvested === 0 || totalUnits === 0) {
    return { needs_review: true, reason: "Insufficient valid NAVs during schedule" };
  }

  const endEntry = navHistory[navHistory.length - 1];
  const currentValue = totalUnits * endEntry.nav;
  const absoluteReturn = ((currentValue - totalInvested) / totalInvested) * 100;

  const years = dayjs(to).diff(dayjs(from), "day") / 365.25;
  const annualizedReturn = years > 0 ? (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100 : null;

  return {
    totalInvested,
    currentValue,
    totalUnits,
    absoluteReturn,
    annualizedReturn,
    endDate: endEntry.date,
    contributions,
  };
}


