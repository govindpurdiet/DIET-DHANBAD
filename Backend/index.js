import express from "express"
import bodyParser from "body-parser"
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import db from "./database/database.js";
import { Upload } from "./services/upload.js";
import bcrypt from "bcrypt";
import MailTransport from "./services/mail.js";


const app = express();
const port = 3000;

async function getPhotos() {
  const result = await db.query("SELECT title,year,url from gallery");
  return result.rows;
}
async function getYear() {
  const result = await db.query("SELECT distinct year from gallery");
  const year = [];
  result.rows.forEach(yr => {
    year.push(yr.year);
  })
  return year;
}
async function getTitle() {
  const result = await db.query("SELECT distinct title,year from gallery");
  const title = result.rows;
  return title;
}
async function getHead(params) {
  const result = await db.query("SELECT * FROM staff");
  const data = [];
  result.rows.forEach(r => {
    if (r.type === "principal" || r.type === "inCharge-principal") {
      data.push(r);
    }
  })
  return data;
}


async function getStaff() {
  const result = await db.query("SELECT * FROM staff");
  const data = [];
  result.rows.forEach(r => {
    if (r.type !== 'principal' && r.type !== 'inCharge-principal') {
      data.push(r);
    }
  })
  return data;
}

app.use(bodyParser.urlencoded({ extended: true }));

const __dirname = dirname(fileURLToPath(import.meta.url));
app.set('views', path.join(__dirname, '..', 'Frontend', 'views'));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '..', 'Frontend', 'public')));

app.get("/", async (req, res) => {
  const result = await getHead();
  res.render("home", { staff: result })
})

app.get("/admin", async (req, res) => {
  res.render("login.ejs");
})

app.get("/contact", (req, res) => {
  res.render("contact")
})
app.get("/notice", (req, res) => {
  res.render("notice")
})

app.get("/administration", async (req, res) => {
  const head = await getHead();
  const staff = await getStaff();
  res.render("administration.ejs", { staff: staff, head: head })
})


app.get("/gallery", async (req, res) => {
  const photo = await getPhotos();
  const year = await getYear();
  const title = await getTitle();
  res.render("gallery", { photos: photo, year: year, title: title });
})

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), async (req, res) => {


  if (req.body.upload === "Upload_Image") {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const uploadResult = await Upload(dataURI);
    const title = req.body.new_title ? req.body.new_title : req.body.title;
    const year = req.body.new_year ? req.body.new_year : req.body.year;
    await db.query("INSERT INTO gallery (public_id,title,year,url) VALUES($1,$2,$3,$4)", [uploadResult.public_id, title, year, uploadResult.url]);
  }

  if (req.body.upload === "Add_Staff") {
    let uploadResult = "";
    if (req.body.designation === "principal" || req.body.designation === "inCharge-principal") {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      uploadResult = await Upload(dataURI);
    }
    const designation = req.body.new_designation ? req.body.new_designation : req.body.designation;
    const message = req.body.message ? req.body.message : "";
    const name = req.body.staff_name;
    const email = req.body.staff_email;
    const phone = req.body.staff_number;
    const public_id = uploadResult.public_id;
    const url = uploadResult.url;
    await db.query("INSERT INTO staff (public_id,name,type,email,mobile,message,url) VALUES($1,$2,$3,$4,$5,$6,$7)", [public_id, name, designation, email, phone, message, url]);
  }
  res.redirect("/admin");
})

app.post("/login", async (req, res) => {
  const user = req.body["admin"];
  const password = req.body["password"];
  const storedAdmin = await db.query("SELECT * FROM admin WHERE admin = $1", [user]);
  if (storedAdmin.rows.length > 0) {
    const storedPassword = (await db.query("SELECT password FROM admin")).rows[0].password;
    bcrypt.compare(password, storedPassword, async (err, result) => {
      if (err) {
        console.error("Error comparing passwords:", err);
      } else {
        if (result) {
          const year = await getYear();
          const tl = await getTitle();
          const title = [];
          tl.forEach(t => {
            title.push(t.title)
          })
          res.render("admin.ejs", { year: year, title: title });
        } else {
          res.send("Incorrect Password");
        }
      }
    });
  }
  else {
    res.send("Invalid username");
  }
})

app.patch("/update", (req, res) => {

})

app.delete("/delete", (req, res) => {

})



app.post("/sendMessage", (req, res) => {
  const transporter = MailTransport();
  const mailOptions = {
    from: 'govindpurdiet@gmail.com' , 
    to: 'dietdhanbad@gmail.com',                
    subject: 'Hello from Node.js',              
    text: 'This is a test email sent using Nodemailer!', 
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Error occurred:', error.message);
    }
    res.json({ Message: "Message Sent" });
  });

})
app.listen(port, (req, res) => {
  console.log(`Server listening on port ${port}`)
})