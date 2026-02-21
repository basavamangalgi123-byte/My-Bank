"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("/api/balance", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setBalance(data.balance);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const toggleBalance = () => {
    setShowBalance(!showBalance);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div className="logo">🏦</div>
          <h1>SecureBank</h1>
          <p className="welcome-text">Welcome back{userName ? `, ${userName}` : ""}!</p>
        </div>

        <div className="balance-section">
          <div className="balance-card-new">
            <div className="balance-header">
              <span className="balance-icon">💰</span>
              <span className="balance-title">Available Balance</span>
            </div>

            <div className="balance-display">
              {loading ? (
                <div className="balance-loading">
                  <div className="spinner"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  <div className={`balance-amount-new ${showBalance ? "visible" : "hidden"}`}>
                    {showBalance ? `$${balance?.toLocaleString()}.00` : "••••••"}
                  </div>
                  <button onClick={toggleBalance} className="show-balance-btn">
                    {showBalance ? (
                      <>
                        <span className="eye-icon">🙈</span>
                        <span>Hide Balance</span>
                      </>
                    ) : (
                      <>
                        <span className="eye-icon">👁️</span>
                        <span>Show Balance</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn">
              <span className="action-icon">📤</span>
              <span>Transfer</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📥</span>
              <span>Deposit</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📊</span>
              <span>History</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>

        <div className="dashboard-footer">
          <button onClick={handleLogout} className="logout-btn-new">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}