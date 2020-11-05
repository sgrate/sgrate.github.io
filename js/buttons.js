
$("#add-data-btn").on("click", async function() {

	let tag = $("#viewDataTitle").html().split(" Data")[0]; //extract tag from modal header


	let now = new Date();
	let date = $('#datepicker').val()
	var amountProduced = $("#amount").val();
	var hoursSpent = $("#hours").val();
	var shift = $("input[name='shift']:checked").val();
	console.log(shift)

	
	var errs;
	if (parseInt(amountProduced) == NaN) {
		errs += "The quantity input for Amount Produced is invalid. \n"
	}
	if (parseFloat(hoursSpent) == NaN) {
		errs += "The quantity input for Hours Spent is invalid.\n"
	}
	if (errs != undefined) {
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
$("#openmodalbtn").on("click", function() {
	$("#categoryDataModal").modal("hide");
	let today = new Date();
	let result = `${today.getUTCMonth() + 1}/${today.getUTCDate()}/${today.getFullYear()}`;
	console.log(result);
	$("#datepicker").val(`${today.getUTCMonth() + 1}/${today.getUTCDate()}/${today.getFullYear()}`);
});


$("#chooseProjBtn").on("click", function() {

	initProjectsModal();
	
});


$("#createProjBtn").on("click", function() {
	$("#projectSelectModal").modal("hide");
	setTimeout(() => {$("#createProjectModal").modal("show");}, 100);
		
});

$("#addProjectCategoryModalBtn").on("click", function() {
	var isValid = true;
	if ($("#newProjectCategoryName").val().length > 0) {
			let currentVal = $("#newProjectCategoryList").html();
			if (currentVal == "No categories yet. Add one below.") {
				$("#newProjectCategoryList").html("");
			}
			$("#newProjectCategoryList").children(".data-entry").each(function() {
				console.log($("#newProjectCategoryList").children(".data-entry"));
				let child = $(this);
				if (child.children(".category-name").html() == $("#newProjectCategoryName").val()) {
					alert("Category already exists.");
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
		alert("No categories.")
		return;
	}
	// addFirestoreProjectEntry({name, tags}).then((ret) => {
	// 	console.log(ret);
	// })
	(addFirestoreProjectEntry({name, tags}).then((ref) => {
		db.collection("projects").doc(ref.id).get().then((doc) => {
			console.log(doc)
			let data = doc.data();
			loadProject(doc.id, data.name, data.tags);
			$("#createProjectModal").modal("hide");
		})
		// loadProject(ref.id, data.name, data.tags);
	}))



});



$("#filterDataBtn").on("click", function() {
	alert("I can't do that yet.");
});




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