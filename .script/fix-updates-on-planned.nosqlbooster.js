// uses  NOSQLBOOSTER

// numidia has updated the planned shipments, resulting in planned shipments to become "draft"
// and loose the set carrierId on shipment and stage

const shipments = db.shipments.find({
    //_id : "F48SH3aYmBr79zJPc",
    "costs.source":"priceList",
    priceListId : {$exists: true},
    priceRequestId : {$exists: true},
    carrierIds :[],
     "updates.action":"planned", 
    // "updated.at":{$lt:new Date("2021-09-22")},
     accountId : "S46614", 
     "status" : "draft",
    
})
    .projection({"_id" : 1, "priceListId":1, "stageIds":1})
    .sort({ "updated.at": -1 })
    //.limit(10)
    .toArray()
    // shipments    
    // set carrierIds, status, updated:{by:"fix", at: now()}, 
    //stage 
    // set carrierId, status
const priceLists =  db.price.list.find({_id:{$in:shipments.map(el=>el.priceListId)}}).projection({carrierId:1}).toArray();
const stages = db.stages.find({shipmentId:{$in:shipments.map(el=>el._id)}}).projection({_id:1, shipmentId:1}).toArray();

console.log(shipments.length, stages.length,priceLists.length);
// console.log(shipments, stages,priceLists);
shipments.forEach(shipment=>{
    const carrierId = priceLists.find(el => el._id === shipment.priceListId).carrierId;
    const stageId = stages.find(el => el.shipmentId === shipment._id)._id;
    const now = new Date();
    console.log("fix shipment ", shipment._id, " & stage ", stageId, ", set to carrierId : ", carrierId);
    
    // double check to see if data is consitent
    if(!shipment.stageIds.includes(stageId)) throw Error("stageid not in shipment!");
    const shipmentUpdate = {
        "status": "planned",
        "updated" : {by:"fix", at:now},
        "carrierIds" : [carrierId]
    };
    const stageUpdate = {
        "status": "planned",
        "updated" : {by:"fix", at:now},
        "carrierId" : carrierId
    }
    
   // console.log(shipmentUpdate, stageUpdate);
    db.stages.update({_id:stageId}, {$set:stageUpdate}    );
    db.shipments.update({_id:shipment._id}, {$set:shipmentUpdate}    )
})
