

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBLHQIGeyBeeco-H0YnGhdnP6fODhGBwIk",
    authDomain: "train-schedule-f8b01.firebaseapp.com",
    databaseURL: "https://train-schedule-f8b01.firebaseio.com",
    projectId: "train-schedule-f8b01",
    storageBucket: "train-schedule-f8b01.appspot.com",
    messagingSenderId: "473476731153"
  };
  firebase.initializeApp(config);

  
var database = firebase.database();
console.log(database);

//display current time

currentTime();

//set interval for automatic table refresh
var refreshInterval = setInterval(refreshData, 30000);

//store new train info and push to DB when submit button clicked
$("button").on("click", function () {
    //save input values as variables
    var trainName = $("#train-name").val().trim();
    var destination = $("#destination").val().trim();
    var firstTrain = $("#first-train").val().trim();
    var frequency = parseInt($("#frequency").val().trim());

    //validate inputs
    /* Need to fix */
    if (false) {
        alert("All fields are requred");
        return;
    }
    if (moment(firstTrain, "HH:mm").isValid() === false) {
        //error message
        alert("Please enter a valid time");
        return;
    }

    //push input data to database
    database.ref().push({
        trainName: trainName,
        destination: destination,
        firstTrain: firstTrain,
        frequency: frequency
    });

    //clear input fields
    $("input").val("");
})

//render table upon initial page load and when new trains added
database.ref().on("child_added", function (snapshot) {
    var data = snapshot.val();
    displayRow(data);
})

//calculate the next arrival time and time remaining
function calculateTimes(firstTrain, frequency) {
    var firstTrainMoment = moment(firstTrain, "HH:mm");
    var timeDiff, nextArrival, minsAway;
    //if the first train hasn't arrived yet
    if (moment().diff(firstTrainMoment) < 0) {
        nextArrival = firstTrain;
        minsAway = firstTrainMoment.diff(moment(), "minutes");
    }
    //else the first train has already arrived
    else {
        timeDiff = moment().diff(firstTrainMoment, "minutes");
        minsAway = parseInt(frequency) - timeDiff % parseInt(frequency);
        nextArrival = moment().add(minsAway, "minutes").format("HH:mm");

        //if next train is tomorrow
        if (moment().diff(moment(nextArrival, "HH:mm")) > 0) {
            nextArrival = data.firstTrain + " (T)";
            minsAway = (60 * 24) + firstTrainMoment.diff(moment(), "minutes");
        }
    }
    return {
        nextArrival: nextArrival,
        minsAway: minsAway
    }
}

//refresh table with latest calculated times
function refreshData() {
  currentTime();
    $("#train-table").empty();
    database.ref().once("value", function (dbSnapshot) {
        dbSnapshot.forEach(function(rowSnapshot) {
            displayRow(rowSnapshot.val());
        });
    })
    console.log("Refresh complete");
}

//populate new table row
function displayRow(data) {
    //calcuate next arival time and minutes away and store in results in object
    var times = calculateTimes(data.firstTrain, data.frequency);

    //create new row element
    var trainRow = $("<tr>");

    //create new row content elements
    var trainName = $("<td>");
    var trainDestination = $("<td>");
    var trainFrequency = $("<td>");
    var trainNextArrival = $("<td>");
    var trainMinsAway = $("<td>");

    //define element values
    trainName.html(data.trainName);
    trainDestination.html(data.destination);
    trainFrequency.html(data.frequency);
    trainNextArrival.html(times.nextArrival);
    trainMinsAway.html(times.minsAway);

    //append contents to row
    trainRow.append(trainName);
    trainRow.append(trainDestination);
    trainRow.append(trainFrequency);
    trainRow.append(trainNextArrival);
    trainRow.append(trainMinsAway);

    //append row to table body
    $("#train-table").append(trainRow);
}
function currentTime() {
  var current = moment().format('LT');
  $("#currentTime").html(current);
  setTimeout(currentTime, 1000);
};
