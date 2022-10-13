import { GraphQLClient } from "graphql-request";

export const graphQLClient = new GraphQLClient(process.env.HASURA_ENDPOINT!, {
  headers: {
    "X-Hasura-Admin-Secret": process.env.HASURA_ADMIN_SECRET!,
  },
});
