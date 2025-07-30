import Header from "./_components/header";
import Sidebar from "./_components/sidebar";

export default function DriveLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-1">
      <Sidebar />

      <main className="ml-64 flex flex-1 flex-col">
        <Header />
        {children}
      </main>
    </div>
  );
}
