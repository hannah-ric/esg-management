// [build] library: 'shadcn'
// import { Loader2, Mail } from "lucide-react"; // Unused
import type { Meta, StoryObj } from "@storybook/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronRightIcon, EnvelopeOpenIcon, ReloadIcon } from "@radix-ui/react-icons";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    asChild: { control: "boolean" },
  },
};

export default meta;

// Define a simple type for story args
interface ButtonStoryArgs {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  // Add other Button props if used
}

export const Default: StoryObj<ButtonStoryArgs> = {
  args: {
    variant: "default",
    children: "Button",
  },
};

export const Secondary: StoryObj<ButtonStoryArgs> = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Destructive: StoryObj<ButtonStoryArgs> = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
};

export const Outline: StoryObj<ButtonStoryArgs> = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const Ghost: StoryObj<ButtonStoryArgs> = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
};

export const Link: StoryObj<ButtonStoryArgs> = {
  args: {
    variant: "link",
    children: "Link",
  },
};

export const Icon: StoryObj<ButtonStoryArgs> = {
  args: {
    variant: "outline",
    size: "icon",
    children: <ChevronRightIcon className="h-4 w-4" />,
  },
};

export const WithIcon: StoryObj<ButtonStoryArgs> = {
  args: {
    children: (
      <>
        <EnvelopeOpenIcon className="mr-2 h-4 w-4" /> Login with Email
      </>
    ),
  },
};

export const Loading: StoryObj<ButtonStoryArgs> = {
  args: {
    disabled: true,
    children: (
      <>
        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
        Please wait
      </>
    ),
  },
};
