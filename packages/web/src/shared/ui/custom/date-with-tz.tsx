import { tz } from "@date-fns/tz";
import { format } from "date-fns";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/shadcn/tooltip";

// see https://date-fns.org/v4.4.0/docs/format
const DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
const DATE_FORMAT_TOOLTIP = "yyyy-MM-dd HH:mm:ss xxx";

type DateWithTzProps = {
	date: Date;
	timezone?: string | null;
};
export function DateWithTz({ date, timezone: timezone_ }: DateWithTzProps) {
	const fallback = Intl.DateTimeFormat().resolvedOptions().timeZone; // may be 'Etc/GMT-9' (not 'Asia/Tokyo')
	const timezone = timezone_ ?? fallback;

	return (
		<Tooltip>
			<TooltipTrigger>
				{format(date, DATE_FORMAT, { in: tz(timezone) })}
			</TooltipTrigger>
			<TooltipContent>
				{format(date, DATE_FORMAT_TOOLTIP, { in: tz(timezone) })}
			</TooltipContent>
		</Tooltip>
	);
}
