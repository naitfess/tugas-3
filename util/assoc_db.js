const Division = require("../model/Division");
const User = require("../model/User");
const my_db = require("./connect_db");

const divisi_itc = [
  { name: "WEB DEV" },
  { name: "MOBILE DEV" },
  { name: "PM" },
  { name: "INKADIV" },
  { name: "UI/UX" },
];

//one to many Division to User
Division.hasMany(User);
User.belongsTo(Division);

const association = async () => {
  try {
    await my_db.sync({ force: false });
    //INPUT DIVISI
    //Division.bulkCreate(divisi_itc);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = association;
