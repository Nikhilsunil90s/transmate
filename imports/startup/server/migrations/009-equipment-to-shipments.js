/* eslint-disable */
Migrations.add({
  version: 9,
  name: "equipment to shipment document and array",
  up() {
    return console.log("run script in db...");
  }
});

/*
		db.stages.aggregate([
  {$match:{shipmentId: 'uCkHfywAXRp3FfFpM'}},
  {$match: {equipment: {$exists: true}}},
  //{$limit: 1},
  {$lookup:{
      from:'shipments',
      localField: 'shipmentId',
      foreignField: '_id',
      as: 'shipments'
  }},
  {$unwind:'$shipments'},
  {$match: {equipments: {$exists: false}}},
  {$lookup:{
    from: 'items'  ,
    localField: 'shipmentId',
    foreignField: 'shipmentId',
    as: 'items'
  }},
  {$unwind: '$items'},
  {$group: {
      _id:{
          equipment: '$equipment',
          shipmentId: '$shipmentId'},
      weight: {$sum: {$cond: [{$gt: ['$items.weight_gross', 0] }, '$items.weight_gross', '$items.weight_net' ]}},
      itemIds: {$push: '$items._id'}
  }},
  ]).forEach( (doc) => {
      let equipments = Object.assign( {}, 
      doc._id.equipment,
      {weight: doc.weight},
      {itemIds: doc.itemIds}
      );

      delete equipments['0'];
      delete equipments['_bsontype'];

      equipments = [ equipments ];
      db.getCollection('shipments').update(
          {_id: doc._id.shipmentId},
          {$set:{equipments: equipments}}
          );
      // debug(JSON.stringify(equipments));
  });
*/
