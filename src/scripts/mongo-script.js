//***** START *********

// var events = db.getCollection('events').find({});


// add fields to creators
// events.forEach( function(evtDoc) {
//     db.getCollection('backup').insert(evtDoc);
//    });

//**** END **********

//**************
var users = db.getCollection('users').find({});
// var events = db.getCollection('backup').find({});



users.forEach( function(uDoc) {
    db.getCollection('events').update(
        { "participants.username": uDoc.username, },
        { $set: { "participants.$.sub" : uDoc.auth0Id, "participants.$.nickname" : uDoc.username  } }, 
        { multi : true, upsert: false }
    );
    db.getCollection('events').update(
        { "creator.username": uDoc.username, },
        { $set: { "creator.sub" : uDoc.auth0Id, "creator.nickname" : uDoc.username  } }, 
        { multi : true, upsert: false }
    );
 });

//****************