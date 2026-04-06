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
const PORT = process.env.PORT || 3000;
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
app.get("/notice", async(req, res) => {
  const result = await db.query("SELECT * FROM notice");
  const notices = result.rows;
  console.log(notices);
  console.log(new Date());
  res.render("notice",{date:new Date(),notice:notices})
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

app.post("/upload", upload.fields([{name:"image",name:"notice-doc"}]), async (req, res) => {
  console.log(req);
  const gallery_folder = "Gallery";
  const notice_folder = "Notice";
  if (req.body.upload === "Upload_Image") {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const uploadResult = await Upload(dataURI,gallery_folder,"image");
    const title = req.body.new_title ? req.body.new_title : req.body.title;
    const year = req.body.new_year ? req.body.new_year : req.body.year;
    await db.query("INSERT INTO gallery (public_id,title,year,url) VALUES($1,$2,$3,$4)", [uploadResult.public_id, title, year, uploadResult.url]);
  }

  if (req.body.upload === "Add_Staff") {
    let uploadResult = "";
    if (req.body.designation === "principal" || req.body.designation === "inCharge-principal") {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      uploadResult = await Upload(dataURI,gallery_folder,"image");
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
  if (req.body.upload === "addNotice") {
    console.log("Trying to upload");
    
    let uploadResult = "";
    const description = req.body["description"];
    const date = req.body["date"];
    try {
    const dataURI =  req.files["notice-doc"][0].buffer;
    uploadResult = await Upload(notice_folder,"raw",dataURI);
    console.log(uploadResult);
    } catch (error) {
      console.log(error);      
       const result= await db.query("INSERT INTO Notice (description,date,url) VALUES($1,$2,$3)",[description,date,uploadResult]);
    }   
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
  const senderEmail = req.body["email"];
  const senderName = req.body["name"];
  const phone = req.body["phone"];
  const subject = req.body["subject"];
  const message = req.body["message"];

  const mailOptions = {
    from: 'govindpurdiet@gmail.com' , 
    to: '2306221@kiit.ac.in',                
    subject: `${subject}`,              
    text: `Message sent from ${senderName}\n${senderEmail}\n${phone}`+`${message}`, 
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Error occurred:', error.message);
    }
    res.render( "contact.ejs",{Message: "Message Sent" });
  });

})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});