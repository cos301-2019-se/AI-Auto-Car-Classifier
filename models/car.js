'use strict';
module.exports = (sequelize, DataTypes) => {
  const Car = sequelize.define('Car', {
    make: DataTypes.STRING
  }, {});
  Car.associate = function(models) {
    // associations can be defined here
  };
  return Car;
};