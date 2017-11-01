function listLabels(auth) {
  console.log('listLabels');

  var google = require('googleapis');
  var gmail = google.gmail('v1');

  gmail.users.labels.list({
    auth: auth,
    userId: 'me'
  }, function(error, response){

    if(error){
      console.log(error);
    }else{
      console.log(response);
    }
  });
}

module.exports = listLabels;