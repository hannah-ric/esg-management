import type { Meta, StoryObj } from "@storybook/react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const meta: Meta<typeof ResizablePanelGroup> = {
  title: "Components/Resizable",
  component: ResizablePanelGroup,
  parameters: {
    layout: "centered", // Or 'fullscreen' depending on component
  },
  tags: ["autodocs"],
};

export default meta;

interface ResizableStoryArgs {
  direction: "horizontal" | "vertical";
  className?: string;
  // children is implicit
}

export const Default: StoryObj<ResizableStoryArgs> = {
  args: {
    direction: "horizontal",
    className: "max-w-md rounded-lg border",
  },
  render: (args) => (
    <ResizablePanelGroup {...args}>
      <ResizablePanel defaultSize={50}>Panel 1</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>Panel 2</ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Base: StoryObj<ResizableStoryArgs> = {
  render: (args) => (
    <ResizablePanelGroup
      {...args}
      direction="horizontal"
      className="max-w-md rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={25}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Two</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={75}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Three</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  args: {
    direction: "horizontal",
    className: "max-w-md rounded-lg border"
  },
};
