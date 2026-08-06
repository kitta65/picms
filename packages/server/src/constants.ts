// NOTE:
// don't import anything!
// constants should not depend on other implementation.

export const COMMON_API_BASE_PATH = "/api";
export const PRIVATE_API_BASE_PATH = `${COMMON_API_BASE_PATH}/private`;
export const PUBLIC_API_BASE_PATH = `${COMMON_API_BASE_PATH}/public`;
export const STORAGE_API_BASE_PATH = `${COMMON_API_BASE_PATH}/storage`;

export const ORPHAN_REVISION_TTL_MINUTES = 5;
export const SIGNED_URL_TTL_MINUTES = 5;

export const ERROR_CODE = {
	NOT_FOUND: "Client Error", // 404
	REQUEST_TIMEOUT: "Request Timeout", // 408
	CONFLICT: "Conflict", // 409

	INTERNAL_SERVER_ERROR: "Internal Server Error", // 500
	NOT_IMPLEMENTED: "Not Implemented", // 501
};
