import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Header from "./_components/header";
import Sidebar from "./_components/sidebar";

export const metadata: Metadata = {
	title: "Create T3 App",
	description: "Generated by create-t3-app",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
			<body>
				<div className="min-h-screen bg-gray-900 text-white">
					<div className="flex">
						<Sidebar />

						<main className="ml-64 flex-1">
							<Header />

							<div className="p-6">{children}</div>
						</main>
					</div>
				</div>
			</body>
		</html>
	);
}
