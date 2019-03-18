module.exports = function(status, data = false, message = false) {
	if(!message)
		switch(status) {
			case 500:
				message = 'Server not available'
			break;
			case 403:
				message = 'Forbidden'
			break;
			case 401:
				message = 'Unauthorized'
			break;
			case 400:
				message = 'Bad Request'
			break;
			case 200:
				message = 'Ok'
			break;
			default:
				message = false
			break;
		}
		
	return {
		status: status,
		message: message,
		data: data
	}
}