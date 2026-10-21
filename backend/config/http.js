const HttpCodes = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
};

class HttpError {
	constructor(statusCode, message, stack) {
		this.statusCode = statusCode;
		this.message = message;
		this.stack = stack ?? new Error().stack;
	}
}

const getToken = (req) => {
	const authHeader = req.headers["authorization"];
	if (authHeader?.startsWith("Bearer ")) {
	  return authHeader.slice(7); // Remove "Bearer " prefix
	}
	return null;
  };

const respond = (res, statusCode, message, data) => {
	res.status(statusCode).json({ message, data });
};

module.exports = {
	HttpCodes,
	HttpError,
	getToken,
	respond,
};
