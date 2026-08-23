import { BookOpen } from "lucide-react";
import { Link } from "wouter";

import { ROUTE } from "@/shared/config";
import logo from "@/shared/ui/custom/logo/logo.svg";
import { Button } from "@/shared/ui/shadcn/button";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/shared/ui/shadcn/navigation-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/shadcn/tooltip";

const LINKS = [ROUTE.WORKS, ROUTE.SERIES, ROUTE.SETTINGS];

export function Header() {
	return (
		<header className="w-full flex items-center justify-left">
			<a href="/">
				<img src={logo} alt="logo" className="mr-4 h-8" />
			</a>
			<NavigationMenu>
				<NavigationMenuList>
					{LINKS.map((link) => (
						<NavigationMenuItem key={link.pattern}>
							<NavigationMenuLink
								className={navigationMenuTriggerStyle()}
								asChild
							>
								<Link to={link.pattern}> {link.label} </Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
					))}
				</NavigationMenuList>
			</NavigationMenu>
			<div className="ml-auto">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button asChild variant="outline" size="icon">
							<a
								href="https://example.com"
								target="_blank"
								rel="noopnner noreferrer"
							>
								<BookOpen />
							</a>
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Go to document</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</header>
	);
}
