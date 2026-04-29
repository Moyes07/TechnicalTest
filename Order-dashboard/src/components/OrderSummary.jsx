export const OrderSummary = ({ selectedItems, orderTotal, isSubmitting, orderResponse, submitOrder }) => {
    return (
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
                                    {item.name} <span className="text-text-muted text-xs">× {item.quantity}</span>
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
                    onClick={submitOrder}
                    disabled={isSubmitting || selectedItems.length === 0}
                    className="w-full mt-5 py-3.5 px-6 rounded-xl font-bold text-white text-[0.95rem] tracking-wide
            bg-gradient-to-br from-accent to-[#8b5cf6]
            shadow-[0_4px_15px_var(--color-accent-glow)]
            transition-all duration-250 cursor-pointer border-none
            hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_6px_25px_var(--color-accent-glow)]
            active:not-disabled:translate-y-0
            disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {isSubmitting ? "Placing Order…" : "Place Order"}
                </button>

                {orderResponse && (
                    <div className={`mt-4 p-3.5 rounded-xl text-sm font-medium flex items-start gap-2.5 animate-slide-in
            ${orderResponse.type === "success"
                            ? "bg-success-bg border border-success-border text-success"
                            : "bg-danger-bg border border-danger-border text-danger"
                        }`}
                    >
                        <span>
                            {orderResponse.type === "success" ? "Confirmed:" : "Error:"}
                        </span>
                        <span >{orderResponse.message}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
