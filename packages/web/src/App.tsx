import "./index.css";
import { Redirect, Route, Switch } from "wouter";
import { Home } from "@/components/routes/home";
import { Works } from "@/components/routes/works";
import { TooltipProvider } from "@/components/ui/tooltip";

export function App() {
	return (
		<TooltipProvider>
			<Switch>
				<Route path="/" component={Home} />
				<Route path="/works" component={Works} />

				{/* fallback */}
				<Redirect to="/" />
			</Switch>
		</TooltipProvider>
	);
}
