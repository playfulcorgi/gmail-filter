// api calls limits: https://developers.google.com/gmail/api/v1/reference/quota
// push instead of cron and pull: https://developers.google.com/gmail/api/guides/push
// advanced search: https://support.google.com/mail/answer/7190?hl=en

let fromRelativePath = './configuration/from.txt';

function labelThread(threadId, auth, doneCallback){
  var google = require('googleapis');
  var gmail = google.gmail('v1');

  gmail.users.threads.modify({
    auth: auth,
    userId: 'me',
    id: threadId,
    resource: {
      addLabelIds: [process.argv[3]],
      removeLabelIds: [/*'UNREAD', */'INBOX']
    }
  }, function(error, response){

    if(error){
      console.log(error);
    }

    doneCallback();
  });
}

function markThreadsStep(auth, ids, currentIdIndex, doneCallback){

  if(currentIdIndex < ids.length){
    console.log(`Marking id ${ids[currentIdIndex]}`);

    labelThread(ids[currentIdIndex], auth, function(){
      console.log(`Done marking id ${ids[currentIdIndex]}`);
      markThreadsStep(auth, ids, ++currentIdIndex, doneCallback);
    });
  }else{
    doneCallback();
  }
}

function listLabels(auth) {
  console.log('move mail');

  var google = require('googleapis');
  var gmail = google.gmail('v1');

  let fs = require('fs');

  let rescanDelay = 5000;

  fs.readFile(fromRelativePath, 'utf8', function(error, contents){

    if(error){
      console.log(error);

      setTimeout(function(){
        listLabels(auth);
      }, rescanDelay);
    }else{
      let fromString = `{${contents.split('\n').map((from)=>{return `from:${from}`}).join(' ')}}`;

      gmail.users.threads.list({
        auth: auth,
        userId: 'me',
        q: `${fromString} label:INBOX label:UNREAD`
      }, function(error, response){

        if(error){
          console.log(error);

          setTimeout(function(){
            listLabels(auth);
          }, rescanDelay);
        }else{
          
          if('threads' in response){
            let threadsIds = response.threads.map(function(threadResponse){
              return threadResponse.id;
            });

            console.log(`Ids to mark: ${threadsIds.join(',')}`);

            markThreadsStep(auth, threadsIds, 0, function(){
              setTimeout(function(){
                listLabels(auth);
              }, rescanDelay);
            });
          }else{
            setTimeout(function(){
              listLabels(auth);
            }, rescanDelay);
          }
        }
      });
    }
  });
}

module.exports = listLabels;