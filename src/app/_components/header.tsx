import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Search, Settings } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { auth } from "~/server/auth";
import SignInButton from "./sign-in-button";

export default async function Header() {
	const session = await auth();

	return (
		<header className="border-gray-800 border-b">
			<div className="flex items-center justify-between px-6 py-3">
				<div className="flex items-center space-x-4">
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
						<Input
							placeholder="Search in Drive"
							className="w-96 border-gray-700 bg-gray-800 pl-10 text-white placeholder-gray-400"
						/>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<Button variant="ghost" size="icon">
						<Settings className="h-4 w-4" />
					</Button>
					{session ? (
						<Avatar className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
							<AvatarImage src="/placeholder-user.jpg" />
							<AvatarFallback>JD</AvatarFallback>
						</Avatar>
					) : (
						<SignInButton />
					)}
				</div>
			</div>
		</header>
	);
}
