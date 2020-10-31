
$("#add-data-btn").on("click", async function() {
	let now = new Date();
	let date = $('#datepicker').val()
	var amountProduced = $("#amount").val();
	var hoursSpent = $("#hours").val();
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
	let tag = $("#tagSelect").val();
	let newData;
	if (tag != undefined) 
		newData = {date, amountProduced, hoursSpent, tag};
	else
		newData = {date, amountProduced, hoursSpent};
	console.log(`adding new data: ${newData}`);
	addFirestoreRateEntry(newData).then(function() {
		alert("Written")
	}).catch(function() {
		alert("An error occurred.");
	})

	// if(addData(chart, $('#datepicker').val(), $("#amount").val())) {
	// 	$("#newDataModal").modal('hide');
	// 	$("#newDataForm")[0].reset();
	// }
		
	
});
$("#openmodalbtn").on("click", function() {
	let today = new Date();
	let result = `${today.getUTCMonth() + 1}/${today.getUTCDate()}/${today.getFullYear()}`;
	console.log(result);
	$("#datepicker").val(`${today.getUTCMonth() + 1}/${today.getUTCDate()}/${today.getFullYear()}`);
});