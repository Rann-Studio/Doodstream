const axios = require('axios');
const { Unauthorized } = require('./Error');

/**
 * A class that provides utility methods for making HTTP requests
 * using Axios. It includes methods for sending GET and POST requests,
 * with handling for API key validation errors.
 *
 * @class Request
 */
class Request {
	/**
	 * Makes a GET request to the specified URL using Axios.
	 * If the response contains a specific error message related to the API key,
	 * an Unauthorized error is thrown.
	 *
	 * @static
	 * @async
	 * @param {string} url - The URL to send the GET request to.
	 * @returns {Promise<Object>} - The data returned from the GET request.
	 * @throws {Unauthorized} - If no API key is provided or if the API key is invalid.
	 */
	static async get(url) {
		const response = await axios.get(url);

		if (response.data && response.data.msg === 'No API key passed') {
			throw new Unauthorized('NO_API_KEY', 'No API key was provided');
		}

		if (response.data && response.data.msg === 'Invalid key') {
			throw new Unauthorized('INVALID_API_KEY', 'Invalid API key');
		}

		return response.data;
	}

	/**
	 * Makes a POST request to the specified URL using Axios.
	 * If the response contains a specific error message related to the API key,
	 * an Unauthorized error is thrown.
	 *
	 * @static
	 * @async
	 * @param {string} url - The URL to send the POST request to.
	 * @param {Object} [data={}] - The data to send in the body of the POST request (optional).
	 * @param {Object} [headers={}] - The headers to include with the POST request (optional).
	 * @returns {Promise<Object>} - The data returned from the POST request.
	 * @throws {Unauthorized} - If no API key is provided or if the API key is invalid.
	 */
	static async post(url, data = {}, headers = {}) {
		const response = await axios.post(url, data, {
			headers: {
				...headers,
			},
		});

		if (response.data && response.data.msg === 'No API key passed') {
			throw new Unauthorized('NO_API_KEY', 'No API key was provided');
		}

		if (response.data && response.data.msg === 'Invalid key') {
			throw new Unauthorized('INVALID_API_KEY', 'Invalid API key');
		}

		return response.data;
	}
}

module.exports = Request;
