const Division = require("../model/Division");
const User = require("../model/User");

const getAllUser = async (req, res, next) => {
  try {
    //TUGAS NOMOR 1
    // Find all users
    const users = await User.findAll({
      attributes: ["id", "fullName", "angkatan", "divisionId"],
      include: {
        model: Division,
        attributes: ["id", "name"],
      },
    });
    res.status(200).json({
      status: "Success",
      message: "Succesfully fetch all user data",
      users: users,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

const getUserById = async (req, res, next) => {
  try {
    //TUGAS NOMOR 2 cari user berdasarkan userId
    const { userId } = req.params;
    const users = await User.findOne({
      where: { id: userId },
      attributes: ["id", "fullName", "angkatan", "divisionId"],
      include: {
        model: Division,
        attributes: ["id", "name"],
      },
    });
    //jika id tidak ditemukan dalam tabel users
    if (users == null) {
      res.status(404).json({
        status: "Not Found",
        message: `User with id ${userId} is not existed`,
      });
    } else {
      //jika id ada di tabel users
      res.status(200).json({
        status: "Success",
        message: "Succesfully fetch user data",
        user: users,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

const postUser = async (req, res, next) => {
  try {
    const { fullName, nim, angkatan, email, password, division } = req.body;

    //cari divisi id
    //pakai await untuk menghindari penulisan then
    const user_division = await Division.findOne({
      where: {
        name: division,
      },
    });

    //SELECT * FROM DIVISION WHERE name = division
    if (user_division == undefined) {
      return res.status(400).json({
        status: "Error",
        message: `${division} is not existed`,
      });
    }

    //insert data ke tabel User
    const currentUser = await User.create({
      //nama field: data
      fullName: fullName,
      //jika nama field == data maka bisa diringkas
      email,
      password,
      angkatan,
      nim,
      divisionId: user_division.id,
    });

    //send response
    res.status(201).json({
      status: "success",
      message: "Successfuly create User",
      user: {
        fullName: currentUser.fullName,
        division: division,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { fullName, email, password, angkatan, nim, division } = req.body;

    //cari divisi id
    //pakai await untuk menghindari penulisan then
    const user_division = await Division.findOne({
      where: {
        name: division,
      },
    });

    //SELECT * FROM DIVISION WHERE name = division
    if (user_division == undefined) {
      return res.status(400).json({
        status: "Error",
        message: `${division} is not existed`,
      });
    }

    // mengupdate data di tabel user dengan menginput di body
    const user = await User.update(
      {
        //nama field: data
        fullName: fullName,
        //jika nama field == data maka bisa diringkas
        email,
        password,
        angkatan,
        nim,
        divisionId: user_division.id,
      },
      {
        where: {
          id: userId,
        },
      }
    );

    //jika id tidak ada dalam tabel users
    if (user[0] === 0) {
      res.status(404).json({
        status: "Not Found",
        message: `User with id ${userId} is not existed`,
      });
    } else {
      //jika id user ada dalam tabel users dan berhasil diupdate
      res.status(200).json({
        status: "Success",
        message: "Successfully update user",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    //DELETE FROM `users` WHERE `users`.`id` = userId
    const user = await User.destroy({
      where: {
        id: userId,
      },
    });

    //jika id tidak ada dalam tabel users
    if (user === 0) {
      res.status(404).json({
        status: "Not Found",
        message: `User with id ${userId} is not existed`,
      });
    } else {
      //jika id user ada dalam tabel users dan berhasil dihapus
      res.status(200).json({
        status: "Success",
        message: "Successfully delete user",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getAllUser,
  getUserById,
  postUser,
  updateUser,
  deleteUser,
};
