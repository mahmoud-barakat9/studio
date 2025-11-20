
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

type DropdownMenuProps = React.ComponentProps<typeof DropdownMenuDesktop>;

const DropdownMenu = ({ children, ...props }: DropdownMenuProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = React.useState(false);

  if (isDesktop) {
    return (
        <DropdownMenuDesktop open={open} onOpenChange={setOpen} {...props}>
            {children}
        </DropdownMenuDesktop>
    );
  }

  const trigger = React.Children.toArray(children).find(
    (child) => (child as React.ReactElement).type === DropdownMenuTrigger
  );
  const content = React.Children.toArray(children).find(
    (child) => (child as React.ReactElement).type === DropdownMenuContent
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="bottom">
        {content}
      </SheetContent>
    </Sheet>
  );
};

const DropdownMenuTrigger = DropdownMenuTriggerDesktop;
const DropdownMenuContent = DropdownMenuContentDesktop;


export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
}
