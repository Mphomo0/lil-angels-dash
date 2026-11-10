import { RoleProvider } from "@/lib/role";

export default function StaffRootLayout({ children }: LayoutProps<"/staff">) {
  return <RoleProvider>{children}</RoleProvider>;
}
