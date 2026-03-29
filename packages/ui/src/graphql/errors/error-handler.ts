import { AppError, MultiAppError } from "./app-error.js";
import { parseGraphQLError } from "./parse-graphql-error.js";

export interface HandleErrorOptions {
	silent?: boolean;
	fallbackMessage?: string;
}

export interface HandleErrorResult {
	error: AppError | MultiAppError | Error;
	message: string;
	code: string | null;
	isRetryable: boolean;
}

interface ToastHandler {
	error: (msg: string) => void;
}

let toastHandler: ToastHandler | null = null;

/**
 * Set the toast handler for error display.
 * Called by a React component to connect hooks to the global handler.
 */
export function setToastHandler(handler: ToastHandler): void {
	toastHandler = handler;
}

function extractMessage(
	error: AppError | MultiAppError | Error,
	fallback: string,
): string {
	if (error instanceof AppError || error instanceof MultiAppError) {
		return error.message || fallback;
	}

	return error.message || fallback;
}

function extractCode(error: AppError | MultiAppError | Error): string | null {
	if (error instanceof AppError) {
		return error.code;
	}

	if (error instanceof MultiAppError) {
		return error.primaryCode;
	}

	return null;
}

function checkRetryable(error: AppError | MultiAppError | Error): boolean {
	if (error instanceof AppError || error instanceof MultiAppError) {
		return error.isRetryable;
	}

	const message = error.message.toLowerCase();

	return (
		message.includes("fetch") ||
		message.includes("network") ||
		message.includes("timeout")
	);
}

/**
 * Handle an error by parsing it, optionally showing a toast, and returning structured info.
 */
export function handleError(
	rawError: unknown,
	options: HandleErrorOptions = {},
): HandleErrorResult {
	const { silent = false, fallbackMessage = "Something went wrong" } = options;

	const { error } = parseGraphQLError(rawError);
	const message = extractMessage(error, fallbackMessage);
	const code = extractCode(error);
	const isRetryable = checkRetryable(error);

	if (!silent && toastHandler) {
		toastHandler.error(message);
	}

	return { error, message, code, isRetryable };
}

/**
 * Determine if a failed operation should be retried based on error type.
 */
export function shouldRetry(error: unknown): boolean {
	const { error: parsedError } = parseGraphQLError(error);

	return checkRetryable(parsedError);
}
