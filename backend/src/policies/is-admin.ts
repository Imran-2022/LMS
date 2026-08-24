export default async (policyContext: any) => policyContext.state.user?.role?.type === 'admin';
