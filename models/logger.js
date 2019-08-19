'use strict';
module.exports = (sequelize, DataTypes) => {
  const Logger = sequelize.define('Logger', {
    user: DataTypes.STRING,
    numberplate: DataTypes.STRING,
    make: DataTypes.STRING,
    model: DataTypes.STRING,
    colour: DataTypes.STRING,
    description: DataTypes.STRING,
    mileage: DataTypes.STRING,
    sold: DataTypes.BOOLEAN
  }, {});
  Logger.associate = function(models) {
    // associations can be defined here
  };
  return Logger;
};