
"use client"

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu as DropdownMenuDesktop,
  DropdownMenuContent as DropdownMenuContentDesktop,
  DropdownMenuTrigger as DropdownMenuTriggerDesktop,
} from "./dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./sheet";
export {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuCheckboxItem,
    DropdownMenuShortcut,
    SheetHeader as DropdownMenuHeader,
    SheetTitle as DropdownMenuTitle,
} from "./dropdown-menu-responsive-items";

type DropdownMenuProps = React.ComponentProps<typeof DropdownMenuDesktop> & {
    children: React.ReactNode;
};

const DropdownMenu = ({ children, ...props }: DropdownMenuProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = React.useState(false);

  // We can't conditionally render the trigger and content as it violates rules of hooks
  // and also we need to pass the trigger and content to the correct parent component.
  const trigger = React.Children.toArray(children).find(
    (child) => (child as React.ReactElement).type === DropdownMenuTrigger
  );
  const content = React.Children.toArray(children).find(
    (child) => (child as React.ReactElement).type === DropdownMenuContent
  );

  if (isDesktop) {
    return (
        <DropdownMenuDesktop open={open} onOpenChange={setOpen} {...props}>
            {children}
        </DropdownMenuDesktop>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger}
      {content}
    </Sheet>
  );
};

const DropdownMenuTrigger = (props: React.ComponentProps<typeof DropdownMenuTriggerDesktop>) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return <DropdownMenuTriggerDesktop {...props} />;
    }

    return <SheetTrigger {...props} />;
}

const DropdownMenuContent = (props: React.ComponentProps<typeof DropdownMenuContentDesktop>) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return <DropdownMenuContentDesktop {...props} />;
    }

    return <SheetContent side="bottom" {...props} />;
}

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
}
