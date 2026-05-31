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
import logo from "@/logo.svg";

export function Header() {
	return (
		<header className="w-full flex items-center justify-left">
			<a href="/">
				<img src={logo} alt="logo" className="mr-4 h-8" />
			</a>
			<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuLink
							className={navigationMenuTriggerStyle()}
							asChild
						>
							<Link to="/works"> works </Link>
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink className={navigationMenuTriggerStyle()}>
							Series
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink className={navigationMenuTriggerStyle()}>
							Settings
						</NavigationMenuLink>
					</NavigationMenuItem>
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
