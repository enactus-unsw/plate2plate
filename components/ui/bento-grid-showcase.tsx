"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 12,
    },
  },
};

interface BentoGridShowcaseProps {
  topLeft: React.ReactNode;
  topRight: React.ReactNode;
  bottomLeft: React.ReactNode;
  bottomRight: React.ReactNode;
  className?: string;
}

export const BentoGridShowcase = ({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  className,
}: BentoGridShowcaseProps) => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={cn(
        "grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-5",
        "auto-rows-auto",
        className
      )}
    >
      <motion.div variants={itemVariants}>
        {topLeft}
      </motion.div>

      <motion.div variants={itemVariants}>
        {topRight}
      </motion.div>

      <motion.div variants={itemVariants}>
        {bottomLeft}
      </motion.div>

      <motion.div variants={itemVariants}>
        {bottomRight}
      </motion.div>
    </motion.section>
  );
};
