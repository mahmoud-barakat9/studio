
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

type ResponsiveMenuProps = React.ComponentProps<typeof DropdownMenuDesktop>;

const DropdownMenu = (props: ResponsiveMenuProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = React.useState(false);

  if (isDesktop) {
    return <DropdownMenuDesktop open={open} onOpenChange={setOpen} {...props} />;
  }

  return <Sheet open={open} onOpenChange={setOpen} {...props} />;
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
