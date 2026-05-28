"use client";

import { useState } from "react";

export function AdminLogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      await fetch("/api/admin/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="button-secondary disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? "Uscita..." : "Esci"}
    </button>
  );
}
