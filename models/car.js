'use strict';
module.exports = (sequelize, DataTypes) => {
  const Car = sequelize.define('Car', {
    make: DataTypes.STRING,
    model: DataTypes.STRING,
    year: DataTypes.STRING,
    bodyType: DataTypes.STRING,
    plates: DataTypes.STRING,
    vin: DataTypes.STRING,
    mileage: DataTypes.STRING,
    description: DataTypes.STRING,
    imageURL: DataTypes.STRING
  }, {});
  Car.associate = function(models) {
    // associations can be defined here
  };
  return Car;
};