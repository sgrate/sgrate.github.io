/* Object classes for Projects and associated Rate data */

class RateData {
  constructor(date, amountProduced, hours, tag) {
    this.date = date;
    this.amount = amountProduced;
    this.hours = hours;
    if (tag != undefined) {
    	this.tag= tag;
    }
  }
}

//Takes a date object as param and returns a date str like YY-MM-DD
