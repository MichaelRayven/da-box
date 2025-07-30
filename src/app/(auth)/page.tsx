import {
  ArrowRightIcon,
  CheckCircleIcon,
  CodeIcon,
  FileCheckIcon,
  FileTextIcon,
  HardDriveIcon,
  LockIcon,
  PlayIcon,
  Share2Icon,
  ShieldIcon,
  UploadIcon,
  UsersIcon,
  VideoIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-jakarta text-foreground">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-border border-b p-6">
        <div className="flex items-center space-x-8">
          <h1 className="font-dela text-primary text-xl">DaBOX</h1>
          <div className="hidden space-x-6 md:flex">
            <a
              href="#about"
              className="text-body-md text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </a>
            <a
              href="#features"
              className="text-body-md text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-body-md text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </a>
            <a
              href="#docs"
              className="text-body-md text-muted-foreground transition-colors hover:text-foreground"
            >
              Docs
            </a>
          </div>
        </div>
        <Link href="sign-in">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Get Started
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="mx-auto">
          <Badge variant="outline" className="mb-6 border-primary text-primary">
            Open Source • Privacy First
          </Badge>
          <h1 className="mb-8 w-full bg-gradient-to-tr from-45% from-primary to-white bg-clip-text text-center font-dela text-6xl text-transparent leading-tight">
            <span className="whitespace-nowrap">
              Share faster. Upload bigger.
            </span>
            <br />
            <span className="whitespace-nowrap">Stay in control.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-body-lg text-muted-foreground leading-relaxed">
            DaBOX delivers lightning-fast file uploads, secure sharing, and
            real-time streaming backed by open-source infrastructure and
            privacy-first design. Start free, scale as you grow.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/sign-in">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground shadow-glow hover:bg-primary/90"
              >
                Get Started (Free – 1 GB)
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/docs">
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Explore Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="container mx-auto px-6 py-20" id="about">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="group cursor-pointer border-border bg-gradient-secondary transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-glow">
            <CardHeader>
              <ZapIcon className="mb-4 h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              <CardTitle className="font-dela text-heading-sm">
                Build with Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-body-md text-muted-foreground">
                Whether you're a developer or small business, DaBOX gives you
                clear, trustable infrastructure—no lock-in, just transparency
                and control.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer border-border bg-gradient-secondary transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-glow">
            <CardHeader>
              <ShieldIcon className="mb-4 h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              <CardTitle className="font-dela text-heading-sm">
                Privacy You Can Trust
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-body-md text-muted-foreground">
                With authentication and authorization built-in, your files stay
                yours. Open‑source code means no surprises behind closed doors.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer border-border bg-gradient-secondary transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-glow">
            <CardHeader>
              <UploadIcon className="mb-4 h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              <CardTitle className="font-dela text-heading-sm">
                Perform at Scale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-body-md text-muted-foreground">
                Experience quick uploads of large files, and enjoy smooth video
                streaming directly from your server infrastructure—no
                third-party compression or throttling.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features at a Glance */}
      <section className="container mx-auto px-6 py-20" id="features">
        <h2 className="mb-12 text-center font-dela text-heading-lg">
          Features at a Glance
        </h2>
        <Carousel className="mx-auto w-full max-w-7xl">
          <CarouselContent className="-ml-2 md:-ml-4 px-4">
            {[
              {
                icon: FileTextIcon,
                title: "Unique Design",
                description: "Clean UI focused on simplicity and usability",
              },
              {
                icon: LockIcon,
                title: "Authentication & Access Control",
                description: "Your data secured by proven authorization layers",
              },
              {
                icon: CodeIcon,
                title: "Open Source",
                description: "Full transparency and community contributions",
              },
              {
                icon: FileCheckIcon,
                title: "File Management",
                description: "Folder and file organization made simple",
              },
              {
                icon: HardDriveIcon,
                title: "Large File Uploads",
                description:
                  "Supports uploads over 5 GB—no splitting or workarounds",
              },
              {
                icon: ZapIcon,
                title: "Quick Uploads",
                description:
                  "Speeds optimized to your S3 region—low latency, high throughput",
              },
              {
                icon: Share2Icon,
                title: "File Sharing",
                description:
                  "Share files and folders with fine‑grained permissions",
              },
              {
                icon: VideoIcon,
                title: "Streaming Video",
                description: "Watch video content directly without downloads",
              },
            ].map((feature) => (
              <CarouselItem
                key={feature.title}
                className="p-2 md:basis-1/2 md:p-4 lg:basis-1/3"
              >
                <Card className="group h-full cursor-pointer border-border bg-card transition-all duration-300 hover:scale-[1.02] hover:border-primary">
                  <CardHeader className="pb-3">
                    <feature.icon className="mb-2 h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                    <CardTitle className="font-dela text-body-lg">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-body-md">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="mb-12 text-center font-dela text-heading-lg">
          How It Works
        </h2>
        <div className="grid gap-6 md:grid-cols-5">
          {[
            {
              step: 1,
              title: "Sign Up Instantly",
              description: "Open-source, no credit card for free plan",
            },
            {
              step: 2,
              title: "Upload Your Files",
              description: "Drag‑and‑drop or click to upload large files",
            },
            {
              step: 3,
              title: "Organize & Share",
              description:
                "Structure folders, manage permissions, and share links",
            },
            {
              step: 4,
              title: "Stream Video",
              description: "Watch from browser or mobile without buffering",
            },
            {
              step: 5,
              title: "Upgrade Seamlessly",
              description: "Easy switch to Pro or Enterprise as you expand",
            },
          ].map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-dela text-heading-sm text-primary-foreground">
                {step.step}
              </div>
              <h3 className="mb-2 font-dela text-body-lg">{step.title}</h3>
              <p className="text-body-md text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans & Pricing */}
      <section className="container mx-auto px-6 py-20" id="pricing">
        <h2 className="mb-20 text-center font-dela text-heading-lg">
          Plans & Pricing
        </h2>
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          <Card className="hover:-translate-y-2 border-border bg-card transition-transform duration-300 ease-in-out hover:scale-[1.02]">
            <CardHeader>
              <CardTitle className="font-dela text-heading-md">Free</CardTitle>
              <CardDescription className="font-dela text-heading-lg text-primary">
                1 GB
              </CardDescription>
              <CardDescription className="text-body-md">
                forever
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-full flex-col justify-between">
              <p className="mb-6 text-body-md text-muted-foreground">
                Perfect for hobbyist use, testing, or personal backups.
              </p>
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground "
                >
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="-translate-y-4 hover:-translate-y-6 relative scale-[1.1] border-primary bg-gradient-secondary shadow-glow transition-transform duration-300 ease-in-out hover:scale-[1.12]">
            <Badge className="-top-3 -translate-x-1/2 absolute left-1/2 transform bg-primary text-primary-foreground">
              Popular
            </Badge>
            <CardHeader>
              <CardTitle className="font-dela text-3xl">Pro</CardTitle>
              <CardDescription className="font-dela text-heading-lg text-primary">
                50 GB
              </CardDescription>
              <CardDescription className="text-body-md">
                per month
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-full flex-col justify-between">
              <p className="mb-6 text-body-md text-muted-foreground">
                For creators, freelancers, or small teams who need room to grow.
              </p>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Choose Pro
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-2 border-border bg-card transition-transform duration-300 ease-in-out hover:scale-[1.02]">
            <CardHeader>
              <CardTitle className="font-dela text-heading-md">
                Enterprise
              </CardTitle>
              <CardDescription className="font-dela text-heading-lg text-primary">
                Pay as you go
              </CardDescription>
              <CardDescription className="text-body-md">
                usage-based
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-full flex-col justify-between">
              <p className="mb-6 text-body-md text-muted-foreground">
                Scale storage and bandwidth as needed—all usage tracked
                transparently.
              </p>
              <Button
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 space-y-4 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-body-md">
            <div className="flex items-center">
              <CheckCircleIcon className="mr-2 h-4 w-4 text-primary" />
              Unlimited users and team access
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="mr-2 h-4 w-4 text-primary" />
              No hidden fees—just usage-based billing for enterprise
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="mr-2 h-4 w-4 text-primary" />
              Upgrade or downgrade at any time
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Use Cases */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="mb-12 text-center font-dela text-heading-lg">
          Trusted Use Cases
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: UsersIcon,
              title: "Independent professionals storing business files",
            },
            {
              icon: Share2Icon,
              title: "Small teams sharing large media assets",
            },
            {
              icon: PlayIcon,
              title:
                "Video creators streaming directly from self‑hosted servers",
            },
            {
              icon: ShieldIcon,
              title: "Privacy‑focused users avoiding closed cloud platforms",
            },
          ].map((useCase, index) => (
            <Card
              key={useCase.title}
              className="border-border bg-card p-6 text-center"
            >
              <useCase.icon className="mx-auto mb-4 h-8 w-8 text-primary" />
              <p className="text-body-md">{useCase.title}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose DaBOX */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="mb-12 text-center font-dela text-heading-lg">
          Why Choose DaBOX?
        </h2>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            "Built for privacy and transparency",
            "Open source and community‑driven",
            "Designed to handle modern file workloads",
            "Scales gracefully from free personal use to enterprise needs",
          ].map((reason, index) => (
            <div key={reason} className="flex items-start">
              <CheckCircleIcon className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-primary" />
              <p className="text-body-md">{reason}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="mb-6 font-dela text-heading-lg">
          Ready to secure your files with privacy-first cloud storage?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-body-lg text-muted-foreground">
          Get your free 1 GB account now, or learn more in the documentation.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/sign-in">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground shadow-glow hover:bg-primary/90"
            >
              Get Started (Free)
            </Button>
          </Link>
          <Link href="/docs">
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Docs & API
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border border-t py-12">
        <div className="container mx-auto px-6">
          <div className="mb-8 text-center">
            <h3 className="mb-4 font-dela text-heading-sm text-primary">
              DaBOX
            </h3>
            <p className="text-body-md text-muted-foreground">
              © 2025 DaBOX. Michael Rayven — MIT Licensed
            </p>
          </div>
          <div className="flex justify-center space-x-6">
            <Link
              href="https://github.com/MichaelRayven/da-box"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Github
            </Link>
            <Link
              href="/docs"
              className="text-body-md text-muted-foreground transition-colors hover:text-primary"
            >
              Docs
            </Link>
            <Link
              href="/contact"
              className="text-body-md text-muted-foreground transition-colors hover:text-primary"
            >
              Contact
            </Link>
            <Link
              href="/legal/privacy-police"
              className="text-body-md text-muted-foreground transition-colors hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/legal/terms-of-service"
              className="text-body-md text-muted-foreground transition-colors hover:text-primary"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
