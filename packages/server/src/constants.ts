// NOTE:
// don't import anything!
// constants should not depend on other implementation.

export const COMMON_API_BASE_PATH = "/api";
export const PRIVATE_API_BASE_PATH = `${COMMON_API_BASE_PATH}/private`;
export const PUBLIC_API_BASE_PATH = `${COMMON_API_BASE_PATH}/public`;
export const STORAGE_API_BASE_PATH = `${COMMON_API_BASE_PATH}/storage`;

export const ORPHAN_REVISION_TTL_MINUTES = 5;
export const SIGNED_URL_TTL_MINUTES = 5;

type ErrorCode = {
	status: number;
	message: string;
};
export const ERROR_CODE = {
	// 4xx
	BAD_REQUEST: { status: 400, message: "Bad Request" },
	UNAUTHORIZED: { status: 401, message: "Unauthorized" },
	FORBIDDEN: { status: 403, message: "Forbidden" },
	NOT_FOUND: { status: 404, message: "Client Error" },
	REQUEST_TIMEOUT: { status: 408, message: "Request Timeout" },
	CONFLICT: {
		status: 409,
		message: "Conflict",
	},

	// 5xx
	INTERNAL_SERVER_ERROR: { status: 500, message: "Internal Server Error" },
	NOT_IMPLEMENTED: { status: 501, message: "Not Implemented" },
} as const satisfies { [k: string]: ErrorCode };
