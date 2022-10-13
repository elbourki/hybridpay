import { AxelarQueryAPI, Environment } from "@axelar-network/axelarjs-sdk";
import { utils } from "ethers";

export const transferFee = async (
  srcChain: string,
  destChain: string,
  denom: string,
  amount: string
) => {
  const axelarQueryApi = new AxelarQueryAPI({
    environment: Environment.MAINNET,
    axelarRpcUrl: "https://axelar-mainnet-rpc.allthatnode.com:26657",
    axelarLcdUrl: "https://axelar-mainnet-rpc.allthatnode.com:1317",
  });
  const feeResponse = await axelarQueryApi.getTransferFee(
    srcChain,
    destChain,
    denom,
    utils.parseUnits(amount, 6).toNumber()
  );
  return +utils.formatUnits(feeResponse.fee?.amount || 0, 6);
};
