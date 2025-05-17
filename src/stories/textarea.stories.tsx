// [build] library: 'shadcn'
import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

interface TextareaStoryArgs {
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  label?: string;
  text?: string;
  buttonLabel?: string;
  className?: string;
  // Add other Textarea props if used
}

export const Default: StoryObj<TextareaStoryArgs> = {
  args: {
    placeholder: "Type your message here.",
  },
};

export const Disabled: StoryObj<TextareaStoryArgs> = {
  args: {
    placeholder: "Type your message here.",
    disabled: true,
  },
};

export const WithLabel: StoryObj<TextareaStoryArgs> = {
  args: {
    id: "message-label",
    label: "Your Message",
    placeholder: "Type your message here.",
  },
  render: (args) => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor={args.id}>{args.label}</Label>
      <Textarea placeholder={args.placeholder} id={args.id} />
    </div>
  ),
};

export const WithText: StoryObj<TextareaStoryArgs> = {
  args: {
    id: "message-text",
    label: "Your Message",
    text: "This will be a public comment.",
    placeholder: "Type your message here.",
  },
  render: (args) => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor={args.id}>{args.label}</Label>
      <Textarea placeholder={args.placeholder} id={args.id} />
      <p className="text-sm text-slate-500">{args.text}</p>
    </div>
  ),
};

export const WithButton: StoryObj<TextareaStoryArgs> = {
  args: {
    placeholder: "Type your message here.",
    buttonLabel: "Send message",
  },
  render: (args) => (
    <div className="grid w-full gap-2">
      <Textarea placeholder={args.placeholder} />
      <Button>{args.buttonLabel}</Button>
    </div>
  ),
};
