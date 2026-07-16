import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "24px" }}>
      <div style={{ maxWidth: "480px", width: "100%", background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}>
        <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, letterSpacing: "0.18em", color: "#ef4444", textTransform: "uppercase" }}>
          Access denied
        </p>
        <h1 style={{ margin: "8px 0 12px", fontSize: "24px" }}>You are not authorized to view this page.</h1>
        <p style={{ margin: "0 0 20px", color: "#475569", lineHeight: 1.6 }}>
          Please sign in with the correct account or return to the home page.
        </p>
        <Link
          href="/auth/login"
          style={{ display: "inline-block", padding: "10px 16px", borderRadius: "8px", background: "#4f46e5", color: "#fff", textDecoration: "none" }}
        >
          Go to login
        </Link>
      </div>
    </main>
  );
}
