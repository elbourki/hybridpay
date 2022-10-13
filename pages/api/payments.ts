import type { NextApiRequest, NextApiResponse } from "next";
import { graphQLClient } from "../../lib/hasura";
import { gql } from "graphql-request";
import { nanoid } from "../../lib/nanoid";

type Response = {
  short_id: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method === "POST") {
    const { token, chain, amount, address } = req.body;
    const {
      insert_payments_one: { short_id },
    } = await graphQLClient.request(
      gql`
        mutation (
          $token: String!
          $short_id: String!
          $chain: String!
          $amount: float8!
          $address: String!
        ) {
          insert_payments_one(
            object: {
              token: $token
              short_id: $short_id
              chain: $chain
              amount: $amount
              address: $address
            }
          ) {
            short_id
          }
        }
      `,
      {
        token,
        amount,
        chain,
        address,
        short_id: nanoid(),
      }
    );
    res.status(200).json({ short_id });
  } else if (req.method === "PATCH") {
    const { short_id, payment_tx, payment_chain, paid_by } = req.body;
    await graphQLClient.request(
      gql`
        mutation (
          $short_id: String!
          $paid_by: String!
          $payment_chain: String!
          $payment_tx: String!
        ) {
          update_payments_by_pk(
            pk_columns: { short_id: $short_id }
            _set: {
              paid_by: $paid_by
              payment_chain: $payment_chain
              payment_tx: $payment_tx
            }
          ) {
            payment_tx
          }
        }
      `,
      {
        short_id,
        payment_tx,
        payment_chain,
        paid_by,
      }
    );
    res.status(200).json({ short_id });
  } else res.status(405).end();
}
