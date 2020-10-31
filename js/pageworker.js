/*
 * pageworker.js - handles DOM manipulation and dynamic population of elements.
 */



$(document).ready(function() {
	let today = new Date();
	let result = `${today.getUTCMonth() + 1}/${today.getUTCDate()}/${today.getFullYear()}`;
	$("#datepicker").val(`${today.getUTCMonth() + 1}/${today.getUTCDate()}/${today.getFullYear()}`);
	initTagDisplay();
	$("#newDataModal").modal('show');
});

//Add a function for

$('#newDataModal').on('hidden.bs.modal', function () {
    // do something…
    console.log("hidden");
    getAllRateData();
})

//Add a span to output display with title of the tag; return its DOM element
function appendTagSpan(tagName) {
	let outputContainer = document.getElementById("outputContainer");
	var displaySpan = document.createElement("div");
	$(displaySpan).addClass("col");
	$(displaySpan).attr("id", `${tagName}-data`);
	$(displaySpan).css("border", "solid black");
	$(displaySpan).css("border-radius", "20px");
	$(displaySpan).css("height", "80%");
	$(displaySpan).css("margin", ".5vw");
	
	//Add TagName
	var textnode = document.createTextNode(tagName);         
	displaySpan.appendChild(textnode);
	
	//Add data summary Section
	var summarySection = document.createElement("div");
	$(summarySection).attr("id", `${tagName}-summary`);
	displaySpan.appendChild(summarySection);
	//Add View Data btn
	var viewDataBtn = document.createElement("button");
	$(viewDataBtn).html(`View/Manage ${tagName} Data`);
	$(viewDataBtn).addClass("btn");
	$(viewDataBtn).addClass("btn-primary");
	$(viewDataBtn).css("margin", "auto");
	$(viewDataBtn).css("margin-top", ".5vw");
	$(viewDataBtn).css("margin-bottom", ".5vw");

	viewDataBtn.addEventListener("click", function() {
		//open the data modal
		initDataModal(tagName);
	});

	displaySpan.appendChild(viewDataBtn);                           
	outputContainer.appendChild(displaySpan);

	console.log(displaySpan);
	return displaySpan;
}

function initTagDisplay() {
	var result = "";
	//append a data container for each of the tags
	$("#tagSelect option").each(function() {
    	appendTagSpan(this.value);		// or $(this).val()
 	});
}


/*
 * initDataModal() - Initialize a data modal for the selected project data.
 */
function initDataModal(tag) {
	if (!curProjectTags.includes(tag)) {
		alert("An error occurred finding the data for this category.");
		return;
	}

	var queryResult = "";
	db.collection("rates").where("tag", "==", tag)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            let data = doc.data();
            let rate = (data.hoursSpent * 22 / data.amountProduced).toFixed(2);
	    	let newEntry = `${data.date}: ${rate} (${data.amountProduced} over ${data.hoursSpent} hours)<br>`;
	    	console.log(newEntry);
	    	queryResult += newEntry;
        });
        if (queryResult === "") 
			queryResult = "No data found for this category.";


		$("#viewDataTitle").html(`${curProject}: ${tag} Data`);
		$("#viewDataDisplayBody").html(queryResult);
		$("#categoryDataModal").modal('show');
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
	
}

/*
 *	addModalDataEntry(data, documentId) - helper function for initDataModal which returns a DOM element containing the data entry
 *					 as well as a manager button for it to be deleted.
 */
 function addModalDataEntry(data, documentId) {

 }







