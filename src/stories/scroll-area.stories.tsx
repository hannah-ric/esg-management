// [build] library: 'shadcn'
import React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tag } from "@/components/ui/tag";

const meta = {
  title: "ui/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

export const Base = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border border-slate-100 dark:border-slate-700">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 50 })
            .map((_, i, a) => `v1.2.0-beta.${a.length - i}`)
            .map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
        </div>
      </div>
    </ScrollArea>
  ),
  args: {},
};
