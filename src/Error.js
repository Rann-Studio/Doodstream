/**
 * Custom error class that extends the built-in Error class.
 * Represents a general error for the Doodstream application.
 *
 * @class DoodstreamError
 * @extends Error
 * @param {string} code - The error code associated with the error.
 * @param {string} message - The error message describing the error.
 */
class DoodstreamError extends Error {
	constructor(code, message) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
	}
}

/**
 * Custom error class for unauthorized access, extends DoodstreamError.
 * Represents an error when the user is not authorized to perform a given action.
 *
 * @class Unauthorized
 * @extends DoodstreamError
 * @param {string} code - The error code associated with the unauthorized error.
 * @param {string} message - The error message describing the unauthorized access.
 */

class Unauthorized extends DoodstreamError {
	constructor(code, message) {
		super(code, message);
	}
}

/**
 * Custom error class for not found errors, extends DoodstreamError.
 * Represents an error when the requested resource cannot be found.
 *
 * @class NotFound
 * @extends DoodstreamError
 * @param {string} code - The error code associated with the not found error.
 * @param {string} message - The error message describing the missing resource.
 */

class NotFound extends DoodstreamError {
	constructor(code, message) {
		super(code, message);
	}
}

/**
 * Custom error class for unsupported media type errors, extends DoodstreamError.
 * Represents an error when the media type of the request is unsupported by the server.
 *
 * @class UnsupportedMediaType
 * @extends DoodstreamError
 * @param {string} code - The error code associated with the unsupported media type error.
 * @param {string} message - The error message describing the unsupported media type.
 */

class UnsupportedMediaType extends DoodstreamError {
	constructor(code, message) {
		super(code, message);
	}
}

module.exports = {
	Unauthorized,
	NotFound,
	UnsupportedMediaType,
};
