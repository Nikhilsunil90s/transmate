
// uses  NOSQLBOOSTER

const customerId = "S46614";
// delete price requests
db.getCollection("price.request").remove({"creatorId": customerId})

//get all pricelists    
const pricelists = db.getCollection("price.list").find()
    .where("creatorId").eq(customerId)
    .projection({_id:1}).toArray()
    console.info("pricelists to clean", pricelists.length);   
// delete all rates
db.getCollection("price.list.rate").remove({"priceListId":{$in:pricelists.map(el=>el._id)}})
   
    
// delete pricelists
db.getCollection("price.list").remove({"creatorId":customerId})



// accounts delete all annotations
db.accounts.update({"accounts.accountId": customerId}, { $pull: { accounts: { accountId: customerId } } }, { multi: true } )  


// accounts delete all partners
 db.accounts.update({"partners.accountId": customerId}, { $pull: { partners: { accountId: customerId } } }, { multi: true } ) ;
 
// cleanup partners on account (no more partners)
db.getCollection("accounts").update({ _id: customerId }, {   $set: { "partners":[]}}, { multi: false }); 
 
// get shipments
const shipments = db.shipments.find()
    .where("accountId").eq(customerId)
    .projection({_id:1}).toArray()
   console.info("shipments to clean", shipments.length); 
   
// delete stages
db.stages.remove({"shipmentId":{$in:shipments.map(el=>el._id)}})
db.items.remove({"shipmentId":{$in:shipments.map(el=>el._id)}})

// delete shipments
db.shipments.remove({"accountId" :customerId })

    /* run bq
DELETE FROM reportingTest.shipments
where accountId = "S46614"
AND lastSync < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 MINUTE)
*/
    