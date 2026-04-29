export const MenuList = ({ menuItems, cartQuantities, incrementCartItem, decrementCartItem }) => {
    return (
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
                                {item.allergens.map((allergen) => (
                                    <span key={allergen} className="text-[0.6rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-warning-bg text-warning border border-warning-border">
                                        {allergen}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center rounded-lg border border-border overflow-hidden bg-bg-secondary ml-4 shrink-0">
                            <button
                                onClick={() => decrementCartItem(item.id)}
                                className="w-[34px] h-[34px] flex items-center justify-center bg-transparent border-none text-text-secondary text-base font-semibold cursor-pointer transition-all duration-150 hover:bg-accent-soft hover:text-accent active:scale-90 select-none"
                                aria-label={`Decrease ${item.name} quantity`}
                            >
                                −
                            </button>
                            <div className={`w-9 text-center text-sm font-bold border-x border-border py-1.5 bg-bg-input ${cartQuantities[item.id] > 0 ? "text-accent" : "text-text-primary"}`}>
                                {cartQuantities[item.id] || 0}
                            </div>
                            <button
                                onClick={() => incrementCartItem(item.id)}
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
    );
};
