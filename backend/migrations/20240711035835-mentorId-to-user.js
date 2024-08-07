'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'mentorId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'mentorId');

  }
};
