import { Navbar, MobileBottomNav } from "@/components/Navbar";

export default function ShareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <MobileBottomNav />
        </>
    );
}
