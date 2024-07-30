import type Locale from "@ui5/webcomponents-base/dist/locale/Locale.js";
import type CalendarType from "@ui5/webcomponents-base/dist/types/CalendarType.js";
import UniversalDate from "./UniversalDate.js";
import type LocaleData from "../LocaleData.js";
import type UI5Date from "./UI5Date.js";

const calculateWeekNumber = (confFirstDayOfWeek: number | undefined, oDate: Date | UI5Date, iYear: number, oLocale: Locale, oLocaleData: LocaleData, calendarType: CalendarType) => {
	let iWeekNum = 0;
	let iWeekDay = 0;
	const iFirstDayOfWeek = Number.isInteger(confFirstDayOfWeek) ? confFirstDayOfWeek! : oLocaleData.getFirstDayOfWeek();

	// search Locale for containing "en-US", since sometimes
	// when any user settings have been defined, subtag "sapufmt" is added to the locale name
	// this is described inside sap.ui.core.Configuration file
	if (oLocale && (oLocale.getLanguage() === "en" && oLocale.getRegion() === "US")) {
		/*
			* in US the week starts with Sunday
			* The first week of the year starts with January 1st. But Dec. 31 is still in the last year
			* So the week beginning in December and ending in January has 2 week numbers
			*/
		const oJanFirst = UniversalDate.getInstance(oDate, calendarType);
		oJanFirst.setUTCFullYear(iYear, 0, 1);
		iWeekDay = oJanFirst.getUTCDay();

		// get the date for the same weekday like jan 1.
		const oCheckDate = UniversalDate.getInstance(oDate, calendarType);
		oCheckDate.setUTCDate(oCheckDate.getUTCDate() - oCheckDate.getUTCDay() + iWeekDay);

		iWeekNum = Math.round((oCheckDate.getTime() - oJanFirst.getTime()) / 86400000 / 7) + 1;
	} else {
		// normally the first week of the year is the one where the first Thursday of the year is
		// find Thursday of this week
		// if the checked day is before the 1. day of the week use a day of the previous week to check
		const oThursday = UniversalDate.getInstance(oDate, calendarType);
		oThursday.setUTCDate(oThursday.getUTCDate() - iFirstDayOfWeek);
		iWeekDay = oThursday.getUTCDay();
		oThursday.setUTCDate(oThursday.getUTCDate() - iWeekDay + 4);

		const oFirstDayOfYear = UniversalDate.getInstance(new Date(oThursday.getTime()), calendarType);
		oFirstDayOfYear.setUTCMonth(0, 1);
		iWeekDay = oFirstDayOfYear.getUTCDay();
		let iAddDays = 0;
		if (iWeekDay > 4) {
			iAddDays = 7; // first day of year is after Thursday, so first Thursday is in the next week
		}
		const oFirstThursday = UniversalDate.getInstance(new Date(oFirstDayOfYear.getTime()), calendarType);
		oFirstThursday.setUTCDate(1 - iWeekDay + 4 + iAddDays);

		iWeekNum = Math.round((oThursday.getTime() - oFirstThursday.getTime()) / 86400000 / 7) + 1;
	}

	return iWeekNum;
};

export default calculateWeekNumber;
