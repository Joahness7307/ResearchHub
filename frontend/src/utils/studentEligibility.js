export function isEligibleResearchStudent(user) {
  if (!user || user.role !== "student") return false;

  return (
    user.year_level === "3rd" ||
    user.year_level === "4th" ||
    user.grade_level === "12"
  );
}
