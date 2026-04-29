export const StudentCard = ({ activeStudent, students, selectedStudentId, setSelectedStudentId }) => {
    return (
        <div className="group relative bg-bg-card border border-border rounded-xl p-5 transition-all duration-250 hover:border-border-hover hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
            <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Student
            </div>
            <div className="relative mt-1 mb-2">
                <select
                    className="w-full text-lg font-bold text-text-primary bg-bg-card-hover border border-border rounded-md px-3 py-2 pr-8 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none appearance-none cursor-pointer transition-colors"
                    value={selectedStudentId || activeStudent?.id || ""}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                    {students.map((student) => (
                        <option key={student.id} value={student.id}>
                            {student.name}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted text-xs">
                    ▼
                </div>
            </div>
            {activeStudent?.allergens?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {activeStudent.allergens.map((allergen) => (
                        <span key={allergen} className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-warning-bg text-warning border border-warning-border">
                            ⚠ {allergen}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};
