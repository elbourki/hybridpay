import { gql } from "graphql-request";
import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import MajesticonsArrowLeft from "../../components/icons/MajesticonsArrowLeft";
import MajesticonsCheckLine from "../../components/icons/MajesticonsCheckLine";
import MajesticonsClipboardCopyLine from "../../components/icons/MajesticonsClipboardCopyLine";
import MajesticonsMailLine from "../../components/icons/MajesticonsMailLine";
import MajesticonsShareLine from "../../components/icons/MajesticonsShareLine";
import PhMessengerLogoBold from "../../components/icons/PhMessengerLogoBold";
import PhTelegramLogoBold from "../../components/icons/PhTelegramLogoBold";
import PhWhatsappLogoBold from "../../components/icons/PhWhatsappLogoBold";
import { graphQLClient } from "../../lib/hasura";

const Share: NextPage = () => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const link = `${process.env.NEXT_PUBLIC_URL}/pay/${router.query.short_id}`;

  return (
    <div className="bg-white shadow-in rounded-md">
      <h2 className="border-b p-5 text-lg font-semibold text-center relative">
        Share payment request
        <Link href="/">
          <a className="absolute p-6 left-0 top-[50%] translate-y-[-50%]">
            <MajesticonsArrowLeft />
          </a>
        </Link>
      </h2>
      <div className="p-6">
        <label>
          <span className="uppercase text-xs text-slate-700">
            Your payment link
          </span>
          <input className="input mt-2" type="text" disabled value={link} />
        </label>
        <div className="border-2 rounded-md divide-y-2 mt-6">
          <button
            className="flex p-3 gap-3 text-sm font-semibold items-center w-full"
            onClick={() =>
              navigator.clipboard.writeText(link).then(() => setCopied(true))
            }
          >
            {copied ? (
              <MajesticonsCheckLine />
            ) : (
              <MajesticonsClipboardCopyLine />
            )}
            Copy to clipboard
          </button>
          <a
            className="flex p-3 gap-3 text-sm font-semibold items-center"
            href={`https://wa.me/?text=${encodeURIComponent(link)}`}
            target="_blank"
            rel="noreferrer"
          >
            <PhWhatsappLogoBold />
            Share via Whatsapp
          </a>
          <a
            className="flex p-3 gap-3 text-sm font-semibold items-center"
            href={`https://www.facebook.com/dialog/send?app_id=389569059747708&link=${encodeURIComponent(
              link
            )}&redirect_uri=${process.env.NEXT_PUBLIC_SHORT_URL}`}
            target="_blank"
            rel="noreferrer"
          >
            <PhMessengerLogoBold />
            Share via Messenger
          </a>
          <a
            className="flex p-3 gap-3 text-sm font-semibold items-center"
            href={`https://t.me/share/url?url=${encodeURIComponent(link)}`}
            target="_blank"
            rel="noreferrer"
          >
            <PhTelegramLogoBold />
            Share via Telegram
          </a>
          <a
            className="flex p-3 gap-3 text-sm font-semibold items-center"
            href={`mailto:?body=${encodeURIComponent(link)}`}
            target="_blank"
            rel="noreferrer"
          >
            <MajesticonsMailLine />
            Share via email
          </a>
          <button
            className="flex p-3 gap-3 text-sm font-semibold items-center w-full"
            onClick={() => navigator.share({ url: link })}
          >
            <MajesticonsShareLine />
            Other sharing options
          </button>
        </div>
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
    props: {},
  };
};

export default Share;
