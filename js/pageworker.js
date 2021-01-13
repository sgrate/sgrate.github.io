/*
 * pageworker.js - handles DOM manipulation and dynamic population of elements.
 */



$(document).ready(function() {

	//LOGIN HANDLING
	firebase.auth().onAuthStateChanged(async function(user) {
	    if (user) {
	    	console.log("user logged in");
	      	if (!user.emailVerified) {
	        	//TODO: If user logs in without emailVerification, get a log
	        	await firebase.auth().signOut().then(function() {
	           		console.log("logged out");
		      	}).catch(function(error) {
		        	// An error happened.
		      	});
		      	return;
	   		}
	   		//USER VALID & LOGGED IN

	   		curUserId = user.uid;
	   		//automatically load the current project
	   		db.collection("userdata").doc(curUserId).get().then((doc) => {
	   			let data = doc.data();
	   			curProject = data.lastCustomerId;
	   			curProjectName = data.lastCustomerName;
	   			curProjectTags = data.lastCustomerTags;
	   			//USER'S MOST RECENT CUSTOMER EXISTED PREVIOUSLY, BUT MAY HAVE BEEN DELETED:
				db.collection("projects").doc(curProject).get().then((doc) => {
					console.log(doc.data())
					if (doc.data() != undefined) {
						loadProject(curProject, curProjectName, curProjectTags);
			    		$("#loginApplet").fadeOut();
						$("#trackerApplet").fadeIn();
						$("#blueLogo").fadeIn();
					    $("#signOutBtn").hide();
					    $("#loadingSpinner").hide();
					    $("#signOutBtn").show();
					}
				    else {
				    	$("#curProjectTitle").html("No customer selected!");
				    	$("#manageClientBtn").hide();
				    	initProjectsModal();
						$("#loginApplet").fadeOut();
						$("#trackerApplet").fadeIn();
						$("#blueLogo").fadeIn();
					    $("#signOutBtn").hide();
					    $("#loadingSpinner").hide();
					    $("#signOutBtn").show();
				    }
				}).catch(() => {
					//PROMPT USER TO SELECT NEW
				});

	   			
	   		}).catch(() => {
	   			console.log("idk man", curUserId)
	   			loadProject(undefined);
	   			$("#loginApplet").fadeOut();
				$("#trackerApplet").fadeIn();
				$("#blueLogo").fadeIn();
			    $("#signOutBtn").hide();
			    $("#loadingSpinner").hide();
			    $("#signOutBtn").show();
			   
	   		});
	   		
	   		

		} else {
			console.log("logged out");	
			$("#trackerApplet").fadeOut();
			$("#loginApplet").fadeIn();
			$("#blueLogo").fadeOut();
		    $("#signOutBtn").hide();
		    $("#loginApplet").fadeIn();
		    $("#signInSpinner").hide();

		}	
		document.getElementById("signInBtn").disabled = false;
	}
	);


	let today = new Date();
	let result = `${today.getUTCMonth() + 1}/${today.getUTCDate()}/${today.getFullYear()}`;
	datepicker.value = (`${today.getUTCMonth() + 1}/${today.getUTCDate()}/${today.getFullYear()}`);
});

//Add a function for

$('#newDataModal').on('hidden.bs.modal', function () {
    console.log("hidden");
    getAllRateData(curProject);
})
$('#categoryDataModal').on('hidden.bs.modal', function () {
    console.log("hidden");
    getAllRateData(curProject);
})


//Add a span to output display with title of the tag; return its DOM element
function appendTagSpan(tagName) {
	let outputContainer = document.getElementById("outputContainer");
	var displayWrapper = document.createElement("div");
	$(displayWrapper).addClass("col");
	$(displayWrapper).attr("id", `${$(outputContainer).children(".data-wrapper").length}-data`);
	$(displayWrapper).addClass("data-wrapper")
	
	//Add TagName
	var categoryHeader = document.createElement("h5");
	categoryHeader.innerHTML = tagName;         
	displayWrapper.appendChild(categoryHeader);
	
	//Add View Data btn
	var viewDataBtn = document.createElement("button");
	var viewDataBtnWrap = document.createElement("div");
	$(viewDataBtn).attr("type", "button");
	$(viewDataBtnWrap).css("text-align", "center");

	$(viewDataBtn).html(`View/Manage ${tagName} Data`);
	$(viewDataBtn).addClass("btn");
	$(viewDataBtn).addClass("btn-primary");
	$(viewDataBtn).addClass("pretty-btn");
	$(viewDataBtn).css("margin", "auto");
	$(viewDataBtn).css("margin-top", ".5vw");
	$(viewDataBtn).css("margin-bottom", ".5vw");
	viewDataBtn.addEventListener("click", function() {
		//open the data modal
		initDataModal(tagName);
	});


	viewDataBtnWrap.appendChild(viewDataBtn); 
	displayWrapper.appendChild(viewDataBtnWrap); 

	//Add data summary Section
	var summarySection = document.createElement("div");
	$(summarySection).attr("id", `${$(outputContainer).children(".data-wrapper").length}-summary`);
	$(summarySection).css("text-align", "center");
	displayWrapper.appendChild(summarySection);
	

                          
	outputContainer.appendChild(displayWrapper);

	console.log(displayWrapper);
	return displayWrapper;
}

function initTagDisplay() {
	var result = "";
	//append a data container for each of the tags
	curProjectTags.forEach(function(tag) {
    	appendTagSpan(tag);		
 	});

}


/*
 * initDataModal() - Initialize a data modal for the selected project data.
 */
function initDataModal(tag) {
	$("#viewDataDisplayBody").html("");
	if (!curProjectTags.includes(tag)) {
		alert("An error occurred finding the data for this project.");
		return;
	}

	var queryResult = "";
	let query;
	//CASE 0: NO FILTER
	if (!isFiltered) {
		console.log("case 0")
		query = db.collection("rates");
	}
	else {
		//CASE 1: START AND END FILTER
		if (startDate != "" && endDate != "") {
			console.log("case 1", startDate, endDate)
			query = db.collection("rates").where("date", ">=", startDate).where("date", "<=", endDate);
		}
		//CASE 2: START ONLY FILTER
		else if (startDate != "" && endDate == "") {
			console.log("case 2", startDate)
			query = db.collection("rates").where("date", ">=", startDate);
		}
		//CASE 3: END ONLY FILTER
		else if (startDate == "" && endDate != "") {
			console.log("case 3", endDate)
			query = db.collection("rates").where("date", "<=", endDate);
		}
		else {
			console.log("case default")
			query = db.collection("rates");
		}
	}
	query.where("tag", "==", tag)
						  .where("projectId", "==", curProject).orderBy("date")
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            let data = doc.data();
            let rate = (data.hoursSpent * 22 / data.amountProduced).toFixed(2);
            let shift = (data.shift == "first") ? "1st Shift" : "2nd Shift";
            let date = firestoreDateToUSDate(data.date);
            if (date == undefined) {
            	return; //MALFORMED DATA, SKIP ENTRY
            }
	    	let newEntry = `${date}, ${shift}: ${rate} (${data.amountProduced} over ${data.hoursSpent} hours)<br>`;
	    	console.log(newEntry);
	    	queryResult += newEntry;
	    	addModalDataEntry(newEntry, doc.id);
        });
        if (queryResult === "") 
			$("#viewDataDisplayBody").html("No data found for this project.");


		$("#viewDataTitle").html(`${tag} Data`);
		
		$("#categoryDataModal").modal('show');
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
	
}

/*
 *	Converts date field to US locality for readiblity.
 */

function firestoreDateToUSDate(dateStr) {
	let components = dateStr.split("/");
	if (components.length != 3) {
		return undefined;
	}
	var month = components[1];
	if (month.length == 1) {
		month = "0" + month;
	}
	var date = components[2];
	if (date.length == 1) {
		date = "0" + date;
	}
	return `${month}/${date}/${components[0]}`;
}


/*
 *	addModalDataEntry(data, documentId) - helper function for initDataModal which returns a DOM element containing the data entry
 *					 as well as a manager button for it to be deleted.
 */
 function addModalDataEntry(data, documentId) {
 	let displayArea = document.getElementById("viewDataDisplayBody");
 	//create data line item
 	var newDataEntry = document.createElement("div");
 	$(newDataEntry).addClass("data-entry");
 	

 	//create span to hold the data
 	var dataSpan = document.createElement("span");
 	dataSpan.innerHTML = data;
 	$(dataSpan).css("display", "inline-block");
 	$(dataSpan).css("width", "90%");
 	$(dataSpan).addClass("data-content");
 	newDataEntry.appendChild(dataSpan);

 	//create manage button
 	var btnSpan = document.createElement("span");
 	$(btnSpan).css("display", "inline-block");
 	var manageBtn = document.createElement("button");
 	//$(manageBtn).attr("src", ELLIPSIS_SRC);
 	$(manageBtn).addClass("manage-entry-btn btn");
 	$(manageBtn).attr("id", `manage-${documentId}`);
 	$(manageBtn).attr("type", "button");
 	manageBtn.addEventListener("click", function() {
		//attempt to delete the entry
		deleteEntry(documentId, newDataEntry);
	});

 	btnSpan.appendChild(manageBtn);
 	newDataEntry.appendChild(btnSpan);

 	
 	displayArea.appendChild(newDataEntry);
 }

    /////////////////////////////////////////////////
   ////////////  -PROJECT HANDLING-  ///////////////
  /////////////////////////////////////////////////



 function addCategoryListEntry(category, manageClient) {
 	let displayArea;
 	if (manageClient == true) {
		displayArea = document.getElementById("manageClientProjectList");
 	}
 	else {
 		displayArea = document.getElementById("newProjectCategoryList");
 	}
 	//create data line item
 	var entry = document.createElement("div");
 	$(entry).addClass("data-entry");
 	

 	//create span to hold the data
 	var dataSpan = document.createElement("span");
 	dataSpan.innerHTML = category;
 	$(dataSpan).css("display", "inline-block");
 	$(dataSpan).css("width", "90%");
 	$(dataSpan).addClass("category-name");
 	entry.appendChild(dataSpan);

 	//create manage button
 	var btnSpan = document.createElement("span");
 	$(btnSpan).css("display", "inline-block");
 	var manageBtn = document.createElement("button");
 	//$(manageBtn).attr("src", ELLIPSIS_SRC);
 	$(manageBtn).addClass("manage-entry-btn btn");
 	$(manageBtn).attr("type", "button");
 	if (manageClient == true) {
	 	manageBtn.addEventListener("click", function(event) {
			if (confirm("Are you sure you would like to remove this project? All its rate data will be removed.")) {
		 		displayArea.removeChild(entry);
		 		if (!displayArea.firstChild) {
		 			displayArea.innerHTML = "No projects yet. Add one below."
		 		}
		 		event.preventDefault();
		 		removedClients.push(category);
		 		return true;
	 		}
	 		else {
	 			return false;
	 		}

		});
	} else {
	 	manageBtn.addEventListener("click", function() {

	 		displayArea.removeChild(entry);
	 		if (!displayArea.firstChild) {
	 			displayArea.innerHTML = "No projects yet. Add one below."
	 		}
		});
	}
 	btnSpan.appendChild(manageBtn);
 	entry.appendChild(btnSpan);

 	displayArea.appendChild(entry);
 }







/*
 * initProjectsModal() - initializes the project select modal with the available projects
 */
function initProjectsModal() {
	$("#selectProjectDisplayBody").html("");
	db.collection("projects")
	.where("creator", "==", curUserId)
	.get().then(function(querySnapshot) {
		querySnapshot.forEach(function(doc) {
			if (doc.id == curProject)
				return;
            // doc.data() is never undefined for query doc snapshots
            let data = doc.data();
    		let name = data.name;

    		var projectEntry = document.createElement("div");
    		projectEntry.innerHTML = name;
    		projectEntry.classList.add("project-entry");
    		projectEntry.addEventListener("click", function() {
    			if (confirm(`Would you like to load projects for customer ${data.name}?`)) 
    				loadProject(doc.id, data.name, data.tags);
    		});

    		let projectsContainer = document.getElementById("selectProjectDisplayBody");
    		projectsContainer.appendChild(projectEntry);
	    	console.log(data);
        });
        if ($("#selectProjectDisplayBody").html() == "") {

        	$("#selectProjectDisplayBody").html("No other customers found. You may create a new customer using the 'New Customer' button.")
        }
	}).catch(function(error) {
		console.log("Error getting documents: ", error);
	});


	$("#projectSelectModal").modal("show");
}
/*
 * loadProject(project) - loads the specifed project with its categories/tags and datapoints
 */
function loadProject(projectId, projectName, categories) {
	

	//Clean up current project DOM.
	$("#outputContainer").html("");
	//Init all categories.
	if (projectId == undefined) {
		//user has no projects; load the generic container
		$("#curProjectTitle").html("Welcome to SGI RateTrack!");
		$("#manageClientBtn").hide();
		$("#chooseProjBtn").html("Create Customer");
		$("#outputContainer").html("Rate Data is collected under Customers, which can have any number of projects associated with them. " + 
								   "To create your first customer project, click the create button above.");
		return;
	}
	$("#manageClientBtn").show();
	$("#chooseProjBtn").html("Choose Customer");
	categories.forEach(function(cat) {
		if (cat == undefined) 
			return;
		appendTagSpan(cat);
	});


	//Add all the data.
	getAllRateData(projectId);
	curProject = projectId;
	curProjectName = projectName;
	curProjectTags = categories;
	$("#curProjectTitle").html(curProjectName);
	$("#projectSelectModal").modal("hide");
	db.collection("userdata").doc(curUserId).set({
		"lastCustomerId": projectId,
		"lastCustomerName": projectName,
		"lastCustomerTags": categories
	}, {merge: true}).then(() => {
		console.log("successfully did it");
		let height = $("#outputContainer").css("height");
		$('.data-wrapper').css("height", "55vh");
		let width = `${100 / curProjectTags.length}vw`;
 		$('.data-wrapper').css("width", width);
	});
}










