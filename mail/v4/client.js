exports.getClient = function(properties) {
	var native = null;
	if (properties) {
		native = new org.eclipse.dirigible.api.v3.mail.MailFacade.getInstance(toJavaProperties(properties));
	} else {
		native = new org.eclipse.dirigible.api.v3.mail.MailFacade.getInstance();
	}
	return new MailClient(native);
};

exports.send = function(from, recipients, subject, text, subType) {
	var mailClient = this.getClient();
	mailClient.send(from, recipients, subject, text, subType);
};

function MailClient(native) {
	this.native = native;

	this.send = function(from, recipients, subject, text, subType) {
		var to = [];
		var cc = [];
		var bcc = [];
		if(typeof recipients === "string") {
			to.push(recipients);
		} else if (typeof recipients === "object") {
			to = parseRecipients(recipients, "to");
			cc = parseRecipients(recipients, "cc");
			bcc = parseRecipients(recipients, "bcc");
		} else {
			var errorMessage = "Invalid 'recipients' format: " + JSON.stringify(recipients);
			console.error(errorMessage);
			throw new Error(errorMessage);
		}
		this.native.send(from, to, cc, bcc, subject, text, subType ? subType : "plain");
	};
}

function toJavaProperties(properties) {
	var javaProperties = new java.util.Properties();
	Object.keys(properties).forEach(function(e) {
		javaProperties.put(e, properties[e]);
	});
	return javaProperties;
}

function parseRecipients(recipients, type) {
	var objectType = typeof recipients[type];
	if (objectType === "string") {
		return [recipients[type]];
	} else if (Array.isArray(recipients[type])) {
		return recipients[type];
	} else if (objectType === "undefined") {
		return [];
	}
	var errorMessage = "Invalid 'recipients." + type + "' format: [" + recipients[type] + "|" + objectType + "]";
	console.error(errorMessage);
	throw new Error(errorMessage);
}