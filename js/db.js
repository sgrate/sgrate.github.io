/* db.js - functions concerned with interfacing with firestore. 
 * Written by Spencer Douglas dougla55@purdue.edu on behalf of Stephen Gould Indianapolis.
 */

var curProject = "Sherwin-Williams";
var curProjectTags = ["V6", "V7", "V8", "DF", "BH"]; //holds the current subcategory tags of the currently selected project. 
var newDataWritten = false;
var lastCollection;
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
async function getAllRateData() {
	var result = "";


	//get all documents in rates collection
	db.collection("rates").get().then(function(querySnapshot) {
		var newDataArr = Array(curProjectTags.length).fill("");
		var totalDataArr = [];
		for (var i = 0; i < curProjectTags.length; i++) {
			let newEntry = {totalHours: 0, totalProduced: 0};
			totalDataArr.push(newEntry);
		}
	    querySnapshot.forEach(function(doc) {
	    	let data = doc.data();
	    	console.log(data);
	    	let rate = (data.hoursSpent * 22 / data.amountProduced).toFixed(2);
	    	let newEntry = `${data.date}: ${rate} (${data.amountProduced} over ${data.hoursSpent} hours)<br>`;
	    	console.log(data.tag);
	    	var entryIndex = curProjectTags.indexOf(data.tag);
	    	if (entryIndex == -1) {
	    		alert("Malformed data, please contact dougla55@purdue.edu.");
	    		return;
	    	}
	    	console.log("entryIndex", entryIndex);
	        result += newEntry;
	        newDataArr[entryIndex] += newEntry;
	        totalDataArr[entryIndex].totalHours = totalDataArr[entryIndex].totalHours + parseFloat(data.hoursSpent);
	        totalDataArr[entryIndex].totalProduced =  totalDataArr[entryIndex].totalProduced + parseFloat(data.amountProduced);
	    });
	    console.log("totalDataArr", totalDataArr);
	    console.log("result", result);
	    console.log("arr", newDataArr);
		//$("#queriedContent").html(result);
		curProjectTags.forEach(function(tag, index) {
			//console.log(index);
			if (newDataArr[index].length > 0) {
				let totalCost = totalDataArr[index].totalHours * 22;
				let avgRate = (totalCost / totalDataArr[index].totalProduced).toFixed(2);
				let totalsStr = `<br><b>Total Produced: ${totalDataArr[index].totalProduced}` +
								`<br>Total Hours: ${totalDataArr[index].totalHours}` +
								`<br>Average Rate: ${avgRate}` +
								`<br>Cost to Produce: $${totalCost.toFixed(2)}</b><br>`;
				$(`#${tag}-summary`).html(totalsStr);
			}
			else {
				$(`#${tag}-summary`).html("<br><b>No data yet.</b>");
			}
		})
		newDataWritten = false;
	});
	//build result line by line
	
}


/*Accepts a date object and */
function convertToFirestoreDate(date) {
	if (typeof date === Date)
		return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}