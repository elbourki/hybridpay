import evm_chains from "../data/evm_chains.json";
import evm_assets from "../data/evm_assets.json";
import all_gateways from "../data/gateways.json";

export const chains = evm_chains.mainnet;

export const assets = evm_assets.mainnet;

export const gateways = all_gateways.mainnet;

export const chainOptions = chains.map((chain) => ({
  label: chain.name,
  value: chain.id,
  image: chain.image,
}));

export const tokenOptions = assets.map((asset) => ({
  label: asset.name,
  value: asset.id,
  image: asset.image,
  contracts: asset.contracts,
}));
