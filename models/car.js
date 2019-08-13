'use strict';
module.exports = (sequelize, DataTypes) => {
  const car = sequelize.define('car', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    make: DataTypes.STRING,
    model: DataTypes.STRING,
    year: DataTypes.STRING
  }, {});
  car.associate = function(models) {
    // associations can be defined here
  };
  return car;
};