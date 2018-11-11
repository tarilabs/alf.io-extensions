/**
 * 
 * 
 */
function getScriptMetadata() {
    return {
        id: 'fattureincloud', //
        displayName: 'fattureincloud.it integration',
        version: 1, //
        async: false,
        events: [
            'INVOICE_GENERATION' //, //fired on invoice generation. Returns the invoice model.
        ],
        parameters: {
            fields: [
              {name:'api_uid',description:'The fattureincloud API uid',type:'TEXT',required:true},
              {name:'api_key',description:'The fattureincloud API key',type:'TEXT',required:true}
            ],
            configurationLevels: ['ORGANIZATION', 'EVENT']
        }
    };
}

/**
 * Executes the extension.
 * @param scriptEvent
 * @returns Object
 */
function executeScript(scriptEvent) {
    log.warn('hello from script with event: ' + scriptEvent);
    log.warn('extension parameters are: ' + extensionParameters);
    var postResult = simpleHttpClient.get('https://csrng.net/csrng/csrng.php?min=0&max=100').getJsonBody()[0].random;
    log.warn('the first request generated: ' + postResult);
    return {
        invoiceNumber: 123
    };
}

function creaFattura(scriptEvent) {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; // January is 0!
	var yyyy = today.getFullYear();
	if(dd<10) {
	    dd = '0'+dd;
	} 

	if(mm<10) {
	    mm = '0'+mm;
	} 
	today = mm + '/' + dd + '/' + yyyy;

	var payload = new HashMap();
    payload.put("numero", "xyz");
    payload.put("api_uid", extensionParameters.api_uid);
    payload.put("api_key", extensionParameters.api_key);
    payload.put("nome", customerName);
    payload.put("indirizzo_extra", billingAddress);
    payload.put("cf", vatNr);
    payload.put("autocompila_anagrafica", false);
    payload.put("salva_anagrafica", false);
    payload.put("data", today);
    var lista_articoli = new HashMap();
    lista_articoli.put("nome", 'Biglietto Alf.io '+reservationId );
    lista_articoli.put("quantita", 1);
    lista_articoli.put("prezzo_lordo", reservationCost.priceWithVAT);
    lista_articoli.put("cod_iva", 0);
    payload.put("lista_articoli", [ lista_articoli ]);
    var lista_pagamenti = new HashMap(); 
    lista_pagamenti.put("data_scadenza", today );
    lista_pagamenti.put("importo", "auto");
    lista_pagamenti.put("metodo", "not");
    lista_pagamenti.put("data_saldo", today); 
    payload.put("lista_pagamenti", [ lista_pagamenti ]);
    try {
      var response = simpleHttpClient.post('https://api.fattureincloud.it:443/v1/fatture/nuovo', {'X-Alfio': 'Alfio'}, payload);
      if(!response.isSuccessful()) {
        var body = response.body;
        log.warn("Problema {}", response);
      }
    } catch(e) {
      log.warn("problem creaFattura ", e);
      extensionLogger.logWarning("problem creaFattura " + e);
    }
}

/*
function send(eventId, address, apiKey, email, name, language, eventShortName) {
  var content = new HashMap();
  content.put("email_address", email);
  content.put("status", "subscribed");
  var mergeFields = new HashMap();
  mergeFields.put("FNAME", name.isHasFirstAndLastName() ? name.getFirstName() : name.getFullName());
  mergeFields.put(ALFIO_EVENT_KEY, eventShortName);
  content.put("merge_fields", mergeFields);
  content.put("language", language);
  try {
    var response = simpleHttpClient.put(address, {'Authorization': simpleHttpClient.basicCredentials('alfio', apiKey)}, content);
    if(response.isSuccessful()) {
      extensionLogger.logSuccess(ExtensionUtils.format("user %s has been subscribed to list", email));
      return;
    }
    var body = response.body;
    if(body == null) {
      return;
    }

    if (response.code != 400 || body.contains("\"errors\"")) {
      extensionLogger.logError(ExtensionUtils.format(FAILURE_MSG, email, name, language, body));
    } else {
      extensionLogger.logWarning(ExtensionUtils.format(FAILURE_MSG, email, name, language, body));
    }
  } catch(e) {
    extensionLogger.logError(ExtensionUtils.format(FAILURE_MSG, email, name, language, e.getMessage ? e.getMessage() : e));
  }
}
*/