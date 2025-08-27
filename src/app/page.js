"use client";

import BannerCards from "@/components/BannerCards";
import BannerSection from "@/components/BannerSection";
import CategoriesCards from "@/components/CategoriesCards";
import ContactUs from "@/components/ContactUs";
import OurProcess from "@/components/OurProcess";
import Partners from "@/components/Partners";
import PublicLayout from "@/layout/PublicLayout";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <PublicLayout>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        variants={fadeInUp}
      >
        <BannerSection />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        variants={fadeInUp}
      >
        <BannerCards />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        variants={fadeInUp}
      >
        <CategoriesCards />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.6 }}
        variants={fadeInUp}
      >
        <OurProcess />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.8 }}
        variants={fadeInUp}
      >
        <Partners />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 1 }}
        variants={fadeInUp}
      >
        <ContactUs />
      </motion.div>
    </PublicLayout>
  );
}
