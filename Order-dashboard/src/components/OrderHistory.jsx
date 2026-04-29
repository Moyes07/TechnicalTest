export const OrderHistory = ({ orders }) => {
    return (
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
                                    {order.items.map((item) => `${item.menuItemName} × ${item.quantity}`).join(", ")}
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
    );
};
