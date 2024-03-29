/* db.js - functions concerned with interfacing with firestore. 
 * Written by Spencer Douglas dougla55@purdue.edu on behalf of Stephen Gould Indianapolis.
 */


var curProject; //current customer id
var curUserId; //current user id
var curProjectName; //user-chosen string containing the name of the customer
var curProjectTags; //holds the current subcategory tags of the currently selected customer. 
var lastCollection;

//FILTERING GLOBALS
var isFiltered = false;
var startDate = "";
var endDate = "";
//END FILTERING GLOBALS

//RATE DATA ARRAYS
var firstShiftData = [];
var secondShiftData = [];
var generalData = [];

var LABOR_RATE = 22;


function initGlobalRateData() {
	for (var i = 0; i < curProjectTags.length; i++) {
		let newFirstEntry = {totalHours: 0, totalProduced: 0, entries: 0, totalRate: 0};
		let newSecondEntry = {totalHours: 0, totalProduced: 0, entries: 0, totalRate: 0};
		let newGeneralEntry = {totalHours: 0, totalProduced: 0, entries: 0, totalRate: 0};
		firstShiftData.push(newFirstEntry);
		secondShiftData.push(newSecondEntry);
		generalData.push(newGeneralEntry);
	}
}



function getSnapshot() {
	initGlobalRateData();
	db.collection("rates").where("projectId", "==", curProject)
	    .onSnapshot(function(snapshot) {
	    	var amountChange = 0;
	    	var hourChange = 0;
	    	var entryChange = 0;
	        snapshot.docChanges().forEach(function(change) {
	            if (change.type === "added") {
	            	let data = change.doc.data();
	                amountChange += parseFloat(data.amountProduced);
	                hourChange += parseFloat(data.hoursSpent);
	                entryChange++;
	            }
	            else if (change.type === "removed") {
	                let data = hange.doc.data();
	                amountChange -= parseFloat(data.amountProduced);
	                hourChange -= parseFloat(data.hoursSpent);
	                entryChange--;
	            }
	        });
	        console.log(amountChange, hourChange, entryChange)
	    });
}





/* accepts a Project entry and writes it to the rates collection */
async function addFirestoreProjectEntry(newProject) {
	//TODO: CHECK FOR PROPER MEMBERS
	let writePromise =  new Promise((resolve, reject) => {
		lastCollection = db.collection("projects").add(newProject).then(function(docRef) {
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
			resolve();
		    return true;
		}).catch(function(error) {
			reject();
			alert("Error writing document: ", error);
			return false;
		    
		});
	});
}
/* Queries of all rate data for the project, loads data to DOM. Used for initialization
 * If startDate and EndDate are present, will also apply a filter to the data
 */
async function getAllRateData(projectId) {
	if (projectId == undefined) {
		alert("ERROR: bad req");
	}
	var result = "";

	let query;
	//CASE 0: NO FILTER
	if (!isFiltered) {
		console.log("get case 0");
		query = db.collection("rates");
	}
	else {
		//CASE 1: START AND END FILTER
		if (startDate != "" && endDate != "") {
			console.log("get case 1", startDate, endDate)
			query = db.collection("rates").where("date", ">=", startDate).where("date", "<=", endDate);
		}
		//CASE 2: START ONLY FILTER
		else if (startDate != "" && endDate == "") {
			console.log("get case 2", startDate)
			query = db.collection("rates").where("date", ">=", startDate);
		}
		//CASE 3: END ONLY FILTER
		else if (startDate == "" && endDate != "") {
			console.log("get case 3", endDate)
			query = db.collection("rates").where("date", "<=", endDate);
		}
		else {
			console.log("get case def");
			query = db.collection("rates");
		}
	}
	//get proper documents in rates collection

	query.where("projectId", "==", projectId).get()
	.then(function(querySnapshot) {
		var newDataArr = Array(curProjectTags.length).fill("");
		var firstShiftTotals = [];
		var secondShiftTotals = [];
		var totalRateArr = Array(curProjectTags.length).fill(0);
		for (var i = 0; i < curProjectTags.length; i++) {
			let newFirstEntry = {totalHours: 0, totalProduced: 0, totalCost: 0, entries: 0, totalRate: 0};
			let newSecondEntry = {totalHours: 0, totalProduced: 0, totalCost: 0, entries: 0, totalRate: 0};
			firstShiftTotals.push(newFirstEntry);
			secondShiftTotals.push(newSecondEntry);
		}

	    querySnapshot.forEach(function(doc) {
	    	let data = doc.data();

	    	let rate = (data.hoursSpent * data.laborRate / data.amountProduced);

	    	let newEntry = `${data.date}: ${rate.toFixed(3)} (${data.amountProduced} over ${data.hoursSpent} hours)<br>`;
	    	var entryIndex = curProjectTags.indexOf(data.tag);

	    	if (entryIndex == -1) {
	    		alert("Error for", data.tag);
	    		return;
	    	}
	    	totalRateArr[entryIndex] += rate;
	    	
	        result += newEntry;
	        newDataArr[entryIndex] += newEntry;
	        if (data.shift == "first") {
	        	firstShiftTotals[entryIndex].totalHours = firstShiftTotals[entryIndex].totalHours + parseFloat(data.hoursSpent);
	        	firstShiftTotals[entryIndex].totalProduced =  firstShiftTotals[entryIndex].totalProduced + parseFloat(data.amountProduced);
				firstShiftTotals[entryIndex].totalCost =  firstShiftTotals[entryIndex].totalCost + parseFloat(data.hoursSpent * data.laborRate);
	        	firstShiftTotals[entryIndex].entries++;
	        	firstShiftTotals[entryIndex].totalRate += rate;
	        }
	        else if (data.shift == "second") {
	        	secondShiftTotals[entryIndex].totalHours = secondShiftTotals[entryIndex].totalHours + parseFloat(data.hoursSpent);
	        	secondShiftTotals[entryIndex].totalProduced =  secondShiftTotals[entryIndex].totalProduced + parseFloat(data.amountProduced);
				secondShiftTotals[entryIndex].totalCost =  secondShiftTotals[entryIndex].totalCost + parseFloat(data.hoursSpent * data.laborRate);
	        	secondShiftTotals[entryIndex].entries++;
	        	secondShiftTotals[entryIndex].totalRate += rate;
	        }
	        
	    });


		curProjectTags.forEach(async function(tag, index) {
			//console.log(index);
			if (newDataArr[index].length > 0) {
				let firstShiftHours = firstShiftTotals[index].totalHours;
				let secondShiftHours = secondShiftTotals[index].totalHours;

				let firstShiftCost = firstShiftTotals[index].totalCost;
				let secondShiftCost = secondShiftTotals[index].totalCost;
				let totalCost = firstShiftCost + secondShiftCost;

				let firstShiftAmount = firstShiftTotals[index].totalProduced;
				let secondShiftAmount = secondShiftTotals[index].totalProduced;
				let totalAmount = firstShiftAmount + secondShiftAmount;


				var avgRate = (totalCost / totalAmount).toFixed(3);

				let totalsStr = `<h5>General Summary</h5>` +
								`<Total Produced: ${numberWithCommas(firstShiftAmount + secondShiftAmount)}` +
								`<br>Total Hours: ${numberWithCommas(firstShiftHours + secondShiftHours)}` +
								`<br>Average Rate: ${numberWithCommas(avgRate)}` +
								`<br>Cost to Produce: $${numberWithCommas(totalCost.toFixed(2))}<br>`;				

				let firstRate = (firstShiftAmount == 0) ? 0 : firstShiftCost / firstShiftAmount;
				let firstStr = `<h5>First Shift</h5>` +
								`Total Produced: ${numberWithCommas(firstShiftAmount)}` +
								`<br>Total Hours: ${numberWithCommas(firstShiftHours)}` +
								`<br>Average Rate: ${firstRate.toFixed(3)}` +
								`<br>Cost to Produce: $${numberWithCommas(firstShiftCost.toFixed(2))}<br>`;

				let secondRate = (secondShiftAmount == 0) ? 0 : secondShiftCost / secondShiftAmount;

				let secondStr = `<h5>Second Shift</h5>` +
								`Total Produced: ${numberWithCommas(secondShiftAmount)}` +
								`<br>Total Hours: ${numberWithCommas(secondShiftHours)}` +
								`<br>Average Rate: ${secondRate.toFixed(3)}` +
								`<br>Cost to Produce: $${numberWithCommas(secondShiftCost.toFixed(2))}<br>`;

				$(`#${index}-summary`).html(totalsStr + firstStr + secondStr);
				let movingAverage = (await getMovingAverages(tag)).toFixed(3);
				if (movingAverage <= avgRate) {
					$(`#${index}-average`).css("color", "green");
				}
				else {
					$(`#${index}-average`).css("color", "red");
				}
				$(`#${index}-average`).html(`20 Day: ${numberWithCommas(movingAverage)}`);
			}
			else {
				if (isFiltered) {
					$(`#${index}-summary`).html("<h5>General Summary</h5><b>No data matching the criteria.</b>");
				} else {
					$(`#${index}-summary`).html("<h5>General Summary</h5><b>No data yet.</b>");
				}
			}
		})
	});
	
}

function updateCustomerName(projectId, newName) {
	if (!projectId || projectId.length <=0)
		return;
	if (!newName || newName.length <=0)
		return;	
	db.collection('projects').doc(projectId).set({
		name: newName
	}, { merge: true });
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
function removeAllFirestoreProjectsForCustomer(customerId) {

	db.collection("rates").where("projectId", "==", customerId).get().then((results) => {
		results.forEach((doc) => {
			doc.ref.delete();
		});
	}).then(() => {
		db.collection("projects").doc(customerId).delete();
		$("#manageClientModal").modal("hide");
		deselectProject();
	}).catch((err) => {
		alert("Something went wrong. If the error persists, contact dougla55@purdue.edu. Error:", err);
	});
	//if successful, delete the customer.
	

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

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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




/*
 * getMovingAverages - calculates the average rate for the past 20 runs for the project specified.
 */
async function getMovingAverages(projectTag) {
	return new Promise((resolve, reject) => {
		db.collection("rates")
		.where("projectId", "==", curProject)
		.where("tag", "==", projectTag)
		.orderBy("date").get().then((result) => {
			var numEntries = 0;
			var lastEntries = [];
			while (numEntries < 20 && numEntries < result.docs.length) {
				//while we have entries to read and have not read our max of 20 entries, iterate backwards over the array
				lastEntries.push(result.docs[(result.docs.length - 1) - numEntries++]);
			}
			//console.log(lastEntries)
			// var totalRate = 0;
			let totalCost = 0;
			let totalProduced = 0;
			lastEntries.forEach((doc, index) => {
				if (doc == undefined) {
					return;
				}
				let entry = doc.data();
				totalCost += (entry.laborRate * entry.hoursSpent);
				totalProduced += parseFloat(entry.amountProduced);
				console.log(totalCost, totalProduced, "totalCost, totalProduced");
				// totalRate += (entry.laborRate * entry.hoursSpent) / entry.amountProduced;

			});
			if (lastEntries.length) {
				// if(isNaN(totalRate/lastEntries.length)) {
				// 	console.log(totalRate, lastEntries)
				// }
				resolve((totalCost / totalProduced));
			}
			else {
				resolve(0);
			}
			
			//then calculate the average data over the last 10 and 20 entries
		})
	})
}





