import BannerCards from "@/components/BannerCards";
import BannerSection from "@/components/BannerSection";
import CategoriesCards from "@/components/CategoriesCards";
import ContactUs from "@/components/ContactUs";
import OurProcess from "@/components/OurProcess";
import Partners from "@/components/Partners";
import PublicLayout from "@/layout/PublicLayout";

export default function Home() {
  return (
    <PublicLayout>
      <BannerSection />

      <BannerCards />

      <CategoriesCards />

      <OurProcess />

      <Partners />

      <ContactUs />
    </PublicLayout>
  );
}
