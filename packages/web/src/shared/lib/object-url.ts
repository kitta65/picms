import { useEffect, useState } from "react";

export function useObjectUrl(file: File | null) {
	const [url, setUrl] = useState<string | null>(null);
	useEffect(() => {
		if (!file) {
			setUrl(null);
			return;
		}
		const url = URL.createObjectURL(file);
		setUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);
	return url;
}
