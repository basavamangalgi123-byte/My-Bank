import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <div className="home-container">
        <h1>🏦 SecureBank</h1>
        <p>Your trusted banking partner</p>
        <div className="btn-group">
          <Link href="/register" className="btn-outline">Register</Link>
          <Link href="/login" className="btn-outline">Login</Link>
        </div>
      </div>
    </div>
  );
}
