import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";

export default function DevTools() {
	return <TanStackDevtools plugins={[formDevtoolsPlugin()]} />;
}
