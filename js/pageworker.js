/*
 * pageworker.js - handles DOM manipulation and dynamic population of elements.
 */



$(document).ready(function() {

	//LOGIN HANDLING
	firebase.auth().onAuthStateChanged(async function(user) {
		console.log("go")
	    if (user) {
	    	console.log("logged in");
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
	   		console.log(curUserId)
    		$("#loginApplet").fadeOut();
			$("#trackerApplet").fadeIn();
		    $("#signOutBtn").hide();
		    $("#loadingSpinner").hide();
		    $("#signOutBtn").show();
		} else {
			$("#trackerApplet").fadeOut();
			$("#loginApplet").fadeIn();
		    $("#signOutBtn").hide();
		    $("#loginApplet").fadeIn();
		    $("#signInSpinner").hide();
		}	
		document.getElementById("signInBtn").disabled = false;
	}
	);


	let today = new Date();
	let result = `${today.getUTCMonth() + 1}/${today.getUTCDate()}/${today.getFullYear()}`;
	$("#datepicker").val(`${today.getUTCMonth() + 1}/${today.getUTCDate()}/${today.getFullYear()}`);
	loadProject(curProject, curProjectName, curProjectTags);
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
	var categoryHeader = document.createElement("h3");
	categoryHeader.innerHTML = tagName;         
	displayWrapper.appendChild(categoryHeader);
	
	//Add View Data btn
	var viewDataBtn = document.createElement("button");
	var viewDataBtnWrap = document.createElement("div");
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
		alert("An error occurred finding the data for this category.");
		return;
	}

	var queryResult = "";
	db.collection("rates").where("tag", "==", tag)
						  .where("projectId", "==", curProject)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            let data = doc.data();
            let rate = (data.hoursSpent * 22 / data.amountProduced).toFixed(2);
            let shift = (data.shift == "first") ? "1st" : "2nd";
	    	let newEntry = `${data.date}, ${shift}: ${rate} (${data.amountProduced} over ${data.hoursSpent} hours)<br>`;
	    	console.log(newEntry);
	    	queryResult += newEntry;
	    	addModalDataEntry(newEntry, doc.id);
        });
        if (queryResult === "") 
			$("#viewDataDisplayBody").html("No data found for this category.");


		$("#viewDataTitle").html(`${tag} Data`);
		
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



 function addCategoryListEntry(category) {
 	let displayArea = document.getElementById("newProjectCategoryList");
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
 	manageBtn.addEventListener("click", function() {
 		displayArea.removeChild(entry);
 		if (!displayArea.firstChild) {
 			displayArea.innerHTML = "No categories yet. Add one below."
 		}
	});

 	btnSpan.appendChild(manageBtn);
 	entry.appendChild(btnSpan);

 	displayArea.appendChild(entry);
 }







/*
 * initProjectsModal() - initializes the project select modal with the available projects
 */
function initProjectsModal() {
	$("#selectProjectDisplayBody").html("");
	db.collection("projects").where("creator", "==", curUserId).get().then(function(querySnapshot) {
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
    			if (confirm(`Would you like to load project ${data.name}?`)) 
    				loadProject(doc.id, data.name, data.tags);
    		});

    		let projectsContainer = document.getElementById("selectProjectDisplayBody");
    		projectsContainer.appendChild(projectEntry);
	    	console.log(data);
	    	console.log("not sure")
        });
        if ($("#selectProjectDisplayBody").html() == "") {
        	$("#selectProjectDisplayBody").html("No other projects found. You may start a new project using the 'New Project' button.")
        }
	}).catch(function(error) {
		console.log("Error getting documents: ", error);
	});


	$("#projectSelectModal").modal("show");
	console.log("ye")
	
}
/*
 * loadProject(project) - loads the specifed project with its categories/tags and datapoints
 */
function loadProject(projectId, projectName, categories) {
	
	//Clean up current project DOM.
	$("#outputContainer").html("");
	//Init all categories.
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
}










