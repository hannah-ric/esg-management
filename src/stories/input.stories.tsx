// [build] library: 'shadcn'
import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React from "react"; // For React.ReactNode

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

interface InputStoryArgs {
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  // For specific stories
  label?: string;
  buttonLabel?: string;
  text?: string;
  children?: React.ReactNode;
}

export const Default: StoryObj<InputStoryArgs> = {
  args: {
    type: "email",
    placeholder: "Email",
  },
};

export const File: StoryObj<InputStoryArgs> = {
  args: {
    id: "picture-file",
    type: "file",
  },
  render: (args) => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor={args.id}>Picture</Label>
      <Input {...args} />
    </div>
  ),
};

export const Disabled: StoryObj<InputStoryArgs> = {
  args: {
    type: "email",
    placeholder: "Email",
    disabled: true,
  },
};

export const WithLabel: StoryObj<InputStoryArgs> = {
  args: {
    type: "email",
    id: "email-label",
    placeholder: "Email",
    label: "Email",
  },
  render: (args) => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor={args.id}>{args.label}</Label>
      <Input type={args.type} id={args.id} placeholder={args.placeholder} />
    </div>
  ),
};

export const WithButton: StoryObj<InputStoryArgs> = {
  args: {
    type: "email",
    placeholder: "Email",
    buttonLabel: "Subscribe",
  },
  render: (args) => (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input type={args.type} placeholder={args.placeholder} />
      <Button type="submit">{args.buttonLabel}</Button>
    </div>
  ),
};

export const WithText: StoryObj<InputStoryArgs> = {
  args: {
    type: "email",
    id: "email-text",
    placeholder: "Email",
    label: "Your Email Address",
    text: "We will not share your email.",
  },
  render: (args) => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor={args.id}>{args.label}</Label>
      <Input type={args.type} id={args.id} placeholder={args.placeholder} />
      <p className="text-sm text-slate-500">{args.text}</p>
    </div>
  ),
};
