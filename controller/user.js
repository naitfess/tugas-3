require('dotenv').config();
const Division = require("../model/Division");
const User = require("../model/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const key = process.env.key;

const getAllUser = async (req, res, next) => {
  try {
    //TUGAS NOMOR 1
    // Find all users
    const users = await User.findAll({
      attributes: ["id", "fullName", "angkatan"],
      include: {
        model: Division,
        attributes: ["name"],
      },
    });
    res.status(200).json({
      status: "Success",
      message: "Succesfully fetch all user data",
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const getUserById = async (req, res, next) => {
  try {
    //TUGAS NOMOR 2 cari user berdasarkan userId
    const { userId } = req.params;
    const users = await User.findOne({
      where: { id: userId },
      attributes: ["id", "fullName", "angkatan"],
      include: {
        model: Division,
        attributes: ["name"],
      },
    });
    //jika id tidak ditemukan dalam tabel users
    if (users === null) {
      const error = new Error(`User with id ${userId} is not existed`)
      error.statusCode = 404;
      throw error;
    } else {
      //jika id ada di tabel users
      res.status(200).json({
        status: "Success",
        message: "Succesfully fetch user data",
        user: users,
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const postUser = async (req, res, next) => {
  try {
    const { fullName, nim, angkatan, email, password, division } = req.body;

    const hashedPassword = await bcrypt.hash(password, 5);
    //password di hash 5x

    //cari divisi id
    //pakai await untuk menghindari penulisan then
    const user_division = await Division.findOne({
      where: {
        name: division,
      },
    });

    //SELECT * FROM DIVISION WHERE name = division
    if (user_division == undefined) {
      const error = new Error(`division ${division} is not existed!`);
      error.statusCode = 400;
      throw error;
    }

    //insert data ke tabel User
    const currentUser = await User.create({
      //nama field: data
      fullName: fullName,
      //jika nama field == data maka bisa diringkas
      email,
      password: hashedPassword,
      angkatan,
      nim,
      divisionId: user_division.id,
      role: "MEMBER"
    });

    const token = jwt.sign({
      userId: currentUser.id,
      role: currentUser.role
    }, key,
    {
      algorithm: "HS256",
      expiresIn: "30m"
    })

    //send response
    res.status(201).json({
      status: "Success",
      message: "Register Successfull!",
      user: {
        fullName: currentUser.fullName,
        division: division,
      },
      token
    });

  } catch (error) {
    //jika error.statusCode == undefined maka status = 500
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const loginHandler = async(req, res, next)=> {
  try {
    const {email, password} = req.body;

    const currentUser = await User.findOne({
      where:{
        email
      }
    });

    //jika email tidak ditemukan
    if(currentUser == undefined){
      const error = new Error("Wrong Email or Password");
      error.statusCode = 400;
      throw error;
    }

    const checkPassword = await bcrypt.compare(password, currentUser.password);

    //jika password salah
    if(checkPassword == false){
      const error = new Error("Wrong Email or Password!");
      error.statusCode = 400;
      throw error;
    }

    const token = jwt.sign({
      userId: currentUser.id,
      role: currentUser.role
    }, key, {
      algorithm: "HS256",
      expiresIn: "30m"
    })

    res.status(200).json({
      status: "Success",
      message: "Login Success",
      token
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { fullName, email, password, angkatan, nim, division } = req.body;

    const hashedPassword = await bcrypt.hash(password, 5);
    //password di hash 5x

    //hanya user itu sendiri yang bisa mengupdate datanya
    //mengambil header
    const header = req.headers;

    //mengambil header auth
    const authorization = header.authorization;
    let token;

    if(authorization !== undefined && authorization.startsWith("Bearer ")){
      //menghilangkan string "Bearer "
      token = authorization.substring(7);
      //token -> berisi nilai token
    }else{
      const error = new Error("You need to input token!");
      error.statusCode = 403;
      throw error;
    }

    //ekstrak payload menggunakan jwt.verify untuk mendapatkan id
    const decoded = jwt.verify(token, key);

    //jika id yang didapat dari token tidak sama dengan id yang didapat dari params
    if(decoded.userId != userId){
      const error = new Error("You don't have access to update another users data!");
      error.statusCode = 403;
      throw error;
    }
    
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
        password: hashedPassword,
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
      
    //jika data user berhasil diupdate
    res.status(200).json({
      status: "Success",
      message: "Successfully update user",
    });

  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const deleteUser = async (req, res, next) => {
  //hanya admin yang bisa delete
  try {
    //step 1 mengambil token
    //mengambil header
    const header = req.headers;

    //mengambil header authnya
    const authorization = header.authorization;
    //console.log(authorization); //bearer <token>
    let token;

    if (authorization !== undefined && authorization.startsWith("Bearer ")){
      //menghilangkan string "Bearer "
      token = authorization.substring(7);
      //token -> berisi nilai token
    }else{
      const error = new Error("You need to login!");
      error.statusCode = 403;
      throw error;
    }

    //ekstrak payload agar bisa mendapatkan userId dan role
    const decoded = jwt.verify(token, key);

    //decode mempunyai 2 properti yaitu userId dan role
    if(decoded.role != "ADMIN"){
      const error = new Error("You don't have access!");
      error.statusCode = 403;
      throw error;
    }

    //menjalankan operasi hapus
    const {userId} = req.params;

    //DELETE FROM `users` WHERE `users`.`id` = userId
    const targetedUser = await User.destroy({
      where: {
        id: userId,
      },
    });

    //jika id tidak ada dalam tabel users
    if (targetedUser === 0) {
      const error = new Error(`User with id ${userId} is not existed!`);
      error.statusCode = 400;
      throw error;
    }

    //jika id user ada dalam tabel users dan berhasil dihapus
    res.status(200).json({
      status: "Success",
      message: "Successfully delete user!",
      //user: targetedUser, jika tidak ketemu nilai targetedUser = 0
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

//TODO 1
const getUserByToken = async(req,res,next)=>{
  try {
    //tugas lengkapi codingan
    //hanya user yang telah login bisa mengambil data dirinya dengan mengirimkan token
    //step 1 ambil token
    const header = req.headers;

    //megambil header authorization
    const authorization = header.authorization;
    //console.log(authorization);
    let token;

    if(authorization !== undefined && authorization.startsWith("Bearer ")){
      //menghilangkan string "Bearer "
      token = authorization.substring(7);
      //token -> berisi nilai token
    }else{
      const error = new Error("You need to enter a token!");
      error.statusCode = 403;
      throw error;
    }

    //step 2 ekstrak payload menggunakan jwt.verify
    const decoded = jwt.verify(token, key);

    //step 3 cari user berdasarkan payload.userId    
    const user = await User.findOne({
      where: { id: decoded.userId },
      attributes: ["id", "fullName", "angkatan"],
      include: {
        model: Division,
        attributes: ["name"],
      },
    });

    res.status(200).json({
      status: "Success",
      message: "Succesfully fetch user data!",
      user: user
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message
    })
  }
  
}

module.exports = {
  getAllUser,
  getUserById,
  postUser,
  loginHandler,
  updateUser,
  deleteUser,
  getUserByToken
};
