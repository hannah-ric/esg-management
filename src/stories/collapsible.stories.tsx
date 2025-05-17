// [build] library: 'shadcn'
import { ChevronsUpDown } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Button } from "../components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";

const meta: Meta<typeof Collapsible> = {
  title: "Components/Collapsible",
  component: Collapsible,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

interface CollapsibleStoryArgs {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Default: StoryObj<CollapsibleStoryArgs> = {
  render: (args) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
      <Collapsible
        {...args}
        open={isOpen}
        onOpenChange={setIsOpen}
        className={`w-[350px] space-y-2 ${args.className || ''}`}
      >
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">
            @peduarte starred 3 repositories
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border border-slate-200 px-4 py-3 font-mono text-sm dark:border-slate-700">
          @radix-ui/primitives
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border border-slate-200 px-4 py-3 font-mono text-sm dark:border-slate-700">
            @radix-ui/colors
          </div>
          <div className="rounded-md border border-slate-200 px-4 py-3 font-mono text-sm dark:border-slate-700">
            @stitches/react
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
  args: {
    // defaultOpen: false,
  },
};
