const V6 = 0;
const V7 = 1;
const V8 = 2;
const DF = 3;
const BH = 4;

/* Takes as input a data tuple in the form (amount, hours, type, shift)
 * Adds the revised data tuple to the proper dataset and chart.
 */
function addData(shiftChart, date, data) {
    //chart.data.labels.push(dayLabel);
    let typeLabel;
    let setID;
    var wrappedData = {
    	label: undefined,
    }
    let type = $("#tagsSelect").val();
    switch (type) {
    	case "v6":
    		label = "V6";
    		setID = V6;
    		//shiftChart.data.datasets[V6] = wrappedData;
    	break;
    	case "v7":
    		label = "V7";
    		setID = V7;
    	break;
    	case "v8":
    		label = "V8";
    		setID = V8;
    	break;
    	case "df":
    		label = "DF";
    		setID = DF;
    	break;
    	case "bh":
    		label = "BH";
    		setID = BH;
    	break;
    }
    // chart.data.datasets.forEach((dataset) => {
    //     dataset.data.push(amount);
    // });
    let dateObj = new Date(date);
    let dayOfWeek = dateObj.getDay() - 1;
    if (chart.data.datasets[setID].data[dayOfWeek] != 0) {
    	if (!confirm("You are updating existing data. Are you sure?")) {
    		return false;
    	}
    }
    console.log(setID);
    chart.data.datasets[setID].data[dayOfWeek] = data;
    chart.update();
    return true;
}


//For each type of kit, we want to maintain the date, the amount produced, the hours spent,
//and which shift it was run on. We will display each shift's data in its respective graph,
//formated by M-F week, and there will exist 1 dataset for each kit type.
//Weeks -> Shifts -> Kit Datasets[dateLabel, amountProduced, hoursSpent
//We will mount the data for each week nodes of a linked list. Each node will contain the datasets
//For each week of production

//UI:
	//Add data form. Select date, kit type, hours to produce, shift