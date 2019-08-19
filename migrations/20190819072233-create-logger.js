'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Loggers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user: {
        type: Sequelize.STRING
      },
      numberplate: {
        type: Sequelize.STRING
      },
      make: {
        type: Sequelize.STRING
      },
      model: {
        type: Sequelize.STRING
      },
      colour: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      mileage: {
        type: Sequelize.STRING
      },
      sold: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Loggers');
  }
};