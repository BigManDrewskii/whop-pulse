import { WhopApp } from "@whop/react/components";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import "./theme.css";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Pulse - Member Activity Monitor",
	description: "Track member engagement and activity across your Whop community",
	openGraph: {
		title: "Pulse - Member Activity Monitor for Whop",
		description:
			"Track member engagement, identify at-risk members, and boost retention with real-time insights.",
		type: "website",
		siteName: "Pulse",
	},
	twitter: {
		card: "summary_large_image",
		title: "Pulse - Member Activity Monitor",
		description:
			"Track member engagement and boost retention in your Whop community.",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<WhopApp>
					<NavbarWrapper />
					{children}
				</WhopApp>
			</body>
		</html>
	);
}
