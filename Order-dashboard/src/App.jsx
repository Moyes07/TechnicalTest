import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:3000";

const App = () => {
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState(null);

  const studentId = "student-1";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sRes, pRes, mRes, oRes] = await Promise.all([
        fetch(`${API_BASE}/students`),
        fetch(`${API_BASE}/parents`),
        fetch(`${API_BASE}/menu`),
        fetch(`${API_BASE}/orders`),
      ]);
      const [sData, pData, mData, oData] = await Promise.all([
        sRes.json(), pRes.json(), mRes.json(), oRes.json(),
      ]);
      setStudents(sData);
      setParents(pData);
      setMenuItems(mData);
      setOrders(oData);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const student = students.find((s) => s.id === studentId);
  const parent = student ? parents.find((p) => p.id === student.parentId) : null;

  const increment = (id) =>
    setQuantities((p) => ({ ...p, [id]: (p[id] || 0) + 1 }));

  const decrement = (id) =>
    setQuantities((p) => {
      const cur = p[id] || 0;
      if (cur <= 0) return p;
      const u = { ...p, [id]: cur - 1 };
      if (u[id] === 0) delete u[id];
      return u;
    });

  const selectedItems = menuItems
    .filter((item) => quantities[item.id] > 0)
    .map((item) => ({
      ...item,
      qty: quantities[item.id],
      lineTotal: parseFloat((item.price * quantities[item.id]).toFixed(2)),
    }));

  const orderTotal = parseFloat(
    selectedItems.reduce((s, i) => s + i.lineTotal, 0).toFixed(2)
  );

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      setResponse({ type: "error", message: "Please select at least one item." });
      return;
    }
    try {
      setSubmitting(true);
      setResponse(null);
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          items: selectedItems.map((i) => ({ menuItemId: i.id, quantity: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResponse({ type: "error", message: data.message || "Something went wrong" });
      } else {
        setResponse({
          type: "success",
          message: `Order ${data.id} confirmed — £${data.total.toFixed(2)} deducted from wallet.`,
        });
        setQuantities({});
        fetchData();
      }
    } catch {
      setResponse({ type: "error", message: "Network error — is the backend running?" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8 min-h-screen">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-text-primary to-accent bg-clip-text text-transparent">
            Order Dashboard
          </h1>
          <p className="text-text-secondary text-sm mt-2">Loading dashboard…</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-bg-card border border-border rounded-xl p-5">
              <div className="h-4 w-3/5 rounded bg-gradient-to-r from-bg-input via-bg-card-hover to-bg-input bg-[length:200%_100%] animate-shimmer mb-3" />
              <div className="h-4 w-4/5 rounded bg-gradient-to-r from-bg-input via-bg-card-hover to-bg-input bg-[length:200%_100%] animate-shimmer" />
            </div>
          ))}
        </div>
        <div className="bg-bg-card border border-border rounded-2xl p-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[52px] mb-3 rounded-lg bg-gradient-to-r from-bg-input via-bg-card-hover to-bg-input bg-[length:200%_100%] animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 min-h-screen animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-text-primary to-accent bg-clip-text text-transparent mb-2">
          Order Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="group relative bg-bg-card border border-border rounded-xl p-5 transition-all duration-250 hover:border-border-hover hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
          <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
            Student
          </div>
          <div className="text-xl font-bold text-text-primary">
            {student?.name || "Unknown"}
          </div>
          {student?.allergens?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {student.allergens.map((a) => (
                <span key={a} className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-warning-bg text-warning border border-warning-border">
                  ⚠ {a}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="group relative bg-bg-card border border-border rounded-xl p-5 transition-all duration-250 hover:border-border-hover hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
          <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
            Parent Wallet
          </div>
          <div className="text-xl font-bold text-success">
            Rs.{parent?.walletBalance?.toFixed(2) ?? "0.00"}
          </div>
          <div className="text-xs text-text-muted mt-1">{parent?.name || ""}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col gap-6">
          <div className="bg-bg-card border border-border rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.2)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2.5 text-base font-bold text-text-primary">
                Menu
              </div>
              <span className="text-[0.7rem] font-semibold px-2.5 py-1 rounded-full bg-accent-soft text-accent">
                {menuItems.length} item(s)
              </span>
            </div>
            <div className="px-6 py-4 space-y-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-bg-input hover:border-border-hover hover:bg-bg-card-hover transition-all duration-250"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[0.95rem] text-text-primary mb-1 truncate">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-accent">
                        Rs.{item.price.toFixed(2)}
                      </span>
                      {item.allergens.map((a) => (
                        <span key={a} className="text-[0.6rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-warning-bg text-warning border border-warning-border">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center rounded-lg border border-border overflow-hidden bg-bg-secondary ml-4 shrink-0">
                    <button
                      onClick={() => decrement(item.id)}
                      className="w-[34px] h-[34px] flex items-center justify-center bg-transparent border-none text-text-secondary text-base font-semibold cursor-pointer transition-all duration-150 hover:bg-accent-soft hover:text-accent active:scale-90 select-none"
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      −
                    </button>
                    <div className={`w-9 text-center text-sm font-bold border-x border-border py-1.5 bg-bg-input ${quantities[item.id] > 0 ? "text-accent" : "text-text-primary"}`}>
                      {quantities[item.id] || 0}
                    </div>
                    <button
                      onClick={() => increment(item.id)}
                      className="w-[34px] h-[34px] flex items-center justify-center bg-transparent border-none text-text-secondary text-base font-semibold cursor-pointer transition-all duration-150 hover:bg-accent-soft hover:text-accent active:scale-90 select-none"
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.2)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2.5 text-base font-bold text-text-primary">
                Order Summary
              </div>
            </div>
            <div className="px-6 py-4">
              {selectedItems.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-sm">
                  <div>Select items from the menu to begin</div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2.5 border-b border-border last:border-b-0">
                      <div className="text-sm text-text-secondary">
                        {item.name} <span className="text-text-muted text-xs">× {item.qty}</span>
                      </div>
                      <div className="font-semibold text-text-primary text-sm">
                        Rs.{item.lineTotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <hr className="border-0 border-t border-dashed border-border-hover my-1" />
                  <div className="flex justify-between items-center pt-3">
                    <div className="text-base font-semibold text-text-primary">Total</div>
                    <div className="text-xl font-extrabold text-accent">
                      Rs.{orderTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || selectedItems.length === 0}
                className="w-full mt-5 py-3.5 px-6 rounded-xl font-bold text-white text-[0.95rem] tracking-wide
                  bg-gradient-to-br from-accent to-[#8b5cf6]
                  shadow-[0_4px_15px_var(--color-accent-glow)]
                  transition-all duration-250 cursor-pointer border-none
                  hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_6px_25px_var(--color-accent-glow)]
                  active:not-disabled:translate-y-0
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {submitting ? "Placing Order…" : "Place Order"}
              </button>

              {response && (
                <div className={`mt-4 p-3.5 rounded-xl text-sm font-medium flex items-start gap-2.5 animate-slide-in
                  ${response.type === "success"
                    ? "bg-success-bg border border-success-border text-success"
                    : "bg-danger-bg border border-danger-border text-danger"
                  }`}
                >
                  <span className="text-base shrink-0 mt-px">
                    {response.type === "success" ? "✅" : "❌"}
                  </span>
                  <span>{response.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.2)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2.5 text-base font-bold text-text-primary">
              Order History
            </div>
            <span className="text-[0.7rem] font-semibold px-2.5 py-1 rounded-full bg-accent-soft text-accent">
              {orders.length} orders
            </span>
          </div>
          <div className="px-6 py-4">
            {orders.length === 0 ? (
              <div className="text-center py-10 text-text-muted text-sm">
                <div>No orders yet</div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scroll">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 rounded-xl border border-border bg-bg-input transition-all duration-250 hover:border-border-hover">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="font-bold text-sm text-accent">{order.id}</span>
                      <span className={`text-[0.6rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full
                        ${order.status === "CONFIRMED"
                          ? "bg-success-bg text-success border border-success-border"
                          : order.status === "PENDING"
                            ? "bg-warning-bg text-warning border border-warning-border"
                            : "bg-danger-bg text-danger border border-danger-border"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary mb-2 leading-relaxed">
                      {order.items.map((i) => `${i.menuItemName} × ${i.quantity}`).join(", ")}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[0.95rem] text-text-primary">
                        Rs.{order.total.toFixed(2)}
                      </span>
                      <span className="text-[0.7rem] text-text-muted">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;