import type { NextPage } from "next";
import Image from "next/image";
import Select from "react-select";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import CurrencyInput from "react-currency-input-field";
import { useEffect, useState } from "react";
import classNames from "classnames";
import { handleErrors } from "../lib/fetch";
import toast from "react-hot-toast";
import Router from "next/router";
import { chainOptions, tokenOptions } from "../lib/data";

type FormValues = {
  chain?: typeof chainOptions[number];
  token?: typeof tokenOptions[number] | null;
  address?: string;
  amount: string;
};

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { isValid },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {},
    mode: "onChange",
  });

  const chain = watch("chain");
  const token = watch("token");

  const tokens = tokenOptions.filter((token) =>
    token.contracts.find((contract) => contract.chain === chain?.value)
  );

  const contract = token?.contracts.find(
    (contract) => contract.chain === chain?.value
  );

  useEffect(() => {
    setValue("token", null, {
      shouldValidate: true,
    });
  }, [chain, setValue]);

  useEffect(() => {
    setValue("amount", "", {
      shouldValidate: true,
    });
  }, [token, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    console.log(data);
    await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        amount: parseFloat(data.amount),
        chain: data.chain?.value,
        token: data.token?.value,
      }),
    })
      .then(handleErrors)
      .then((r) => r.json())
      .then((r) => Router.push(`/share/${r.short_id}`))
      .catch(() => toast.error("Something went wrong"));
    setLoading(false);
  };

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold">
          Accept cross-chain crypto payments with ease
        </h1>
      </div>
      <div className="bg-white shadow-in">
        <h2 className="border-b p-5 text-lg font-semibold text-center">
          Request a payment
        </h2>
        <form
          className="p-6"
          onSubmit={handleSubmit(onSubmit)}
          spellCheck="false"
        >
          <div className="mb-4">
            <small className="uppercase text-xs text-slate-700">
              The destination chain
            </small>
            <Controller
              name="chain"
              control={control}
              rules={{
                required: true,
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  instanceId="chain"
                  className="mt-2"
                  options={chainOptions}
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
              )}
            />
          </div>
          <div className="mb-4">
            <small className="uppercase text-xs text-slate-700">
              Your wallet address
            </small>
            <input
              className="input mt-2"
              placeholder="Enter your wallet address"
              disabled={!chain}
              {...register("address", { required: true, minLength: 10 })}
            />
          </div>
          <div className="mb-4">
            <small className="uppercase text-xs text-slate-700">
              The requested token
            </small>
            <Controller
              name="token"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  instanceId="token"
                  className="mt-2"
                  options={tokens}
                  isDisabled={!chain}
                  formatOptionLabel={(token) => (
                    <div className="flex gap-2">
                      <Image
                        width={18}
                        height={18}
                        src={token.image}
                        alt={token.label}
                      />
                      <span>{token.label}</span>
                    </div>
                  )}
                />
              )}
            />
          </div>
          <div className="mb-4">
            <small className="uppercase text-xs text-slate-700">
              The requested amount
            </small>
            <Controller
              name="amount"
              control={control}
              rules={{ validate: (s) => !!parseFloat(s) }}
              render={({ field: { value, onChange } }) => (
                <CurrencyInput
                  className="input mt-2"
                  disabled={!token}
                  autoComplete="off"
                  placeholder="Enter amount"
                  allowNegativeValue={false}
                  prefix={contract?.symbol + " "}
                  decimalsLimit={contract?.decimals || 2}
                  onValueChange={onChange}
                  value={value}
                />
              )}
            />
          </div>
          <button
            className={classNames("btn mt-2", {
              loading,
            })}
            type="submit"
            disabled={!isValid || loading}
          >
            Create Payment Link
          </button>
        </form>
      </div>
    </>
  );
};

export default Home;
