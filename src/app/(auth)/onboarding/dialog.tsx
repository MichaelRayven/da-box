import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { OnboardingForm } from "./form";

interface OnboardingDialogProps {
  defaultName?: string;
  defaultUsername?: string;
  defaultAvatar?: string;
}

export function OnboardingDialog({
  defaultName = "",
  defaultUsername = "",
  defaultAvatar,
}: OnboardingDialogProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-3xl">Setup your profile!</CardTitle>
        <CardDescription className="mt-2">
          Last step! Let's configure your profile name and username.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OnboardingForm
          defaultName={defaultName}
          defaultUsername={defaultUsername}
          defaultProfilePicture={defaultAvatar}
        />
      </CardContent>
    </Card>
  );
}
