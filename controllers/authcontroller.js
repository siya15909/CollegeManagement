const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AppError = require('./../utils/AppError');
const QueryExecution = require('./../db').Query;
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const createSendToken = (user, statusCode, res) => {
    console.log(statusCode);
    const token = signToken(user._id);
    console.log(token);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,
    };
    res.status(statusCode).json({
      status: 'success',
      data: {
        user,
        token: token,
      },
    });
  };
  
exports.login = async (req, res, next) => {
  try {
      const Id = req.body.teacher_id;
      const password = req.body.passwordhash; 
      console.log(Id);
      if(!Id || !password) return next(new AppError("Please provide Id and password",404));
      let query;
      if(Id.startsWith("T")){
        query = 'SELECT * FROM teacher WHERE teacher_Id = ?';
      }else if(Id.startsWith("S")){
        query = 'SELECT * FROM student WHERE student_Id = ?';
      }else{
        return next(new AppError("Invalid ID",500));
      }
      console.log("hii");

        // Retrieve user information from the database based on username or email
        const rows = await QueryExecution(query,[Id]);
        console.log(rows);

        if (rows.length === 0) {
            // User not found
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = rows[0];

        // Compare the provided password with the hashed password from the database
        const passwordMatch = await bcrypt.compare(password, user.passwordhash);

        if (!passwordMatch) {
            // Passwords do not match
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Passwords match, authentication successful
        // You can generate a JWT token or set a session here
        createSendToken(user,200,res);
        next();
    } catch (err) {
      res.status(400).json({
        status: 'failed!!!!',
        error: err,
      });
      throw err;
    }
  };
  exports.addTeacher = async (req, res, next) => {
    
    try {
      console.log(req.body);
      const teacher_id = req.body.teacher_id;
      const name = req.body.name;
      const phone_number = req.body.phone_number;
      const address = req.body.address;
      const star_rating = req.body.star_rating;
      const reviewID = req.body.reviewID;
      const email = req.body.email;
      const designation = req.body.designation;
      const password = req.body.passwordhash;
      console.log(password);
      // Hash the password
      const hash = await bcrypt.hash(password, 10);
      console.log('Hashed password:', hash);
  
      // Now you can save the hashed password to your database
      const query = 'INSERT INTO teacher (teacher_id, name, phone_number, address, star_rating, reviewID, email, designation, passwordhash) VALUES (?,?,?,?,?,?,?,?,?)';
      const values = [teacher_id, name, phone_number, address, star_rating, reviewID, email, designation, hash];
      
      // Assuming QueryExecution is a function that executes the query
      await QueryExecution(query, values);
      
      res.status(200).json({
        status: "success",
        message: "Query executed!!!"
      });
      next();
    } catch (err) {
      // Error handling
      console.error('Error:', err);
      res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }
  