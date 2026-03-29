import { CombinedError } from "urql";

import {
	AppError,
	MultiAppError,
	type AppExceptionExtension,
} from "./app-error.js";

export interface ParsedError {
	error: AppError | MultiAppError | Error;
	isAppError: boolean;
}

function isNetworkError(error: unknown): boolean {
	if (error instanceof CombinedError && error.networkError) {
		return true;
	}

	if (error instanceof Error) {
		const message = error.message.toLowerCase();

		return (
			message.includes("fetch") ||
			message.includes("network") ||
			message.includes("timeout") ||
			message.includes("aborted")
		);
	}

	return false;
}

function extractAppException(
	extensions: Record<string, unknown> | undefined,
): AppExceptionExtension | undefined {
	if (!extensions) {
		return undefined;
	}

	return extensions["app_exception"] as AppExceptionExtension | undefined;
}

/**
 * Parses a raw error from urql into a typed AppError or MultiAppError.
 */
export function parseGraphQLError(rawError: unknown): ParsedError {
	if (isNetworkError(rawError)) {
		return {
			error: new AppError(
				"Network error. Please check your connection.",
				"NETWORK__CONNECTION_ERROR",
			),
			isAppError: true,
		};
	}

	if (rawError instanceof CombinedError) {
		const graphqlError = rawError.graphQLErrors[0];
		const extension = extractAppException(graphqlError?.extensions);

		if (extension) {
			if (extension.multiple_errors && extension.multiple_errors.length > 0) {
				const errors = extension.multiple_errors.map(
					(err) => new AppError(err.detail, err.code, err.meta),
				);

				return { error: new MultiAppError(errors), isAppError: true };
			}

			const message = graphqlError?.message ?? "An error occurred";

			return {
				error: new AppError(message, extension.code, extension.meta),
				isAppError: true,
			};
		}

		const message = graphqlError?.message ?? rawError.message;

		return { error: new Error(message), isAppError: false };
	}

	if (rawError instanceof Error) {
		return { error: rawError, isAppError: false };
	}

	return { error: new Error("An unknown error occurred"), isAppError: false };
}
