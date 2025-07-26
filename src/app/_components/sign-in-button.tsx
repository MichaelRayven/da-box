import { LogInIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function SignInButton() {
	return (
		<Link href="api/auth/signin">
			<Button>
				<LogInIcon /> Sign In
			</Button>
		</Link>
	);
}
