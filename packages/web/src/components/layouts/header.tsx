import { BookOpen } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTE } from "@/lib/constants";
import logo from "@/logo.svg";

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
							<a href="https://example.com">
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
