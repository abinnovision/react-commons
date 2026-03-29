/**
 * Extension data from GraphQL error for app exceptions.
 * Matches the backend AppException/MultiAppException format.
 */
export interface AppExceptionExtension {
	code: string;
	meta?: Record<string, unknown>;
	multiple_errors?: Array<{
		code: string;
		detail: string;
		status?: string;
		source?: { pointer?: string; parameter?: string };
		meta?: Record<string, unknown>;
	}>;
}

/**
 * Error codes that indicate transient failures and should be retried.
 */
const RETRYABLE_CODE_PREFIXES = ["DEFAULT__INTERNAL_SERVER_ERROR", "NETWORK__"];

/**
 * Determines if an error code represents a retryable error.
 */
function isRetryableCode(code: string): boolean {
	return RETRYABLE_CODE_PREFIXES.some((prefix) => code.startsWith(prefix));
}

/**
 * Frontend representation of a backend AppException.
 */
export class AppError extends Error {
	public readonly code: string;
	public readonly meta: Record<string, unknown> | undefined;
	public readonly isRetryable: boolean;

	public constructor(
		message: string,
		code: string,
		meta?: Record<string, unknown>,
	) {
		super(message);
		this.name = "AppError";
		this.code = code;
		this.meta = meta ?? undefined;
		this.isRetryable = isRetryableCode(code);
	}
}

/**
 * Frontend representation of a backend MultiAppException.
 */
export class MultiAppError extends Error {
	public readonly errors: AppError[];
	public readonly primaryCode: string;
	public readonly isRetryable: boolean;

	public constructor(errors: AppError[]) {
		const primaryError = errors[0];
		super(primaryError?.message ?? "Multiple errors occurred");
		this.name = "MultiAppError";
		this.errors = errors;
		this.primaryCode = primaryError?.code ?? "UNKNOWN";
		this.isRetryable = errors.some((e) => e.isRetryable);
	}
}
