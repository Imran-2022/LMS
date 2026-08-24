export default async (policyContext: any) => {
  const user = policyContext.state.user;
  if (!user) return false;
  if (["admin", "content_manager"].includes(user.role?.type)) return true;
  return Number(policyContext.params.id) === Number(user.id);
};
