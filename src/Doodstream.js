const fs = require('fs');
const FormData = require('form-data');
const Request = require('./Request');
const { NotFound, UnsupportedMediaType } = require('./Error');

/**
 * A class for interacting with the Doodstream API.
 * This class includes methods for performing actions related to account info,
 * file uploads, folder management, and other operations provided by the Doodstream API.
 *
 * @class Doodstream
 */
class Doodstream {
	/**
	 * Creates an instance of the Doodstream class with the provided API key.
	 * The API key will be used for authenticating requests to the Doodstream API.
	 *
	 * @constructor
	 * @param {string} apiKey - The API key to authenticate with the Doodstream API.
	 */
	constructor(apiKey) {
		this.baseUrl = 'https://doodapi.com/api';
		this.apiKey = apiKey;
	}

	/**
	 * Get basic information about the account associated with the provided API key.
	 *
	 * @async
	 * @returns {Promise<Object>} - A promise that resolves to the account information.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async accountInfo() {
		const params = new URLSearchParams({ key: this.apiKey });
		const url = `${this.baseUrl}/account/info?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Get reports of your account (default last 7 days).
	 *
	 * @async
	 * @param {Object} [options={}] - The options for retrieving the account reports.
	 * @param {number} [options.last] - The number of days of reports to retrieve (optional, default is last 7 days).
	 * @param {string} [options.fromDate] - The start date for the report in YYYY-MM-DD format (optional).
	 * @param {string} [options.toDate] - The end date for the report in YYYY-MM-DD format (optional).
	 * @returns {Promise<Object>} - A promise that resolves to the account report data.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async accountReports(options = {}) {
		const { last, fromDate, toDate } = options;
		const params = new URLSearchParams({ key: this.apiKey });

		if (last) {
			params.append('last', last);
		}
		if (fromDate) {
			params.append('from_date', fromDate);
		}
		if (toDate) {
			params.append('to_date', toDate);
		}

		const url = `${this.baseUrl}/account/stats?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Get a list of DMCA reported files (500 results per page).
	 *
	 * @async
	 * @param {Object} [options={}] - The options for retrieving the DMCA reported files list.
	 * @param {number} [options.perPage] - The number of results per page (optional, default is 500).
	 * @param {number} [options.page] - The page number for pagination (optional).
	 * @returns {Promise<Object>} - A promise that resolves to the DMCA reported files list.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async dmcaList(options = {}) {
		const { perPage, page } = options;
		const params = new URLSearchParams({ key: this.apiKey });

		if (perPage) {
			params.append('per_page', perPage);
		}
		if (page) {
			params.append('page', page);
		}

		const url = `${this.baseUrl}/dmca/list?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Get the URL for uploading local files.
	 *
	 * @async
	 * @returns {Promise<Object>} - A promise that resolves to the upload URL for local files.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async uploadUrl() {
		const params = new URLSearchParams({ key: this.apiKey });
		const url = `${this.baseUrl}/upload/server?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Upload local files to the server using the API.
	 *
	 * @async
	 * @param {string} filePath - The file path of the local file to upload.
	 * @returns {Promise<Object>} - A promise that resolves to the result of the file upload.
	 * @throws {NotFound} - If the file at the specified path is not found.
	 * @throws {UnsupportedMediaType} - If the provided path is not a valid file.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async localUpload(filePath) {
		const fileExists = fs.existsSync(filePath);
		if (!fileExists) {
			throw new NotFound('NOT_FOUND', `File not found: ${filePath}`);
		}

		const stat = fs.statSync(filePath);
		if (!stat.isFile()) {
			throw new UnsupportedMediaType('UNSUPPORTED_MEDIA_TYPE', `Provided path is not a file: ${filePath}`);
		}

		const uploadUrl = await this.uploadUrl();

		const params = new URLSearchParams({ key: this.apiKey });
		const url = `${uploadUrl.result}?${params.toString()}`;

		const formData = new FormData();
		formData.append('api_key', this.apiKey);
		formData.append('file', fs.createReadStream(filePath));

		return await Request.post(url, formData, {
			'Content-Type': 'multipart/form-data',
		});
	}

	/**
	 * Copy or clone your own or another user's file.
	 *
	 * @async
	 * @param {string} fileCode - The file code of the file to clone.
	 * @param {Object} [options={}] - Optional parameters for the cloning process.
	 * @param {string} [options.folderId] - The folder ID where the file will be copied to (optional).
	 * @returns {Promise<Object>} - A promise that resolves to the result of the clone operation.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async cloneVideo(fileCode, options = {}) {
		const { folderId } = options;
		const params = new URLSearchParams({ key: this.apiKey, file_code: fileCode });

		if (folderId) {
			params.append('fld_id', folderId);
		}

		const url = `${this.baseUrl}/file/clone?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Upload files using direct links.
	 *
	 * @async
	 * @param {string} url - The URL of the file to upload.
	 * @param {Object} [options={}] - Optional parameters for the upload.
	 * @param {string} [options.folderId] - The folder ID where the file will be uploaded to (optional).
	 * @param {string} [options.newTitle] - The new title to set for the uploaded file (optional).
	 * @returns {Promise<Object>} - A promise that resolves to the result of the upload operation.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async remoteAdd(url, options = {}) {
		const { folderId, newTitle } = options;
		const params = new URLSearchParams({ key: this.apiKey, url: url });

		if (folderId) {
			params.append('fld_id', folderId);
		}

		if (newTitle) {
			params.append('new_title', newTitle);
		}

		const _url = `${this.baseUrl}/upload/url?${params.toString()}`;
		return await Request.get(_url);
	}

	/**
	 * Get the list of remote uploads and their status.
	 *
	 * @async
	 * @returns {Promise<Object>} - A promise that resolves to the list of remote uploads and their status.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async remoteList() {
		const params = new URLSearchParams({ key: this.apiKey });
		const url = `${this.baseUrl}/urlupload/list?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Get the status of a remote upload.
	 *
	 * @async
	 * @param {string} fileCode - The file code of the file to check the status for.
	 * @returns {Promise<Object>} - A promise that resolves to the status of the remote upload.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async remoteStatus(fileCode) {
		const params = new URLSearchParams({ key: this.apiKey, file_code: fileCode });
		const url = `${this.baseUrl}/urlupload/status?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Get the total and used remote upload slots.
	 *
	 * @async
	 * @returns {Promise<Object>} - A promise that resolves to the total and used remote upload slots.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async remoteSlots() {
		const params = new URLSearchParams({ key: this.apiKey });
		const url = `${this.baseUrl}/urlupload/slots?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Perform various actions on remote uploads.
	 *
	 * @async
	 * @param {boolean} restartErrors - Whether to restart all errors (required).
	 * @param {Object} [options={}] - Optional parameters for performing actions.
	 * @param {boolean} [options.clearErrors] - Whether to clear all errors (optional).
	 * @param {boolean} [options.clearAll] - Whether to clear all (optional).
	 * @param {string} [options.deleteCode] - The file code to delete a transfer (optional).
	 * @returns {Promise<Object>} - A promise that resolves to the result of the remote upload action.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async remoteActions(restartErrors, options = {}) {
		const { clearErrors, clearAll, deleteCode } = options;
		const params = new URLSearchParams({ key: this.apiKey, restart_errors: restartErrors });

		if (clearErrors) {
			params.append('clear_errors', clearErrors);
		}

		if (clearAll) {
			params.append('clear_all', clearAll);
		}

		if (deleteCode) {
			params.append('delete_code', deleteCode);
		}

		const url = `${this.baseUrl}/upload/actions?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Create a new folder.
	 *
	 * @async
	 * @param {string} name - The name of the folder to create (required).
	 * @param {Object} [options={}] - Optional parameters for the folder creation.
	 * @param {string} [options.parentId] - The ID of the parent folder where the new folder will be created (optional).
	 * @returns {Promise<Object>} - A promise that resolves to the result of the folder creation.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async createFolder(name, options = {}) {
		const { parentId } = options;
		const params = new URLSearchParams({ key: this.apiKey, name: name });

		if (parentId) {
			params.append('parent_id', parentId);
		}

		const url = `${this.baseUrl}/folder/create?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Rename an existing folder.
	 *
	 * @async
	 * @param {string} folderId - The ID of the folder to rename (required).
	 * @param {string} name - The new name for the folder (required).
	 * @returns {Promise<Object>} - A promise that resolves to the result of the folder renaming operation.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async renameFolder(folderId, name) {
		const params = new URLSearchParams({ key: this.apiKey, fld_id: folderId, name: name });
		const url = `${this.baseUrl}/folder/rename?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * List all folders within a specified folder.
	 *
	 * @async
	 * @param {string} folderId - The ID of the folder whose contents (subfolders) will be listed (required).
	 * @param {Object} [options={}] - Optional parameters for listing the folders.
	 * @param {boolean} [options.onlyFolders] - Whether to list only folders (optional).
	 * @returns {Promise<Object>} - A promise that resolves to the list of folders.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async listFolder(folderId, options = {}) {
		const { onlyFolders } = options;
		const params = new URLSearchParams({ key: this.apiKey, fld_id: folderId });

		if (onlyFolders) {
			params.append('only_folders', onlyFolders ? 1 : 0);
		}

		const url = `${this.baseUrl}/folder/list?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * List all files with optional filters.
	 *
	 * @async
	 * @param {Object} [options={}] - Optional parameters for listing the files.
	 * @param {number} [options.page] - The page number for pagination (optional).
	 * @param {number} [options.perPage] - The maximum number of videos per page (maximum 200, optional).
	 * @param {string} [options.folderId] - The ID of the folder to list files from (optional).
	 * @param {string} [options.created] - Show files uploaded after a specified timestamp or within X minutes ago (optional).
	 * @returns {Promise<Object>} - A promise that resolves to the list of files.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async listFiles(options = {}) {
		const { page, perPage, folderId, created } = options;
		const params = new URLSearchParams({ key: this.apiKey });

		if (page) {
			params.append('page', page);
		}

		if (perPage) {
			params.append('per_page', perPage);
		}

		if (folderId) {
			params.append('fld_id', folderId);
		}

		if (created) {
			params.append('created', created);
		}

		const url = `${this.baseUrl}/file/list?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Check the status of a specific file.
	 *
	 * @async
	 * @param {string} fileCode - The file code of the file to check the status for (required).
	 * @returns {Promise<Object>} - A promise that resolves to the status of the file.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async fileStatus(fileCode) {
		const params = new URLSearchParams({ key: this.apiKey, file_code: fileCode });
		const url = `${this.baseUrl}/file/check?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Get detailed information about a specific file.
	 *
	 * @async
	 * @param {string} fileCode - The file code of the file to retrieve information for (required).
	 * @returns {Promise<Object>} - A promise that resolves to the file information.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async fileInfo(fileCode) {
		const params = new URLSearchParams({ key: this.apiKey, file_code: fileCode });
		const url = `${this.baseUrl}/file/info?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Get the splash, single, or thumbnail image of a specific file.
	 *
	 * @async
	 * @param {string} fileCode - The file code of the file to retrieve the image for (required).
	 * @returns {Promise<Object>} - A promise that resolves to the file's image data.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async fileImage(fileCode) {
		const params = new URLSearchParams({ key: this.apiKey, file_code: fileCode });
		const url = `${this.baseUrl}/file/image?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Rename a specific file.
	 *
	 * @async
	 * @param {string} fileCode - The file code of the file to rename (required).
	 * @param {string} title - The new name for the file (required).
	 * @returns {Promise<Object>} - A promise that resolves to the result of the file renaming operation.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async renameFile(fileCode, title) {
		const params = new URLSearchParams({ key: this.apiKey, file_code: fileCode, title: title });
		const url = `${this.baseUrl}/file/rename?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Move a file from one folder to another.
	 *
	 * @async
	 * @param {string} fileCode - The file code of the file to move (required).
	 * @param {string} folderId - The ID of the folder to move the file to (required). Use 0 to move to the root directory.
	 * @returns {Promise<Object>} - A promise that resolves to the result of the file move operation.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async moveFile(fileCode, folderId) {
		const params = new URLSearchParams({ key: this.apiKey, file_code: fileCode, fld_id: folderId });
		const url = `${this.baseUrl}/file/move?${params.toString()}`;
		return await Request.get(url);
	}

	/**
	 * Search for files using a specified search term.
	 *
	 * @async
	 * @param {string} searchTerm - The term to search for in the files (required).
	 * @returns {Promise<Object>} - A promise that resolves to the search results.
	 * @throws {Unauthorized} - If the API key is missing or invalid.
	 */
	async searchFile(searchTerm) {
		const params = new URLSearchParams({ key: this.apiKey, search_term: searchTerm });
		const url = `${this.baseUrl}/search/videos?${params.toString()}`;
		return await Request.get(url);
	}
}

module.exports = Doodstream;
