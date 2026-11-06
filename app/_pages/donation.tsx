import { CopyValue } from "@/app/_components/feedback";
import { TextLink } from "@/app/_components/ui";
import { type Locale } from "@/lib/i18n";
import { getPaymentDetails } from "@/lib/payment-settings";
import styles from "./donation.module.css";

export const metadata = {
  title: "Хандив — InnoLab",
  description: "InnoLab-ийн үйл ажиллагааг дэмжих дансны мэдээлэл. Суралцах, турших, бүтээх хүсэлд дэм болж буй танд баярлалаа.",
};

export default async function DonationPage({ locale = "mn" }: { locale?: Locale } = {}) {
  const en = locale === "en";
  const bank = await getPaymentDetails().catch(() => null);
  return (
    <section className={`container ${styles.page}`}>
      <div className={styles.grid}>
        <header className={styles.intro}>
          <p className="eyebrow">INNOLAB / {en ? "SUPPORT US" : "ХАНДИВ"}</p>
          <div className={styles.mark} aria-hidden="true">
            <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M40 59 22 42c-14-14 5-31 18-17 13-14 32 3 18 17L40 59Z" />
              <path d="M40 6v7M12 17l5 5M68 17l-5 5M9 43h7M71 43h-7m-36 24 12 5 12-5" />
            </svg>
          </div>
          <h1>{en ? "Your support keeps us creating." : "Таны дэмжлэг бидэнд урам өгдөг."}</h1>
          <p className={styles.lead}>{en
            ? "Learning, experimenting and turning ideas into real things — thank you for being part of InnoLab’s journey."
            : "Суралцах, турших, санаагаа бодит бүтээл болгох InnoLab-ийн аялалд хамт байгаад баярлалаа."}</p>
          <div className={styles.thanks}>
            <h2>{en ? "Thank you for your kindness." : "Дэмжсэн танд чин сэтгэлээсээ баярлалаа."}</h2>
            <p>{en
              ? "Every contribution, big or small, is encouragement to keep learning and building together. Your trust means a lot to us."
              : "Их, бага гэлтгүй таны дэмжлэг хамтдаа суралцаж, шинэ зүйл бүтээх урам болдог. Бидэнд итгэж, дэм болж буй танд талархаж байна."}</p>
            <span>— InnoLab {en ? "team" : "хамт олон"}</span>
          </div>
        </header>
        <section className={styles.bank} aria-labelledby="donation-bank-title">
          <p className="eyebrow">{en ? "BANK TRANSFER" : "ДАНСААР ХАНДИВЛАХ"}</p>
          <h2 id="donation-bank-title">{en ? "A little support. A shared journey." : "Бүтээх хүсэлд дэм нэмье."}</h2>
          {bank ? <>
            <p className={styles.note}>{en ? "You can send an amount of your choice to the account below." : "Та өөрийн боломжид нийцсэн дүнгээр доорх дансанд хандив илгээж болно."}</p>
            <dl className={styles.details}>
              <div><dt>{en ? "Bank" : "Банк"}</dt><dd>{bank.bank_name}</dd></div>
              <div><dt>{en ? "Account holder" : "Данс эзэмшигч"}</dt><dd>{bank.account_name}</dd></div>
            </dl>
            <CopyValue value={bank.account_number} label={en ? "Account / IBAN" : "Данс / IBAN"} locale={locale} />
            <CopyValue value="InnoLab хандив" label={en ? "Transfer reference" : "Гүйлгээний утга"} locale={locale} />
            <p className={styles.note}>{en ? "Copy the account details into your banking app to make a transfer." : "Дансны дугаарыг хуулж, банкны аппдаа оруулаад шилжүүлгээ хийгээрэй."}</p>
          </> : <p className={styles.note}>{en ? "Please contact us for the bank details. Thank you for wanting to support InnoLab." : "Дансны мэдээллийг бидэнтэй холбогдож аваарай. InnoLab-ийг дэмжихээр зорьж буй танд баярлалаа."}</p>}
          <div className={styles.contact}>
            <p>{en ? "Have a question about supporting us?" : "Хандивын талаар асуух зүйл байна уу?"}</p>
            <TextLink href="/contact" locale={locale}>{en ? "Get in touch" : "Бидэнтэй холбогдох"}</TextLink>
          </div>
        </section>
      </div>
    </section>
  );
}
