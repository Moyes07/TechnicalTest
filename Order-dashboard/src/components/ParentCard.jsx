export const ParentCard = ({ activeParent }) => {
    return (
        <div className="group relative bg-bg-card border border-border rounded-xl p-5 transition-all duration-250 hover:border-border-hover hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
            <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Parent Wallet
            </div>
            <div className="text-xl font-bold text-success">
                Rs.{activeParent?.walletBalance?.toFixed(2) ?? "0.00"}
            </div>
            <div className="text-xs text-text-muted mt-1">
                {activeParent?.name || ""}
            </div>
        </div>
    );
};
