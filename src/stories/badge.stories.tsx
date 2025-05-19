// [build] library: 'shadcn'
import type { Meta, StoryObj } from "@storybook/react";
import { Badge, badgeVariants } from "@/components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
};

export default meta;

interface BadgeStoryArgs {
  variant?: "default" | "secondary" | "destructive" | "outline";
  children: React.ReactNode;
  className?: string;
}

export const Default: StoryObj<BadgeStoryArgs> = {
  args: {
    variant: "default",
    children: "Default Badge",
  },
};

export const Secondary: StoryObj<BadgeStoryArgs> = {
  args: {
    variant: "secondary",
    children: "Secondary Badge",
  },
};

export const Destructive: StoryObj<BadgeStoryArgs> = {
  args: {
    variant: "destructive",
    children: "Destructive Badge",
  },
};

export const Outline: StoryObj<BadgeStoryArgs> = {
  args: {
    variant: "outline",
    children: "Outline Badge",
  },
};
