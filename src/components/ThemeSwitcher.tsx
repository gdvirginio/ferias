"use client";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || ""; // "dark" ou "pink"
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    // Definimos a lógica aqui:
    const newTheme = theme === "pink" ? "" : "pink";

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Agora usamos a variável correta:
    document.documentElement.className = newTheme;
  };

  return (
    <div className="theme-toggle" onClick={toggleTheme}>
      <div className={`toggle-knob ${theme === "pink" ? "active" : ""}`} />
    </div>
  );
}
