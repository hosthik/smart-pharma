import SubscriptionGuard from "@/components/pharmacy/SubscriptionGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SubscriptionGuard>{children}</SubscriptionGuard>;
}
