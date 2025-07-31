import AboutUsSection from "@/components/AboutUsSection";
import BannerCards from "@/components/BannerCards";
import BannerSection from "@/components/BannerSection";
import BrandSlider from "@/components/BrandSlider";
import CategoriesCards from "@/components/CategoriesCards";
import ContactUs from "@/components/ContactUs";
import OurProcess from "@/components/OurProcess";
import PublicLayout from "@/layout/PublicLayout";

export default function Home() {
  return (
    <PublicLayout>
      <BannerSection />

      <BannerCards />

      <AboutUsSection />

      <CategoriesCards />

      <OurProcess />

      <BrandSlider />

      <ContactUs />
    </PublicLayout>
  );
}
