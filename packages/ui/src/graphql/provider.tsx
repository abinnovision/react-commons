import { useMemo } from "react";
import { Provider } from "urql";

import { createUrqlClient } from "./create-client.js";

import type { FC, ReactNode } from "react";

interface GraphQLProviderProps {
	children: ReactNode;
	graphqlEndpoint: string;
	getAuthHeader?: () => string | null;
}

export const GraphQLProvider: FC<GraphQLProviderProps> = ({
	children,
	graphqlEndpoint,
	getAuthHeader,
}) => {
	const client = useMemo(
		() => createUrqlClient({ graphqlEndpoint, getAuthHeader }),
		[graphqlEndpoint, getAuthHeader],
	);

	return <Provider value={client}>{children}</Provider>;
};
