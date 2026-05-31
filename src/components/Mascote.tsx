"use client";

import { motion } from "framer-motion";

export function Mascote() {
  return (
    <motion.div
      // Animação contínua (Flutuar)
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      // Reação ao passar o mouse por cima (Susto/Animação fofa)
      whileHover={{
        scale: 1.1,
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.3 },
      }}
      style={{
        width: "120px",
        height: "120px",
        cursor: "pointer",
      }}
    >
      {/* Insira o SVG do seu mascote ou a Tag <img> aqui */}
      <img
        src="/assets/mascote.png"
        alt="Mascote do App"
        style={{ width: "100%", height: "100%" }}
      />
    </motion.div>
  );
}
