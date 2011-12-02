// requestsview.js
//
// presents a tabled list of requests


var requestsView = 
{
	couchdb: null,
    mainpage: null, 

    
    setUp: function()
    {
		utils.checkAndSetConsole();
		var dbname = document.location.href.split('/')[3];
        console.log("couchdb ref set: " + dbname);
        this.couchdb = $.couch.db(dbname);
        this.mainpage = this.couchdb.uri + "_design/OpsClipboard/index.html";
    }, // setUp()
    
    
    // main page building & display
    // build a table in the supplied HTML element
    requestsView: function(elemId)
    {
        console.log("requestsView - building the table");
        var table = document.createElement("table");
        table.id = "requestsviewtable";
        // entire table style
        table.style.border = "2px solid black";
        table.style.textAlign = "center";
        table.cellPadding = "5px";
        table.rules = "cols"; // "all";
        var header = table.createTHead();
        // 0 - state, 1 - updated, 2 - request id (OpsClipboard link)
        var hRow = header.insertRow(0);
        hRow.style.fontWeight = "bold";
        hRow.style.backgroundColor = "#DDDDDD";
        hRow.insertCell(0).innerHTML = "OpsClipboard State";
        hRow.insertCell(1).innerHTML = "Last Updated";
        hRow.insertCell(2).innerHTML = "Request ID";
        document.getElementById(elemId).appendChild(table);
        
        utils.addPageLink(requestsView.mainpage, "Main Page");
    }, // requestsView()
    
    
    addTableRow: function(reqId, state, docId, lastUpdated, rowColor)
    {
    	console.log("adding:" + state + "  " + lastUpdated + "  " + reqId + "  " + docId);
    	var updatedDateTime = new Date(parseInt(lastUpdated)).toLocaleString();
        var clipLink = "<a href=\"" + requestsView.couchdb.uri ;
        clipLink += "_design/OpsClipboard/_show/request/" + docId + "\">" + reqId + "</a>";
    	table = document.getElementById("requestsviewtable");
    	var row = table.insertRow(-1);
    	row.style.backgroundColor = rowColor;
    	row.insertCell(0).innerHTML = state;
    	row.insertCell(1).innerHTML = updatedDateTime; 
    	row.insertCell(2).innerHTML = clipLink; 
    }, // addTableRow()
    
    
    // load view from couch and populate page
    requestsViewUpdate: function()
    {
    	console.log("querying couchapp view 'request' ...");
        this.couchdb.view("OpsClipboard/request",
        {
        	success: function(data)
        	{
        		for (i in data.rows) 
        		{
        			var reqId = data.rows[i].key[0];
                    var docId = data.rows[i].value['doc_id'];
                    var state = data.rows[i].value['state'];
                    var updated = data.rows[i].value['updated'];
                    // alternate colours in table rows
                    var rowColor = i % 2 === 0 ? "#FAFAFA" : "#E3E3E3";  
                    requestsView.addTableRow(reqId, state, docId, updated, rowColor);
                  }
              }
        });
    } // requestsViewUpdate()
    
} // requestsView