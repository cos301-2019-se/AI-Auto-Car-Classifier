'use strict';
module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', {
    company: DataTypes.STRING
  }, {});
  Inventory.associate = function(models) {
    // associations can be defined here
    Inventory.belongsTo(models.User);
    Inventory.belongsTo(models.Car);
  };
  return Inventory;
};