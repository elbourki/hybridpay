import { gql } from "graphql-request";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { graphQLClient } from "../../lib/hasura";
import { formatValue } from "react-currency-input-field";
import { assets, chains, chainOptions, gateways } from "../../lib/data";
import AxelarGatewayContract from "../../abi/IAxelarGateway.json";
import IERC20 from "../../abi/IERC20.json";
import Select from "react-select";
import Image from "next/image";
import { transferFee } from "../../lib/axelar";
import { ethers, Contract } from "ethers";
import classNames from "classnames";
import toast from "react-hot-toast";
import { handleErrors } from "../../lib/fetch";
import LineMdCircleToConfirmCircleTwotoneTransition from "../../components/icons/LineMdCircleToConfirmCircleTwotoneTransition";
import CiExternalLink from "../../components/icons/CiExternalLink";
import Decimal from "decimal.js";

declare global {
  interface Window {
    ethereum: ethers.providers.ExternalProvider;
  }
}

const Pay: NextPage = ({
  payment,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const [selected, setSelected] = useState<string>();
  const [fee, setFee] = useState<number>();
  const [loading, setLoading] = useState(false);

  const asset = assets.find(({ id }) => id === payment.token)!;
  const chain = chains.find(({ id }) => id === payment.chain)!;
  const selectedChain = chains.find(({ id }) => id === selected);
  const selectedGateway = gateways.find(({ id }) => id === selected);
  const selectedContract = asset.contracts.find(
    ({ chain }) => selectedChain?.id === chain
  );
  const validChainOptions = asset.contracts.map(
    ({ chain }) => chainOptions.find(({ value }) => value === chain)!
  );

  useEffect(() => {
    setFee(undefined);
    if (!selected) return;
    setLoading(true);
    transferFee(
      payment.chain,
      selected,
      payment.token,
      payment.amount.toString()
    )
      .then((fee) => setFee(fee))
      .catch(() => toast.error("Couldn't retrieve fee"))
      .finally(() => setLoading(false));
  }, [payment.amount, payment.chain, payment.token, selected]);

  const pay = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask is not installed");
      return;
    }
    if (!selectedChain || !selectedGateway || !selectedContract || !fee) return;
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      await provider.send("eth_requestAccounts", []).catch((e) => {
        toast.error("MetaMask connection rejected");
        throw e;
      });
      await provider
        .send("wallet_switchEthereumChain", [
          { chainId: selectedChain.provider_params[0].chainId },
        ])
        .catch((e) => {
          if (e.code === 4902)
            return provider.send(
              "wallet_addEthereumChain",
              selectedChain.provider_params
            );
          else throw e;
        })
        .catch((e) => {
          toast.error("Couldn't switch to network");
          throw e;
        });
      const signer = provider.getSigner();
      const srcGatewayContract = new Contract(
        selectedGateway.address,
        AxelarGatewayContract.abi,
        signer
      );
      const tokenAddress = selectedContract.address;
      const srcErc20 = new Contract(tokenAddress, IERC20.abi, signer);
      const total = ethers.utils.parseUnits(
        new Decimal(payment.amount).plus(fee).toString(),
        6
      );
      await toast.promise(
        srcErc20
          .approve(srcGatewayContract.address, total)
          .then((tx: any) => tx.wait()),
        {
          loading: "Waiting for approval",
          error: "Not approved",
          success: "Approved!",
        }
      );
      await toast.promise(
        srcGatewayContract
          .sendToken(
            chain?.name,
            payment.address,
            selectedContract.symbol,
            total,
            {
              gasLimit: 700000,
            }
          )
          .then((tx: ethers.providers.TransactionResponse) => tx.wait())
          .then((receipt: ethers.providers.TransactionReceipt) =>
            fetch("/api/payments", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                short_id: payment.short_id,
                payment_tx: receipt.transactionHash,
                payment_chain: selectedChain.id,
                paid_by: receipt.from,
              }),
            })
              .then(handleErrors)
              .then((r) => r.json())
              .then((r) => router.replace(router.asPath))
          ),
        {
          loading: "Sending tokens to destination",
          error: "Sending tokens failed",
          success: "Tokens sent!",
        }
      );
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (payment.payment_tx) {
    const paymentChain = chains.find(({ id }) => id === payment.payment_chain)!;

    return (
      <div className="bg-white shadow-in rounded-md">
        <div className="py-3 text-center">
          <LineMdCircleToConfirmCircleTwotoneTransition className="text-8xl text-green-400 mx-auto" />
          <h3 className="text-lg font-semibold text-green-500 mt-3">
            Payment successful!
          </h3>
        </div>
        <div className="p-6 pt-3">
          <div className="border-2 rounded-md">
            <div className="flex items-center gap-2 p-3 border-b">
              <Image
                width={30}
                height={30}
                src={asset.image}
                alt={asset.name}
              />
              <h3 className="text-lg font-semibold">
                {formatValue({
                  value: payment.amount.toString(),
                  prefix: `${asset.symbol} `,
                })}
              </h3>
            </div>
            <div className="p-3 space-y-3">
              <div className="flex justify-between text-xs gap-2">
                <span className="font-bold shrink-0">Transaction hash:</span>
                <a
                  className="break-all text-right"
                  href={`${paymentChain.provider_params[0].blockExplorerUrls[0]}/tx/${payment.payment_tx}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {payment.payment_tx}
                  <CiExternalLink className="inline" />
                </a>
              </div>
              <div className="flex justify-between text-xs gap-2">
                <span className="font-bold shrink-0">Paid to:</span>
                <a
                  className="break-all text-right"
                  href={`${chain.provider_params[0].blockExplorerUrls[0]}/address/${payment.address}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {payment.address}
                  <CiExternalLink className="inline" />
                </a>
              </div>
              <div className="flex justify-between text-xs gap-2">
                <span className="font-bold shrink-0">Paid by:</span>
                <a
                  className="break-all text-right"
                  href={`${paymentChain.provider_params[0].blockExplorerUrls[0]}/address/${payment.paid_by}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {payment.paid_by}
                  <CiExternalLink className="inline" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-in rounded-md">
      <h2 className="border-b p-5 text-lg font-semibold text-center relative">
        Payment request
      </h2>
      <div className="p-6">
        <div className="border-2 divide-y-2 rounded-md mb-4">
          <div className="flex items-center gap-2 p-3">
            <Image width={30} height={30} src={asset.image} alt={asset.name} />
            <div>
              <h3 className="text-lg font-semibold">
                {formatValue({
                  value: payment.amount.toString(),
                  prefix: `${asset.symbol} `,
                })}
              </h3>
            </div>
          </div>
          <div className="flex gap-2 p-3">
            <Image
              width={30}
              height={30}
              src={chain?.image!}
              alt={chain?.name}
            />
            <div className="truncate text-sm">
              <div className="uppercase text-xs text-slate-700">Recipient:</div>
              <div className="truncate">{payment.address}</div>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <small className="uppercase text-xs text-slate-700">
            Your payment chain
          </small>
          <Select
            value={validChainOptions?.find(({ value }) => value === selected)}
            onChange={(v) => setSelected(v?.value)}
            className="mt-2"
            instanceId="chain"
            options={validChainOptions}
            formatOptionLabel={(chain) => (
              <div className="flex gap-2">
                <Image
                  width={18}
                  height={18}
                  src={chain.image}
                  alt={chain.label}
                />
                <span>{chain.label}</span>
              </div>
            )}
          />
        </div>
        {fee && (
          <div className="border-2 rounded-md mb-4 p-3">
            <div className="text-slate-600 text-xs mb-1">
              Relayer fees:{" "}
              {formatValue({
                value: fee.toString(),
                prefix: selectedContract?.symbol + " ",
              })}
            </div>
            <div className="font-semibold">
              Total:{" "}
              {formatValue({
                value: new Decimal(payment.amount).plus(fee).toString(),
                prefix: selectedContract?.symbol + " ",
              })}
            </div>
          </div>
        )}
        <button
          className={classNames("btn mt-2", {
            loading,
          })}
          type="submit"
          disabled={!selected || loading}
          onClick={pay}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { payments_by_pk: payment } = await graphQLClient.request(
    gql`
      query ($short_id: String!) {
        payments_by_pk(short_id: $short_id) {
          short_id
          address
          amount
          chain
          token
          payment_tx
          payment_chain
          paid_by
        }
      }
    `,
    {
      short_id: context.query.short_id,
    }
  );

  if (!payment) {
    return {
      notFound: true,
    };
  }

  return {
    props: { payment },
  };
};

export default Pay;
