/* db.js - functions concerned with interfacing with firestore. 
 * Written by Spencer Douglas dougla55@purdue.edu on behalf of Stephen Gould Indianapolis.
 */
var curProject = "8Feju4gTuQXX57M5tbs0";
var curUserId;
var curProjectName = "Sherwin-Williams";
var curProjectTags = ["V6", "V7", "V8", "DF", "BH"]; //holds the current subcategory tags of the currently selected project. 
var newDataWritten = false;
var lastCollection;

/* accepts a Project entry and writes it to the rates collection */
async function addFirestoreProjectEntry(newProject) {
	//TODO: CHECK FOR PROPER MEMBERS
	let writePromise =  new Promise((resolve, reject) => {
		lastCollection = db.collection("projects").add(newProject).then(function(docRef) {
			newDataWritten = true;
			resolve(docRef);
		    return docRef;
		}).catch(function(error) {
			reject("fasfasdf");
			console.log("Error writing document: ", error);
			return "what";
		    
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
/* General query of all rate data, loads data to DOM */
async function getAllRateData(projectId) {
	var result = "";


	//get all documents in rates collection
	db.collection("rates").where("projectId", "==", projectId).get()
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
	    		alert("Malformed data, please contact dougla55@purdue.edu.");
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
				console.log(firstShiftAmount, firstShiftCost, secondShiftAmount, secondShiftCost)
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
								console.log($(`#${index}-summary`));
				$(`#${index}-summary`).html(totalsStr + firstStr + secondStr);
			}
			else {
				$(`#${index}-summary`).html("<h5>Production Summary</h5><b>No data yet.</b>");
			}
		})
		newDataWritten = false;
	});
	//build result line by line
	
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
				displayArea.innerHTML = "No data found for this category.";
			}
	   }, 300);

	}).catch(function(error) {
	    console.error("Error removing document: ", error);
	    return false;
	});
}




/*Accepts a date object and */
function convertToFirestoreDate(date) {
	if (typeof date === Date)
		return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}