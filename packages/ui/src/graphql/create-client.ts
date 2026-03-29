import { cacheExchange } from "@urql/exchange-graphcache";
import { retryExchange } from "@urql/exchange-retry";
import { createClient as createSSEClient } from "graphql-sse";
import { Client, fetchExchange, mapExchange, subscriptionExchange } from "urql";

import { handleError, shouldRetry } from "./errors/index.js";

import type { RequestParams } from "graphql-sse";
import type { CombinedError, Operation } from "urql";

export interface CreateUrqlClientOptions {
	/**
	 * GraphQL endpoint URL
	 */
	graphqlEndpoint: string;
	/**
	 *  Optional callback to get the auth header value
	 */
	getAuthHeader?: (() => string | null) | undefined;
	/**
	 *  Enable SSE subscriptions (default: true)
	 */
	subscriptions?: boolean | undefined;
}

/**
 * Create a configured urql client with standard exchanges.
 * Includes: normalized cache, retry, error handling, and optional SSE subscriptions.
 */
export function createUrqlClient(options: CreateUrqlClientOptions): Client {
	const { graphqlEndpoint, getAuthHeader, subscriptions = true } = options;

	const exchanges = [
		cacheExchange({}),
		mapExchange({
			onError(error: CombinedError) {
				handleError(error);
			},
		}),
		retryExchange({
			retryIf(error: CombinedError, operation: Operation): boolean {
				if (operation.kind === "mutation") {
					return false;
				}

				return shouldRetry(error);
			},
			maxNumberAttempts: 3,
			initialDelayMs: 250,
			maxDelayMs: 1000,
			randomDelay: true,
		}),
		fetchExchange,
	];

	if (subscriptions) {
		const sseClient = createSSEClient({
			url: `${graphqlEndpoint}/stream`,
			credentials: "include",
		});

		exchanges.push(
			subscriptionExchange({
				forwardSubscription: (request) => ({
					subscribe: (sink) => {
						const requestParams: RequestParams = {
							query: request.query ?? "",
						};

						if (request.operationName !== undefined) {
							requestParams.operationName = request.operationName;
						}

						if (request.variables !== undefined) {
							requestParams.variables = request.variables as Record<
								string,
								unknown
							>;
						}

						if (request.extensions !== undefined) {
							requestParams.extensions = request.extensions as Record<
								string,
								unknown
							>;
						}

						return {
							unsubscribe: sseClient.subscribe(requestParams, sink),
						};
					},
				}),
			}),
		);
	}

	return new Client({
		url: graphqlEndpoint,
		exchanges,
		fetchOptions: () => {
			const headers: Record<string, string> = {};

			if (getAuthHeader) {
				const authHeader = getAuthHeader();

				if (authHeader) {
					headers["Authorization"] = authHeader;
				}
			}

			return { headers, credentials: "include" };
		},
	});
}
