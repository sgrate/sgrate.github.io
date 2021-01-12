
$("#add-data-btn").on("click", async function() {
	let tag = $("#viewDataTitle").html().split(" Data")[0]; //extract tag from modal header
	let now = new Date();
	let date = convertToFirestoreDate($('#datepicker').val());
	console.log(date);
	var amountProduced = $("#amount").val();
	var hoursSpent = $("#hours").val();
	var shift = $("input[name='shift']:checked").val();
	console.log(shift)

	let numRegex = new RegExp('^([0-9]+(\.[0-9]+)?)$'); 
	var errs = "";
	if (!moment($("#datepicker").val(), 'MM/DD/YYYY',true).isValid()) {
		errs += "The selected date is invalid. Use the calendar icon to select a date.\n"
	}
	if (!numRegex.test(amountProduced) || amountProduced <= 0) {
		errs += "The quantity input for Amount Produced is invalid.\n"
	}
	if (!numRegex.test(hoursSpent) || hoursSpent <= 0) {
		errs += "The quantity input for Hours Spent is invalid.\n"
	}
	if (errs != "") {

		//invalid input
		alert("Your input has one or more issues:\n" + errs);
		return;
	}
	//add valid entry into firestore
	let dateObj = new Date(date);
	//let dateStr = convertToFirestoreDate(date);
	
	let newData;
	let projectId = curProject;
	if (tag != undefined) 
		newData = {date, amountProduced, hoursSpent, tag, projectId, shift};
	else
		newData = {date, amountProduced, hoursSpent, projectId, shift};
	console.log(`adding new data: ${newData}`);
	addFirestoreRateEntry(newData).then(function() {
		$("#newDataModal").modal("hide");
	}).catch(function() {
		alert("An error occurred.");
	})

	// if(addData(chart, $('#datepicker').val(), $("#amount").val())) {
	// 	$("#newDataModal").modal('hide');
	// 	$("#newDataForm")[0].reset();
	// }
		
	
});
//OPEN ADD DATA MODAL
$("#openmodalbtn").on("click", function() {
	$("#categoryDataModal").modal("hide");
	let today = new Date();

	var month = today.getUTCMonth() + 1;
		if (month < 10) 
			month = `0${month}`;
		
		var date = today.getUTCDate();
		if (date < 10) 
			date = `0${date}`;
		
	$("#datepicker").val(`${month}/${date}/${today.getFullYear()}`);
});


$("#chooseProjBtn").on("click", function() {
	initProjectsModal();
});


$("#createProjBtn").on("click", function() {
	$("#projectSelectModal").modal("hide");
	$("#newProjectCategoryList").empty();
	$("#newProjectName").val("");
	$("#newProjectCategoryName").val("");
	$("#newProjectCategoryList").html("No projects yet. Add one below.");
	$(this).prop("disabled", false);
	setTimeout(() => {$("#createProjectModal").modal("show");}, 100);
	//clear the project list
		
});

var removedClients = []; // array to hold functions 
//OPEN CLIENT MANAGER
$("#manageClientBtn").on("click", function() {
	$("#manageClientName").val(curProjectName);
	$("#manageClientNewProjectName").val("");
	$("#manageClientProjectList").empty();

		curProjectTags.forEach((tag) => {
			addCategoryListEntry(tag, true);
	})
	removedClients = []; // reset list of removed clients
});

//UPDATE CLIENT WITH CHANGES

$("#updateClientBtn").on("click", function() {
	var updatedName = false;
	var projRef = db.collection("projects").doc(curProject);


	//ADD PROJECT HANDLING

	let projectNames = $("#manageClientProjectList").children(".data-entry").children(".category-name");
	projectNames.each(function() {
		let name = $(this).html();
		console.log(name);
		if (!curProjectTags.includes(name)) {
			//tag is new; add it to the current project's entry
			projRef.update({
			    tags: firebase.firestore.FieldValue.arrayUnion(name)
			});
			curProjectTags.push(name);
			appendTagSpan(name);
		}
	});

	//DELETE PROJECTS HANDLING
	//clean up projects which have been removed
	removedClients.forEach(function(removedProject) {
		removeFirestoreProjectData(removedProject, curProject);
		const index = curProjectTags.indexOf(removedProject);
		if (index > -1) {
		  curProjectTags.splice(index, 1);
		}
	});

	$("#manageClientModal").modal("hide");
	loadProject(curProject, curProjectName, curProjectTags);
});

//add new project to existing client
$("#manageClientNewProjectBtn").on("click", () => {
	var isValid = true;
	if ($("#manageClientNewProjectName").val().length > 0) {
			let currentVal = $("#manageClientProjectList").html();
			if (currentVal == "No projects yet. Add one below.") {
				$("#manageClientProjectList").html("");
			}
			//check each data entry, get its category name, and ensure the new one is unique
			$("#manageClientProjectList").children(".data-entry").each(function() {
				console.log($("#manageClientProjectList").children(".data-entry"));
				let child = $(this);
				if (child.children(".category-name").html() == $("#manageClientNewProjectName").val()) {
					alert("Project already exists.");
					isValid = false;
				}
				else {
					console.log(child.children(".category-name").html(), $("#manageClientNewProjectName").val())
				}
			});
			if (isValid) {
				addCategoryListEntry($("#manageClientNewProjectName").val(), true);
				$("#manageClientNewProjectName").val("");
			}
			
	}
});


/*
 * Handles "Delete Customer" button in the manage customer modal
 */
$("#deleteCustomerBtn").on("click", () => {
	if (confirm("WARNING: This will delete the customer and ALL its projects under this name. Are you sure you wish to delete?")){
		if(confirm("WARNING: Are you ABSOLUTELY SURE? This will DELETE ALL DATA LOGGED UNDER THIS CUSTOMER'S PROJECTS.")) {
			removeAllFirestoreProjectsForCustomer(curProject, curProjectTags);	
		}

		
	}
});



//ADD NEW PROJECT IN CLIENT CREATION MODAL 
$("#addProjectCategoryModalBtn").on("click", function() {
	var isValid = true;
	if ($("#newProjectCategoryName").val().length > 0) {
			let currentVal = $("#newProjectCategoryList").html();
			if (currentVal == "No projects yet. Add one below.") {
				$("#newProjectCategoryList").html("");
			}
			$("#newProjectCategoryList").children(".data-entry").each(function() {
				console.log($("#newProjectCategoryList").children(".data-entry"));
				let child = $(this);
				if (child.children(".category-name").html() == $("#newProjectCategoryName").val()) {
					alert("Project already exists.");
					isValid = false;
				}
				else {
					console.log(child.children(".category-name").html(), $("#newProjectCategoryName").val())
				}
			});
			if (isValid) {
				addCategoryListEntry($("#newProjectCategoryName").val());
				$("#newProjectCategoryName").val("");
			}
			
	}

});


$("#submitProjBtn").on("click", async function() {
	let name = $("#newProjectName").val();
	if (name.length <= 0) {
		alert("Invalid name.");
		return;
	}
	
	var tags = [];
	$("#newProjectCategoryList").children(".data-entry").each(function() {
				console.log($("#newProjectCategoryList").children(".data-entry"));
				let child = $(this);
				tags.push(child.children(".category-name").html())
	});
	if (tags.length <= 0) {
		alert("No projects. You must have a least one to add a customer.")
		return;
	}
	// addFirestoreProjectEntry({name, tags}).then((ret) => {
	// 	console.log(ret);
	// })
	let creator = curUserId;
	$(this).prop("disabled", true);
	(addFirestoreProjectEntry({name, tags, creator}).then((ref) => {
		db.collection("projects").doc(ref.id).get().then((doc) => {
			console.log(doc)
			let data = doc.data();
			loadProject(doc.id, data.name, data.tags);
			$(this).prop("disabled", false);
			$("#createProjectModal").modal("hide");
		}).catch(() => {
			$(this).prop("disabled", false);
		})
		// loadProject(ref.id, data.name, data.tags);
	}).catch(()=> {
		$(this).prop("disabled", false);
	}))



});

/*
 * FILTERING MANAGEMENT
 */

$("#filterDataBtn").on("click", function() {
	let today = new Date();
	var month = today.getUTCMonth() + 1;
	if (month < 10) 
		month = `0${month}`;
	
	var date = today.getUTCDate();
	if (date < 10) 
		date = `0${date}`;
	
	var tmorDate = today.getUTCDate() + 1;
	if (tmorDate < 10)
		tmorDate = `0${tmorDate}`;
	if(isFiltered) {
		if (startDate != "") {
			$("#afterPicker").val(firestoreDateToUSDate(startDate));
			$("#afterFilterCheckbox").prop("checked", true);
			$("#afterFilterLabel").css("filter", "");
			$("#afterPicker").prop("disabled", false);
		} else {
			$("#afterFilterCheckbox").prop("checked", false);
			$("#afterFilterLabel").css("filter", "brightness(3)");
			$("#afterPicker").prop("disabled", true);
			$("#afterPicker").val(`${month}/${date}/${today.getFullYear()}`);
		}

		if (endDate != "") {
			$("#beforePicker").val(firestoreDateToUSDate(endDate));
			$("#beforeFilterCheckbox").prop("checked", true);
			$("#beforePicker").prop("disabled", false);
			$("#beforeFilterLabel").css("filter", "");
		} else {
			$("#beforeFilterCheckbox").prop("checked", false);
			$("#beforePicker").prop("disabled", true);
			$("#beforeFilterLabel").css("filter", "brightness(3)");
			$("#beforePicker").val(`${month}/${tmorDate}/${today.getFullYear()}`);
		}
		
		
	} else {
		$("#beforePicker").prop("disabled", true);
		$("#beforeFilterLabel").css("filter", "brightness(3)");
		$("#afterPicker").prop("disabled", true);
		$("#afterFilterLabel").css("filter", "brightness(3)");
		$("#afterFilterCheckbox").prop("checked", false);
		$("#beforeFilterCheckbox").prop("checked", false);


		$("#beforePicker").val(`${month}/${tmorDate}/${today.getFullYear()}`);
		$("#afterPicker").val(`${month}/${date}/${today.getFullYear()}`);
	}
	$("#filterDataModal").modal("show");
});




$('#afterFilterCheckbox').change(function() {
	if(!this.checked) {
		$("#afterFilterLabel").css("filter", "brightness(3)");
		$("#afterPicker").prop("disabled", true);
	}   else {
		$("#afterFilterLabel").css("filter", "");
		$("#afterPicker").prop("disabled", false);
	} 
});

$('#beforeFilterCheckbox').change(function() {
	if(!this.checked) {
		$("#beforeFilterLabel").css("filter", "brightness(3)");
		$("#beforePicker").prop("disabled", true);
	}   else {
		$("#beforeFilterLabel").css("filter", "");
		$("#beforePicker").prop("disabled", false);
	} 
});


$("#clearFilterBtn").on("click", () => {
	isFiltered = false;
	startDate = "";
	endDate = "";
	getAllRateData(curProject);
});

$("#applyFilterBtn").on("click", () => {
	isFiltered = false;
	startDate = "";
	endDate = "";
	if ($('#beforeFilterCheckbox').prop("checked")) {
		//before filter has been requested
		if (!moment($("#beforePicker").val(), 'MM/DD/YYYY',true).isValid()) {
			alert("The Before date is invalid. Use the calendar button to select a correct date.");
			return;
		}
		endDate = convertToFirestoreDate($("#beforePicker").val());
		isFiltered = true;
	}
	if ($('#afterFilterCheckbox').prop("checked")) {
		//after filter has been requested
		if (!moment($("#afterPicker").val(), 'MM/DD/YYYY',true).isValid()) {
			alert("The After date is invalid. Use the calendar button to select a correct date.");
			return;
		}
		startDate = convertToFirestoreDate($("#afterPicker").val());
		isFiltered = true;
	}
	getAllRateData(curProject);
	$("#filterDataModal").modal("hide");

});



/*
 * END FILTERING MANAGEMENT
 */



var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
} 