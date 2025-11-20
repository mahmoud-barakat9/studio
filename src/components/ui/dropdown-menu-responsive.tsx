
"use client"

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
  DropdownMenuShortcut,
} from "./dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

type DropdownMenuProps = React.ComponentProps<typeof DropdownMenu>;

const ResponsiveDropdownMenu = ({ children, ...props }: DropdownMenuProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return <DropdownMenu {...props}>{children}</DropdownMenu>;
  }

  return <Sheet {...props}>{children}</Sheet>;
};

const ResponsiveDropdownMenuTrigger = ({
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <DropdownMenuTrigger {...props}>{children}</DropdownMenuTrigger>
    );
  }

  return <SheetTrigger {...props}>{children}</SheetTrigger>;
};

const ResponsiveDropdownMenuContent = ({
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <DropdownMenuContent {...props}>{children}</DropdownMenuContent>
    );
  }

  return (
    <SheetContent side="bottom" {...props}>
      {children}
    </SheetContent>
  );
};

export {
  ResponsiveDropdownMenu as DropdownMenu,
  ResponsiveDropdownMenuTrigger as DropdownMenuTrigger,
  ResponsiveDropdownMenuContent as DropdownMenuContent,
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
};
