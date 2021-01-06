/* db.js - functions concerned with interfacing with firestore. 
 * Written by Spencer Douglas dougla55@purdue.edu on behalf of Stephen Gould Indianapolis.
 */
var curProject;
var curUserId;
var curProjectName;
var curProjectTags; //holds the current subcategory tags of the currently selected project. 
var newDataWritten = false;
var lastCollection;
var isFiltered = false;
var startDate = "";
var endDate = "";

/* accepts a Project entry and writes it to the rates collection */
async function addFirestoreProjectEntry(newProject) {
	//TODO: CHECK FOR PROPER MEMBERS
	let writePromise =  new Promise((resolve, reject) => {
		lastCollection = db.collection("projects").add(newProject).then(function(docRef) {
			newDataWritten = true;
			resolve(docRef);
		    return docRef;
		}).catch(function(error) {
			reject("nope");
			console.log("Error writing document: ", error);
		    
		});
	});
	return writePromise;
}

/* accepts a rateData entry and writes it to the rates collection */
async function addFirestoreRateEntry(newRateData) {
	//TODO: CHECK FOR PROPER MEMBERS
	let writePromise =  new Promise((resolve, reject) => {
		lastCollection = db.collection("rates").add(newRateData).then(function(docRef) {
			newDataWritten = true;
			resolve();
		    return true;
		}).catch(function(error) {
			reject();
			alert("Error writing document: ", error);
			return false;
		    
		});
	});
}
/* Queries of all rate data for the project, loads data to DOM 
 * If startDate and EndDate are present, will also apply a filter to the data
 */
async function getAllRateData(projectId) {
	var result = "";

	let query;
	//CASE 0: NO FILTER
	if (!isFiltered) {
		console.log("case 0");
		query = db.collection("rates").where("projectId", "==", projectId);
	}
	else {
		//CASE 1: START AND END FILTER
		if (startDate != "" && endDate != "") {
			console.log("case 1");
			query = db.collection("rates").where("date", ">=", startDate).where("date", "<=", endDate).where("projectId", "==", projectId);
		}
		//CASE 2: START ONLY FILTER
		else if (startDate != "" && endDate == "") {
			console.log("case 2");
			query = db.collection("rates").where("date", ">=", startDate).where("projectId", "==", projectId);
		}
		//CASE 3: END ONLY FILTER
		else if (startDate == "" && endDate != "") {
			console.log("case 3");
			query = db.collection("rates").where("date", "<=", endDate).where("projectId", "==", projectId);
		}
		else {
			console.log("case def");
			query = db.collection("rates").where("projectId", "==", projectId);
		}
	}
	//get proper documents in rates collection
	console.log(query)
	query.get()
	.then(function(querySnapshot) {
		var newDataArr = Array(curProjectTags.length).fill("");
		var firstShiftTotals = [];
		var secondShiftTotals = [];
		var totalDataArr = []
		for (var i = 0; i < curProjectTags.length; i++) {
			let newFirstEntry = {totalHours: 0, totalProduced: 0};
			let newSecondEntry = {totalHours: 0, totalProduced: 0};
			firstShiftTotals.push(newFirstEntry);
			secondShiftTotals.push(newSecondEntry);
			
		}
		console.log(firstShiftTotals);
	    querySnapshot.forEach(function(doc) {
	    	let data = doc.data();

	    	let rate = (data.hoursSpent * 22 / data.amountProduced).toFixed(2);
	    	let newEntry = `${data.date}: ${rate} (${data.amountProduced} over ${data.hoursSpent} hours)<br>`;
	    	var entryIndex = curProjectTags.indexOf(data.tag);
	    	if (entryIndex == -1) {
	    		console.log(data.tag)
	    		//alert("Malformed data, please contact dougla55@purdue.edu.");
	    		return;
	    	}
	        result += newEntry;
	        newDataArr[entryIndex] += newEntry;
	        if (data.shift == "first") {
	        	firstShiftTotals[entryIndex].totalHours = firstShiftTotals[entryIndex].totalHours + parseFloat(data.hoursSpent);
	        	firstShiftTotals[entryIndex].totalProduced =  firstShiftTotals[entryIndex].totalProduced + parseFloat(data.amountProduced);
	        }
	        else {
	        	secondShiftTotals[entryIndex].totalHours = secondShiftTotals[entryIndex].totalHours + parseFloat(data.hoursSpent);
	        	secondShiftTotals[entryIndex].totalProduced =  secondShiftTotals[entryIndex].totalProduced + parseFloat(data.amountProduced);
	        }
	        
	    });
	    console.log(firstShiftTotals, secondShiftTotals)

		curProjectTags.forEach(function(tag, index) {
			//console.log(index);
			if (newDataArr[index].length > 0) {

				let firstShiftHours = firstShiftTotals[index].totalHours;
				let secondShiftHours = secondShiftTotals[index].totalHours;

				let firstShiftCost = firstShiftHours * 22;
				let secondShiftCost = secondShiftHours * 22;
				let totalCost = firstShiftCost + secondShiftCost;

				let firstShiftAmount = firstShiftTotals[index].totalProduced;
				let secondShiftAmount = secondShiftTotals[index].totalProduced;

				var firstShiftRate = (firstShiftCost / firstShiftAmount).toFixed(3);
				var secondShiftRate = (secondShiftCost / secondShiftAmount).toFixed(3);
				var avgRate = (totalCost / (firstShiftAmount + secondShiftAmount)).toFixed(3);
				if (isNaN(firstShiftRate)) {
					firstShiftRate = 0.0;
				} 
				if (isNaN(secondShiftRate)) {
					secondShiftRate = 0.0;
				} 

				let totalsStr = `<h5>General Summary</h5>` +
								`<Total Produced: ${firstShiftAmount + secondShiftAmount}` +
								`<br>Total Hours: ${firstShiftHours + secondShiftHours}` +
								`<br>Average Rate: ${avgRate}` +
								`<br>Cost to Produce: $${totalCost.toFixed(2)}<br>`;


				let firstStr = `<h5>First Shift</h5>` +
								`Total Produced: ${firstShiftAmount}` +
								`<br>Total Hours: ${firstShiftHours}` +
								`<br>Average Rate: ${firstShiftRate}` +
								`<br>Cost to Produce: $${firstShiftCost.toFixed(2)}<br>`;


				let secondStr = `<h5>Second Shift</h5>` +
								`Total Produced: ${secondShiftAmount}` +
								`<br>Total Hours: ${secondShiftHours}` +
								`<br>Average Rate: ${secondShiftRate}` +
								`<br>Cost to Produce: $${secondShiftCost.toFixed(2)}<br>`;

				$(`#${index}-summary`).html(totalsStr + firstStr + secondStr);
			}
			else {
				if (isFiltered) {
					$(`#${index}-summary`).html("<h5>Production Summary</h5><b>No data matching the criteria.</b>");
				} else {
					$(`#${index}-summary`).html("<h5>Production Summary</h5><b>No data yet.</b>");
				}
			}
		})
		newDataWritten = false;
	});
	
}

function deleteEntry(docId, DOMEntry) {
	if (!confirm("Are you sure you wish to delete this datapoint?"))
		return false;
	db.collection("rates").doc(docId).delete().then(function() {
	    console.log("Document successfully deleted!");
	    let displayArea = DOMEntry.parentNode;
	    console.log($(DOMEntry), $(DOMEntry) instanceof jQuery);
	   $(DOMEntry).fadeOut(300);
	   setTimeout(function() {  
	   displayArea.removeChild(DOMEntry);
		    if (displayArea.innerHTML == "") {
				displayArea.innerHTML = "No data found for this project.";
			}
	   }, 300);

	}).catch(function(error) {
	    console.error("Error removing document: ", error);
	    return false;
	});
}



/*
 *	removeAllFirestoreProjects: removes all of the data associated with a customer 
 */
function removeAllFirestoreProjectsForCustomer(customerId, projectsArr) {
	console.log(projectsArr, projectsArr.length)

	projectsArr.forEach(function(project) {
		removeFirestoreProjectData(project, customerId);
	});
	//if successful, delete the customer.
	db.collection("projects").doc(customerId).delete();
	$("#manageClientModal").modal("hide");
	deselectProject();
}


/*
 *	Helper function which deslects the current project and resets interfaces to prompt the user to select/create a new one. 
 */
function deselectProject() {
	curProject = "";
	curProjectTitle = "";
	curProjectTags = [];

	$("#outputContainer").html("");
	$("#curProjectTitle").html("No customer selected!");
	$("#manageClientBtn").hide();
	initProjectsModal();
}

/*
 * removeFirestoreProjectData: removes all of the associated rate data for the specified projectName under the customer customerId.
 */
function removeFirestoreProjectData(projectName, customerId) {
	//get all the rate data for the project under the customerId
	var tagRatesQuery = db.collection('rates').where('projectId','==', customerId).where('tag', '==', projectName);
	//delete all the documents found
	tagRatesQuery.get().then(function(querySnapshot) {
		querySnapshot.forEach(function(doc) {
    		doc.ref.delete();
    	});
		//remove the tag from the customer's entry
		let customerRef = db.collection("projects").doc(customerId);
		customerRef.update({
		    tags: firebase.firestore.FieldValue.arrayRemove(projectName)
		});
	});

	//delete all of the rate data for the project

	//then

	//delete the project from the customer entry
}




/*Accepts a date object and returns a firestore formatted string (DEPRECATED) */
function convertToFirestoreDate(dateStr) {
	let date = new Date(dateStr)
	if (date != undefined) {
		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		let day = date.getDate();
		let firestoreDate;
		//if the date is 1-9, want to add a leading zero
		if (day < 10) {
			firestoreDate = `${year}/${month}/0${day}`;
		}
		else {
			firestoreDate = `${year}/${month}/${day}`;
		}
		return firestoreDate;
	}
	else return undefined;
}