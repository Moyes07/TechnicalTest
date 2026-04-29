export const Loader = () => {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8 min-h-screen">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-text-primary to-accent bg-clip-text text-transparent">
                    Order Dashboard
                </h1>
                <p className="text-text-secondary text-sm mt-2">Loading dashboard…</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-bg-card border border-border rounded-xl p-5">
                    <div className="h-4 w-3/5 rounded bg-gradient-to-r from-bg-input via-bg-card-hover to-bg-input bg-[length:200%_100%] animate-shimmer mb-3" />
                    <div className="h-4 w-4/5 rounded bg-gradient-to-r from-bg-input via-bg-card-hover to-bg-input bg-[length:200%_100%] animate-shimmer" />
                </div>
                <div className="bg-bg-card border border-border rounded-xl p-5">
                    <div className="h-4 w-3/5 rounded bg-gradient-to-r from-bg-input via-bg-card-hover to-bg-input bg-[length:200%_100%] animate-shimmer mb-3" />
                    <div className="h-4 w-4/5 rounded bg-gradient-to-r from-bg-input via-bg-card-hover to-bg-input bg-[length:200%_100%] animate-shimmer" />
                </div>
            </div>

            <div className="bg-bg-card border border-border rounded-2xl p-6">
                <div className="h-[52px] mb-3 rounded-lg bg-gradient-to-r from-bg-input via-bg-card-hover to-bg-input bg-[length:200%_100%] animate-shimmer" />
                <div className="h-[52px] mb-3 rounded-lg bg-gradient-to-r from-bg-input via-bg-card-hover to-bg-input bg-[length:200%_100%] animate-shimmer" />
                <div className="h-[52px] mb-3 rounded-lg bg-gradient-to-r from-bg-input via-bg-card-hover to-bg-input bg-[length:200%_100%] animate-shimmer" />
                <div className="h-[52px] mb-3 rounded-lg bg-gradient-to-r from-bg-input via-bg-card-hover to-bg-input bg-[length:200%_100%] animate-shimmer" />
            </div>
        </div>
    );
};
