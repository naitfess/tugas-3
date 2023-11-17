require('dotenv').config();
const Division = require("../model/Division");
const User = require("../model/User");
const my_db = require("./connect_db");
const bcrypt = require('bcrypt');

const divisi_itc = [
  { name: "WEB DEV" },
  { name: "MOBILE DEV" },
  { name: "PM" },
  { name: "INKADIV" },
  { name: "UI/UX" },
];

//hash password admin
const adminPassword = process.env.ADMIN_PASSWORD;
//hashSync
const hashedPassword = bcrypt.hashSync(adminPassword, 5);

//membuat user admin
const admin = {
  fullName: process.env.ADMIN_FULLNAME,
  nim: process.env.ADMIN_NIM,
  email: process.env.ADMIN_EMAIL,
  password: hashedPassword,
  angkatan: process.env.ADMIN_ANGKATAN,
  //inkadiv merupakan element ke 4 di divisi
  divisionId: 4,
  role: "ADMIN"
}


//one to many Division to User
Division.hasMany(User);
User.belongsTo(Division);

const association = async () => {
  try {
    await my_db.sync({ force: false });
    //INPUT DIVISI
    //Division.bulkCreate(divisi_itc);
    //INPUT ADMIN
    //await User.create(admin);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = association;
