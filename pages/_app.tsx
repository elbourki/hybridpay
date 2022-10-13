import "../styles/globals.css";
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/600.css";
import "@fontsource/work-sans/700.css";
import "@fontsource/work-sans/800.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>HybridPay</title>
      </Head>
      <Toaster />
      <div className="p-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <a className="flex items-center gap-2">
                <Image
                  width={26}
                  height={26}
                  src="/images/logo.png"
                  alt="HybridPay"
                />
                <span className="font-bold text-[#1654ea] text-2xl">
                  HybridPay
                </span>
              </a>
            </Link>
          </div>
          <Component {...pageProps} />
          <div className="font-semibold text-center text-sm mt-4 text-slate-700">
            © {new Date().getFullYear()} HybridPay • Powered by Axelar
          </div>
        </div>
      </div>
    </>
  );
}

export default MyApp;
