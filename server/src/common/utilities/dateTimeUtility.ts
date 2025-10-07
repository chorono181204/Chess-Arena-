import { DateTime, DurationLike } from 'luxon';

export const getTimeNow = () => {
  return DateTime.now().toUTC().toJSDate();
};

export const getTimeNowWithTimeString = (): string => {
  const now = DateTime.now();
  return now.toFormat('HH:mm:ss'); // Format time as "hours:minutes:seconds"
};

export const getDateTimeNow = () => {
  return DateTime.now();
};

export const convertTimeStringToDate = (time: string) => {
  return DateTime.fromFormat(time, 'HH:mm:ss').toJSDate();
};

export const convertToUtc = (date: Date) => {
  return DateTime.fromJSDate(date).toUTC().toJSDate();
};

export const getExpiry = () => {
  const createdAt = DateTime.now();
  const expiresAt = createdAt.plus({ minutes: 2 });
  return expiresAt;
};

export function isTokenExpired(expiry: Date): boolean {
  const expirationDate = new Date(expiry);
  const currentDate = new Date();
  return expirationDate.getTime() <= currentDate.getTime();
}

export const getExpiryWith = (unit: DurationLike) => {
  const createdAt = DateTime.now();
  const expiredAt = createdAt.plus(unit).toJSDate();
  return expiredAt;
};

export const utcConvertTZ = (timestamp: Date, TZ: string = 'Asia/Jakarta') => {
  const theTime = DateTime.fromJSDate(timestamp);
  return theTime.setZone(TZ).toString();
};

/**
 * Function converted time utc to local and formated with reader friendly : 11 June 2024, 13:20:51
 * @param timestamp
 * @param TZ
 * @returns
 */
export const utcConvertTZWithFormatReader = (timestamp: Date, TZ: string) => {
  const theTime = DateTime.fromJSDate(timestamp);
  return theTime
    .setZone(TZ)
    .setLocale('id')
    .toLocaleString(DateTime.DATETIME_FULL);
};

export const getMonthFromIso = (datetime: Date) => {
  const date = DateTime.fromJSDate(datetime);
  return date.toFormat('MMMM');
};

export const getEndOfDay = (date: Date) => {
  const dateTime = DateTime.fromJSDate(date);
  return dateTime.endOf('day').toJSDate();
};

export const getStartOfDay = (date: Date) => {
  const dateTime = DateTime.fromJSDate(date);
  return dateTime.startOf('day').toJSDate();
};

export const getTimeDifference = (start: Date, end: Date) => {
  const differenceTimeMs = start.getTime() - end.getTime();
  const differenceTime = differenceTimeMs / 1000;
  const hours = Math.floor(differenceTime / 3600);
  const minutes = Math.floor((differenceTime % 3600) / 60);
  const seconds = Math.floor(differenceTime % 60);
  return `${hours} jam ${minutes} menit ${seconds} detik`;
};

export const convertSecondsToTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const second = Math.floor(seconds % 60);
  return `${hours}j${minutes}m`;
};

export const calculateTimeDifference = (
  scanIn: Date,
  scanOut: Date,
): string => {
  // Convert Date objects to DateTime objects
  const scanInDateTime = DateTime.fromJSDate(scanIn);
  const scanOutDateTime = DateTime.fromJSDate(scanOut);

  // Calculate the difference
  const duration = scanOutDateTime.diff(scanInDateTime, ['hours', 'minute']);

  // Extract the values
  const hours = duration.hours;
  const minutes = Math.floor(duration.minutes);

  // Format the duration string
  return `${hours}h ${minutes}m`;
};

export const getDuration = (startDate: Date, endDate: Date): number => {
  // Hitung selisih waktu dalam milidetik
  const timeDiff = endDate.getTime() - startDate.getTime();

  // Konversi milidetik ke jam (1 jam = 3600000 milidetik)
  const hoursDuration = timeDiff / 3600000;

  return parseFloat(hoursDuration.toFixed(2));
};

export const getStartAndEndDateFromMonth = (monthName: string) => {
  // Parse the given month name to a DateTime object
  const firstDayOfMonth = DateTime.fromFormat(monthName + ' 1', 'MMMM d');

  // Calculate the start date (last day of the previous month)
  const startDate = firstDayOfMonth.minus({ months: 1 }).endOf('month');

  // Calculate the end date (last day of the current month)
  const endDate = firstDayOfMonth.endOf('month');

  return { startDate, endDate };
};

export const getMonthAndYearFromISO = (datetime: Date) => {
  const date = DateTime.fromJSDate(datetime);
  return date.setLocale('id').toFormat('MMMM yyyy');
};

export const getTimeFormatID = (
  datetime: Date,
  timezone: string = 'Asia/Jakarta',
) => {
  const date = DateTime.fromJSDate(datetime);
  return date.setLocale('id').setZone(timezone).toFormat('EEEE, dd/MM/yyyy');
};

export const getTimeNowPlusDays = (days: number) => {
  const now = DateTime.now();
  return now.plus({ days }).toJSDate();
};

export const getTimeNowMinusDays = (days: number) => {
  const now = DateTime.now();
  return now.minus({ days }).toJSDate();
};

export const patrolTimePlusEndOfDay = (datetime: Date, days: number) => {
  const date = DateTime.fromJSDate(datetime);
  const datePlus = date.plus({ days });
  return datePlus.endOf('day').toJSDate();
};

export const patrolTimeMinusStartOfDay = (datetime: Date, days: number) => {
  const date = DateTime.fromJSDate(datetime);
  const dateMinus = date.minus({ days });
  return dateMinus.startOf('day').toJSDate();
};

export const calculateDurationToEpoch = (
  scanIn: Date,
  scanOut: Date,
): number => {
  // Convert Date objects to DateTime objects
  const scanInDateTime = DateTime.fromJSDate(scanIn);
  const scanOutDateTime = DateTime.fromJSDate(scanOut);

  // Calculate the difference in milliseconds
  const durationMs = scanOutDateTime.diff(
    scanInDateTime,
    'milliseconds',
  ).milliseconds;

  return durationMs;
};

export const epochToDuration = (epoch: number): string => {
  // Create a DateTime object from the epoch
  const dateTime = DateTime.fromMillis(epoch);

  // Calculate the duration from the Unix epoch
  const duration = dateTime.diff(DateTime.fromMillis(0), [
    'hours',
    'minutes',
    'seconds',
  ]);

  // Extract the values
  const hours = duration.hours;
  const minutes = duration.minutes;
  const seconds = duration.seconds;

  // Format the duration string
  return `${hours}h ${minutes}m ${seconds}s`;
};

// TIME FORMAT

export const formatTime = (dateTime: Date, tz: string = 'Asia/Jakarta') => {
  // Convert Date object to DateTime object
  const time = DateTime.fromJSDate(dateTime);
  // Format the time as HH:mm:ss
  return time.setZone(tz).toFormat('HH:mm');
};

// Patroli Scan time
export const isScanWithinTimeRange = (
  startTime: Date,
  endTime: Date,
  timeScan: Date,
): boolean => {
  // Handle cases where startTime is after endTime (e.g., overnight shift)
  const isEndTimeAfterStartTime = endTime > startTime;

  // Check if scan is within the primary time range (startTime to endTime)
  const isWithinPrimaryRange = timeScan >= startTime && timeScan < endTime;

  // Check if scan is within the secondary time range (after endTime, if applicable)
  const isWithinSecondaryRange =
    !isEndTimeAfterStartTime && timeScan >= endTime && timeScan < startTime;

  return isWithinPrimaryRange || isWithinSecondaryRange;
};

export const isScanWithinTimeRangeLuxon = (
  startTime: Date | DateTime,
  endTime: Date | DateTime,
  timeScan: DateTime,
): boolean => {
  // Convert startTime and endTime to DateTime objects if necessary
  const luxonStartTime =
    startTime instanceof Date ? DateTime.fromJSDate(startTime) : startTime;
  const luxonEndTime =
    endTime instanceof Date ? DateTime.fromJSDate(endTime) : endTime;
  // Check for primary range (normal case)
  const isWithinPrimaryRange =
    timeScan >= luxonStartTime && timeScan < luxonEndTime;

  // Check for secondary range (time range spans across midnight)
  const isWithinSecondaryRange =
    luxonEndTime < luxonStartTime && // Check if endTime is before startTime
    (timeScan >= luxonEndTime || timeScan < luxonStartTime.plus({ days: 1 })); // Check if timeScan falls within endTime or before next day's startTime

  return isWithinPrimaryRange || isWithinSecondaryRange;
};

export const extractTime = (theTime: Date): string => {
  const startTime = DateTime.fromJSDate(theTime).setZone('UTC');
  const startTimes = startTime.toFormat('HH:mm');
  return startTimes;
};

export const diffInDays = (start: Date, end: Date): number => {
  const startDate = DateTime.fromJSDate(start);
  const endDate = DateTime.fromJSDate(end);

  return Math.round(endDate.diff(startDate, 'days').days);
};
