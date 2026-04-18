/** Where to send the user after login/register when JWT + user are stored. */
export function getPostAuthPath(user) {
  if (!user) return "/";
  if (user.role === "admin") return "/admin/dashboard";
  if (user.role === "tutor" && !user.certifiedTutor) return "/tutor/certification";
  if (user.role === "tutor") return "/";
  return "/tutor-search";
}
