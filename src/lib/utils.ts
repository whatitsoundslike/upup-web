import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function get1HourVersion(date = new Date()) {
    const ONE_HOUR = 60 * 60 * 1000;
    return Math.floor(date.getTime() / ONE_HOUR);
}
